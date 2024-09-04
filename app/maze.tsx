"use client"

import React, {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";

import anime from 'animejs/lib/anime.es.js';
import { AnimatePresence, motion } from "framer-motion"

type Pos = [number, number];

const cellSize = 26; // Size of each cell in the SVG
const offset = 0.2 * cellSize; // Offset for the outline
let radius = 0.5 * cellSize - offset;
let radius_inner = offset;

const findClusters = (shape: Pos, walls: Pos[]) => {
  const [width, height] = shape;
  const clusters: Pos[][] = [];
  const visited = new Set<string>();

  const directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0]
  ];

  const inBounds = (x: number, y: number) => x >= 0 && x < width && y >= 0 && y < height;

  const dfs = (x: number, y: number, cluster: Pos[]) => {
    if (!inBounds(x, y) || visited.has(`${x},${y}`) || !walls.some(([bx, by]) => bx === x && by === y)) {
      return;
    }
    visited.add(`${x},${y}`);
    cluster.push([x, y]);
    for (const [dx, dy] of directions) {
      dfs(x + dx, y + dy, cluster);
    }
  };

  for (const [x, y] of walls) {
    if (!visited.has(`${x},${y}`)) {
      const cluster: Pos[] = [];
      dfs(x, y, cluster);
      clusters.push(cluster);
    }
  }

  return clusters;
};

// Generate the path for a single cluster using a perimeter tracing algorithm with inner and outer boundaries
const createPath = (cluster: Pos[]) => {
  const visitedCorners = new Set<string>();
  const visitedCells = new Set<string>();


  /* Corners:

    Reference points

    +-4-----+-------+
    |       0       7
    |       |       |
    |       |       |
    +-1-----+-----3-+
    |       |       |
    |       |       |
    5       2       |
    +-------+-----6-+

  */

  const refPoint0 = [0.5 * cellSize, offset];
  const refPoint1 = [offset, 0.5 * cellSize];
  const refPoint2 = [0.5 * cellSize, cellSize - offset];
  const refPoint3 = [cellSize - offset, 0.5 * cellSize];

  const refPoint4 = [offset, 0];
  const refPoint5 = [0, cellSize - offset];
  const refPoint6 = [cellSize - offset, cellSize];
  const refPoint7 = [cellSize, offset];

  const refPoints = [
    refPoint0, refPoint1, refPoint2, refPoint3,
    refPoint4, refPoint5, refPoint6, refPoint7
  ];

  type PathMove = { next: [Pos, number], path: string };

  const makeNextLine = (x: number, y: number, nextRefPoint: number): PathMove => {
    const px = x * cellSize + refPoints[nextRefPoint][0];
    const py = y * cellSize + refPoints[nextRefPoint][1];
    return { next: [[x, y], nextRefPoint], path: `L ${px},${py}` };
  }

  const makeNextCurve = (x: number, y: number, nextRefPoint: number): PathMove => {
    const px = x * cellSize + refPoints[nextRefPoint][0];
    const py = y * cellSize + refPoints[nextRefPoint][1];
    return { next: [[x, y], nextRefPoint], path: `A ${radius},${radius} 0 0 0 ${px},${py}` };
  }

  const makeNextCurveInner = (x: number, y: number, nextRefPoint: number): PathMove => {
    const px = x * cellSize + refPoints[nextRefPoint][0];
    const py = y * cellSize + refPoints[nextRefPoint][1];
    return { next: [[x, y], nextRefPoint], path: `A ${radius_inner},${radius_inner} 0 0 1 ${px},${py}` };
  }

  const move = (x: number, y: number, corner: number): PathMove | undefined => {
    switch (corner) {
      case 0:
        // exit if wall to the top
        if (cluster.some(([bx, by]) => bx === x && by === y - 1)) return;
        // check if there is a wall to the left
        if (cluster.some(([bx, by]) => bx === x - 1 && by === y)) {
          return makeNextLine(x - 1, y, 7);
        } else {
          return makeNextCurve(x, y, 1);
        }

      case 1:
        // exit if wall to the left
        if (cluster.some(([bx, by]) => bx === x - 1 && by === y)) return;
        // check if there is a wall to the bottom
        if (cluster.some(([bx, by]) => bx === x && by === y + 1)) {
          return makeNextLine(x, y + 1, 4);
        } else {
          return makeNextCurve(x, y, 2);
        }

      case 2:
        // exit if wall to the bottom
        if (cluster.some(([bx, by]) => bx === x && by === y + 1)) return;
        // check if there is a wall to the right
        if (cluster.some(([bx, by]) => bx === x + 1 && by === y)) {
          return makeNextLine(x + 1, y, 5);
        } else {
          return makeNextCurve(x, y, 3);
        }

      case 3:
        // exit if wall to the right
        if (cluster.some(([bx, by]) => bx === x + 1 && by === y)) return;
        // check if there is a wall to the top
        if (cluster.some(([bx, by]) => bx === x && by === y - 1)) {
          return makeNextLine(x, y - 1, 6);
        } else {
          return makeNextCurve(x, y, 0);
        }

      case 4:
        // check if there is a wall to the left
        if (cluster.some(([bx, by]) => bx === x - 1 && by === y)) {
          return makeNextCurveInner(x - 1, y, 7);
        } else {
          return makeNextLine(x, y, 1);
        }

      case 5:
        // check if there is a wall to the bottom
        if (cluster.some(([bx, by]) => bx === x && by === y + 1)) {
          return makeNextCurveInner(x, y + 1, 4);
        } else {
          return makeNextLine(x, y, 2);
        }

      case 6:
        // check if there is a wall to the right
        if (cluster.some(([bx, by]) => bx === x + 1 && by === y)) {
          return makeNextCurveInner(x + 1, y, 5);
        } else {
          return makeNextLine(x, y, 3);
        }

      case 7:
        // check if there is a wall to the top
        if (cluster.some(([bx, by]) => bx === x && by === y - 1)) {
          return makeNextCurveInner(x, y - 1, 6);
        } else {
          return makeNextLine(x, y, 0);
        }
    }
  };

  if (cluster.length === 1) {
    // Widen the dot so that it does not look like food
    const [x, y] = cluster[0];

    const px = x * cellSize + 0.5 * cellSize;
    const py = y * cellSize + offset;

    return [
      `M ${px},${py}`,
      `l ${-offset} 0`,
      `a 1,1 0 0 0 0,${cellSize - 2 * offset}`,
      `l ${2 * offset} 0`,
      `a 1,1 0 0 0 0,${- cellSize + 2 * offset}`,
      `Z`
    ].join(" ");
  }

  const pathCommands = cluster.flatMap((startCell) => {
    // iterate through all possible starting points in all cells (unless already visited)
    const paths = [0, 1, 2, 3].map(startRefPoint => {
      let [x, y] = startCell;
      if (visitedCorners.has(`${x},${y},${startRefPoint}`)) return "";

      let refPoint = startRefPoint;

      const px = x * cellSize + refPoints[refPoint][0];
      const py = y * cellSize + refPoints[refPoint][1];

      let pathCommands = [];
      pathCommands.push([`M ${px},${py}`]);

      do {
        const node = `${x},${y},${refPoint}`;
        if (visitedCorners.has(node)) {
          break;
        }

        visitedCorners.add(node);
        visitedCells.add(`${x},${y}`);

        let pathMove = move(x, y, refPoint);
        if (!pathMove) return "";
        let path = "";
        ({ next: [[x, y], refPoint], path: path } = pathMove);

        pathCommands.push([path]);
      } while (!(x === startCell[0] && y === startCell[1] && refPoint === startRefPoint));

      pathCommands.push(["Z"]); // Close the path

      const joined = pathCommands.join(" ");
      return joined;
    });
    return paths;
  });

  return pathCommands.join(" ");
};

function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value; //assign the value of ref to the argument
  }, [value]); //this code will run when the value of 'value' changes
  return ref.current; //in the end, return the current ref value.
}

function Food({ position, color }: { position: Pos, color: string }) {
  const [x, y] = position;
  return (
    <motion.circle
      cx={(0.5 + x) * cellSize}
      cy={(0.5 + y) * cellSize}

      r={cellSize / 5}
      opacity={1}
      className={color}
      // transition={{ duration: 1 }}
      initial={{ opacity: 1, r: cellSize / 5 }}
      // animate={{ opacity: 1 }}
      exit={{ opacity: 0, r: cellSize }}
    />
  )
}

// // from https://www.30secondsofcode.org/react/s/use-interval-explained/
// const useInterval = (callback: any, delay: number) => {
//   const savedCallback = React.useRef();

//   React.useEffect(() => {
//     savedCallback.current = callback;
//   }, [callback]);

//   React.useEffect(() => {
//     function tick() {
//       savedCallback?.current();
//     }
//     if (delay !== null) {
//       let id = setInterval(tick, delay);
//       return () => clearInterval(id);
//     }
//   }, [delay]);
// };

function Pacman({ direction, mouthAngle, color }: { direction: number, mouthAngle: number, color: string }) {

  const pacmanPath = (angle: number) => {
    const angle_rad = angle / 180 * Math.PI;
    const radius = 8;
    const x = radius * Math.cos(angle_rad / 2);
    const y = radius * Math.sin(angle_rad / 2);
    return `M 0,0 L ${x},${-y} A ${radius},${radius} 0 1 0 ${x},${y} Z`;
  }

  return (
    <g transform={ `rotate(${direction})` }
      className={color}>
      <path
        d={pacmanPath(mouthAngle)}
        stroke="black"
        strokeWidth={0.2}
      />
      <motion.circle cx={2.7} cy={direction < 160 ? -4.5 : 4.5} r={1.5}
        className={`eye`}
        stroke="black"
        fill="yellow"
        strokeWidth={0.2}
      />
    </g>)
}

function Ghost({ direction, color }: { direction: number, color: string }) {
  return (<g
  id="ghost"
  className={`${color} ghost`}
>

{/* Round path: // M -8 0 C -8 -4.4 -4.4 -8 0 -8 C 4.4 -8 8 -4.4 8 0 L 8 8 C 8 9 6.6667 5.6 6 5.6 S 4.6667 8.19 4 8.19 S 2.6667 5.6 2 5.6 S 0.6667 8.19 0 8.19 S -1.3333 5.6 -2 5.6 S -3.3333 8.19 -4 8.19 S -5.3333 5.6 -6 5.6 S -8 9 -8 8 C -8 5.3333 -8 2.6667 -8 0 Z  */}
{/* Straight path: // M -8 0 C -8 -4.4 -4.4 -8 0 -8 C 4.4 -8 8 -4.4 8 0 L 8 8 L 6 5.6 L 4 8 L 2 5.6 L 0 8 L -2 5.6 L -4 8 L -6 5.6 L -8 8 L -8 0 Z */}

  <path d="M -8 0 C -8 -4.4 -4.4 -8 0 -8 C 4.4 -8 8 -4.4 8 0 L 8 8 C 8 9 6.6667 5.6 6 5.6 S 4.6667 8.19 4 8.19 S 2.6667 5.6 2 5.6 S 0.6667 8.19 0 8.19 S -1.3333 5.6 -2 5.6 S -3.3333 8.19 -4 8.19 S -5.3333 5.6 -6 5.6 S -8 9 -8 8 C -8 5.3333 -8 2.6667 -8 0 Z"


    stroke="black"
    strokeWidth={0.2}
    opacity={0.9}
  ></path>
  <path d="M -3.2 1.1 C -2.2 1.1 -1.4 0.1 -1.4 -1.2 C -1.4 -2.5 -2.2 -3.6 -3.2 -3.6 C -4.2 -3.6 -5.1 -2.5 -5.1 -1.2 C -5.1 0.1 -4.2 1.1 -3.2 1.1 Z
M 1.8 1.1 C 2.8 1.1 3.6 0.1 3.6 -1.2 C 3.6 -2.5 2.8 -3.6 1.8 -3.6 C 0.8 -3.6 -0 -2.5 -0 -1.2 C -0 0.1 0.8 1.1 1.8 1.1 Z"
    stroke="black"
    strokeWidth={0.2}
    fill="white"
  ></path>
  <path d="M -3.5 0 C -3.1 0 -2.8 -0.4 -2.8 -0.9 C -2.8 -1.5 -3.1 -1.9 -3.5 -1.9 C -3.9 -1.9 -4.2 -1.5 -4.2 -0.9 C -4.2 -0.4 -3.9 0 -3.5 0 Z
M 1.5 0 C 1.9 0 2.2 -0.4 2.2 -0.9 C 2.2 -1.5 1.9 -1.9 1.5 -1.9 C 1.1 -1.9 0.8 -1.5 0.8 -0.9 C 0.8 -0.4 1.1 0 1.5 0 Z"
    stroke="black"
    strokeWidth={0.2}
    fill="black"
  >
  </path>
</g>);
}

function Bot({ position, color, say, width, turnsAgo, fadeIn }: { position: Pos, color: string, say: string, width: number, turnsAgo: number, fadeIn: boolean }) {
  const leftSide = position[0] < width / 2;
  const inHomezone = () => {
    switch (color) {
      case "blue":
        return leftSide;

      case "red":
        return !leftSide;
    }
  }
  const [direction, setDirection] = useState(leftSide ? 0 : 180);
  const oldPosition = usePrevious(position);

  // const [mouthAngleTL, setMouthAngleTL] = useState(0);
  // useInterval(() => setMouthAngleTL(mouthAngleTL + 0.08), 10);

  const mouthAngle = 50; // Math.abs(50 * Math.sin(mouthAngleTL));

  useEffect(() => {
    if (oldPosition) {
      const dx = position[0] - oldPosition[0];
      const dy = position[1] - oldPosition[1];
      if (dx < 0) setDirection(180);
      else if (dy < 0) setDirection(270);
      else if (dx > 0) setDirection(0);
      else if (dy > 0) setDirection(90);
    }
  }, [position, oldPosition]);

  useEffect(() => {
    if (fadeIn)
    anime.timeline()
      .add({
        targets: '.bot .blue',
        opacity: [0, 1],
        easing: 'linear',
        duration: 2000,
      }, 3500)
      .add({
        targets: '.bot .red',
        opacity: [0, 1],
        easing: 'linear',
        duration: 2000,
      }, 3500);
  }, [fadeIn]);

  return (
    <motion.g
      transform={ `translate(${(position[0] + 0.5) * cellSize} ${(position[1] + 0.5) * cellSize}) scale(${cellSize / 16})` }
      className="bot"
      animate={{
        x: (position[0] + 0.5) * cellSize,
        y: (position[1] + 0.5) * cellSize,
        scale: cellSize / 16
      }}
      initial={{
        x: (position[0] + 0.5) * cellSize,
        y: (position[1] + 0.5) * cellSize,
        scale: cellSize / 16
      }}
      transition={{ duration: 0.1 }}
    >
      {
        inHomezone()
        ? (<Ghost direction={direction} color={`${color} ghost`}></Ghost>)
        : (<Pacman direction={direction} mouthAngle={mouthAngle} color={`${color} pacman`}></Pacman>)
      }
      <text y="-10" className="sayBg">{say}</text>
      <text y="-10" className="say">{say}</text>
    </motion.g>
  )
}

function Walls({ shape, walls }: { shape: Pos, walls: Pos[] }) {
  const clusters = useMemo(() => findClusters(shape, walls), [shape, walls]);
  const [width, height] = shape;

  return (
    <g className="maze">
      <line x1={(width) * cellSize / 2} y1={0.3 * cellSize}
            x2={width * cellSize / 2} y2={(height - 0.3) * cellSize} className="middleLine blackLine" />
      <line x1={(width - 0.1)  * cellSize / 2} y1={0.3 * cellSize}
            x2={(width - 0.1) * cellSize / 2} y2={(height - 0.3) * cellSize} className="middleLine blueLine" />
      <line x1={(width + 0.1)  * cellSize / 2} y1={0.3 * cellSize}
            x2={(width + 0.1) * cellSize / 2} y2={(height - 0.3) * cellSize} className="middleLine redLine" />
    {walls.map(([x, y], index) => (
      <rect
        key={`${x},${y}`}
        x={x * cellSize}
        y={y * cellSize}
        width={cellSize}
        height={cellSize}
        opacity="0"
        // fill="lightblue"
        stroke="lightgrey"
      />
    ))}
    {clusters.map((cluster, index) => (
      <path
        className="maze"
        key={`${cluster[0]},${cluster[1]}-${cluster.length}`}
        d={createPath(cluster)}
        // stroke="lightblue"
        // stroke={ dark_mode ? "url(#grad)" : "black" }
        stroke="url(#grad)"
        strokeWidth="2"
        //fill={ dark_mode ? "#ffa" : "black" }
        fill="black"
        strokeLinecap="round"
        strokeLinejoin="bevel"
      />
    ))}
  </g>
  );
}


function Maze({ game_uuid, shape, walls, food, bots, team_names, say, whowins, gameover, round, turn, animate }:
  {
    game_uuid: string,
    shape: Pos,
    walls: Pos[],
    food: Pos[],
    bots: [Pos, Pos, Pos, Pos],
    team_names: [string, string],
    say: [string, string, string, string],
    whowins: number | null,
    gameover: boolean,
    round: number,
    turn: number,
    animate: boolean
  }
) {
  const [width, height] = shape;
  const [a, x, b, y] = bots;
  const [sayA, sayX, sayB, sayY] = say;

  const mazeBoxRef = useRef<HTMLDivElement>(null);
  // used so that we can revert the animation
  const [hasWonScreen, setHasWonScreen] = useState(false);

  useEffect(() => {
    if (game_uuid && animate) {
      let pathAnimation = anime.timeline()
        .add({
          targets: mazeBoxRef.current?.querySelectorAll('.maze path'),
          strokeDashoffset: [anime.setDashoffset, 0],
          easing: 'easeInCubic',
          duration: 2000,
          delay: function (el, i) { return i * 25 },
          direction: 'alternate',
          loop: false
        })
        .add({
          targets: mazeBoxRef.current?.querySelectorAll('.maze path'),
          //fill: ['rgb(214, 219, 220)', "#faa"], // ffa
          fillOpacity: [0, 0.7], // ffa
          easing: 'linear',
          duration: 2000
        }, 2000)
        .add({
          targets: mazeBoxRef.current?.querySelectorAll('.maze path'),
          strokeWidth: 0,
          easing: 'linear',
          duration: 2000
        }, 4000)
        .add({
          targets: mazeBoxRef.current?.querySelectorAll('.foodblue'),
          opacity: [0, 1],
          easing: 'linear',
          duration: 2000,
        }, 3000)
        .add({
          targets: mazeBoxRef.current?.querySelectorAll('.foodred'),
          opacity: [0, 1],
          easing: 'linear',
          duration: 2000,
        }, 3000)
        .add({
          targets: mazeBoxRef.current?.querySelectorAll('.blue'),
          opacity: [0, 1],
          easing: 'linear',
          duration: 2000,
        }, 3500)
        .add({
          targets: mazeBoxRef.current?.querySelectorAll('.red'),
          opacity: [0, 1],
          easing: 'linear',
          duration: 2000,
        }, 3500)
        .add({
          targets: mazeBoxRef.current?.querySelectorAll('.middleLine'),
          opacity: [0, 1],
          easing: 'linear',
          duration: 2000,
        }, 3500);
    }
  }, [walls, game_uuid, animate, mazeBoxRef]);


  useEffect(() => {
    if (!gameover && hasWonScreen) {
      let pathAnimation = anime.timeline()
        .add({
          targets: mazeBoxRef.current?.querySelectorAll('.maze path'),
          fill: ["#000"],
          easing: 'linear',
          duration: 200
        });
    };
    if (gameover) {
      setHasWonScreen(true);
    }
    if (gameover && whowins === 0) {
      let pathAnimation = anime.timeline()
        .add({
          targets: mazeBoxRef.current?.querySelectorAll('.maze path'),
          fill: ["#000", "rgb(94, 158, 217)"],
          easing: 'linear',
          duration: 200
        });
    };
    if (gameover && whowins === 1) {
      let pathAnimation = anime.timeline()
        .add({
          targets: mazeBoxRef.current?.querySelectorAll('.maze path'),
          fill: ["#000", "rgb(235, 90, 90)"],
          easing: 'linear',
          duration: 200
        });
    };
    if (gameover && whowins === 2) {
      let pathAnimation = anime.timeline()
        .add({
          targets: mazeBoxRef.current?.querySelectorAll('.maze path'),
          fill: ["#000", "#ffa"],
          easing: 'linear',
          duration: 200
        });
    };
  }, [gameover, whowins, mazeBoxRef, hasWonScreen]);


  return (
    <div ref={mazeBoxRef} className="mazebox object-fill">
      <svg
        // width={width * cellSize}
        // height={height * cellSize}
        viewBox={`0 0 ${width * cellSize} ${height * cellSize}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        <style type="text/css">{`
        line {
            stroke: #000000;
            stroke-linecap: round;
            stroke-width: 3;
        }
        .foodblue {
            // stroke: black;
            fill: rgb(94, 158, 217);
        }
        .foodred {
            // stroke: black;
            fill: rgb(235, 90, 90);
        }
        .blue {
            fill: rgb(94, 158, 217);
        }
        .red {
            fill: rgb(235, 90, 90);
        }
        .blueLine {
            stroke: rgb(94, 158, 217);
        }
        .redLine {
            stroke: rgb(235, 90, 90);
        }
        .sayBg {
          stroke-width: 1.7px;
          stroke: white;
          font-size: 7px;
          text-anchor: middle;
          dominant-baseline: middle;
          z-index: 90;
        }
        .say {
          // stroke-width: 0.2px;
          // stroke: white;
          font-size: 7px;
          text-anchor: middle;
          dominant-baseline: middle;
          z-index: 100;
        }

        .gameover {
          fill: #FFC903;
          stroke: #ED1B22;
          stroke-width: 10px;
          stroke-linejoin: round;
          paint-order: stroke;
        }
    `}</style>


        <defs>
          <linearGradient id="grad" gradientUnits="userSpaceOnUse">
            <stop stopColor="blue" offset="0" />
            <stop stopColor="blue" offset="50%" />
            <stop stopColor="red" offset="50%" />
            <stop stopColor="red" offset="100%" />
          </linearGradient>
        </defs>

        <Walls shape={shape} walls={walls}></Walls>
        <AnimatePresence>
          {food.map(([x, y], index) => (
            <Food key={`${x},${y}`} position={[x, y]} color={x < width / 2 ? "foodblue" : "foodred"}></Food>
          ))}
        </AnimatePresence>

          <Bot position={a} key="botA" color="blue" say={sayA} width={width} fadeIn={animate} turnsAgo={turn}></Bot>
          <Bot position={x} key="botX" color="red" say={sayX} width={width} fadeIn={animate} turnsAgo={(turn + 3) % 4}></Bot>
          <Bot position={b} key="botB" color="blue" say={sayB} width={width} fadeIn={animate} turnsAgo={(turn + 2) % 4}></Bot>
          <Bot position={y} key="botY" color="red" say={sayY} width={width} fadeIn={animate} turnsAgo={(turn + 1) % 4}></Bot>

        {
          gameover ? (<>
          <text fontSize="60" className="gameover"
            x="50%" y="25%"
            dominantBaseline="middle"
            textAnchor="middle"
          >
            GAME OVER
          </text>
          <text fontSize="60" className="gameover"
            x="50%" y="75%"
            dominantBaseline="middle"
            textAnchor="middle"
          >
            { whowins == null || whowins == 2 ? "DRAW" : `${team_names[whowins]} wins!` }
          </text>
          </>) : null
        }

      </svg>
    </div>
  );
};
export default Maze;

