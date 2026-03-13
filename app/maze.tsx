'use client';

import { animate, createScope, createTimeline, Scope, svg, Timeline } from 'animejs';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { Pos, Side } from './pelita_msg';

const cellSize = 26; // Size of each cell in the SVG
const offset = 0.2 * cellSize; // Offset for the outline
const radius = 0.5 * cellSize - offset;
const radius_inner = offset;

const findClusters = (shape: Pos, walls: Pos[]) => {
  const [width, height] = shape;
  const clusters: Pos[][] = [];
  const visited = new Set<string>();

  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  const inBounds = (x: number, y: number) => x >= 0 && x < width && y >= 0 && y < height;

  const dfs = (x: number, y: number, cluster: Pos[]) => {
    if (
      !inBounds(x, y) ||
      visited.has(`${x},${y}`) ||
      !walls.some(([bx, by]) => bx === x && by === y)
    ) {
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
    refPoint0,
    refPoint1,
    refPoint2,
    refPoint3,
    refPoint4,
    refPoint5,
    refPoint6,
    refPoint7,
  ];

  interface PathMove {
    next: [Pos, number];
    path: string;
  }

  const makeNextLine = (x: number, y: number, nextRefPoint: number): PathMove => {
    const px = x * cellSize + refPoints[nextRefPoint][0];
    const py = y * cellSize + refPoints[nextRefPoint][1];
    return { next: [[x, y], nextRefPoint], path: `L ${px},${py}` };
  };

  const makeNextCurve = (x: number, y: number, nextRefPoint: number): PathMove => {
    const px = x * cellSize + refPoints[nextRefPoint][0];
    const py = y * cellSize + refPoints[nextRefPoint][1];
    return { next: [[x, y], nextRefPoint], path: `A ${radius},${radius} 0 0 0 ${px},${py}` };
  };

  const makeNextCurveInner = (x: number, y: number, nextRefPoint: number): PathMove => {
    const px = x * cellSize + refPoints[nextRefPoint][0];
    const py = y * cellSize + refPoints[nextRefPoint][1];
    return {
      next: [[x, y], nextRefPoint],
      path: `A ${radius_inner},${radius_inner} 0 0 1 ${px},${py}`,
    };
  };

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
      `a 1,1 0 0 0 0,${-cellSize + 2 * offset}`,
      `Z`,
    ].join(' ');
  }

  const pathCommands = cluster.flatMap(startCell => {
    // iterate through all possible starting points in all cells (unless already visited)
    const paths = [0, 1, 2, 3].map(startRefPoint => {
      let [x, y] = startCell;
      if (visitedCorners.has(`${x},${y},${startRefPoint}`)) return '';

      let refPoint = startRefPoint;

      const px = x * cellSize + refPoints[refPoint][0];
      const py = y * cellSize + refPoints[refPoint][1];

      const pathCommands = [];
      pathCommands.push([`M ${px},${py}`]);

      do {
        const node = `${x},${y},${refPoint}`;
        if (visitedCorners.has(node)) {
          break;
        }

        visitedCorners.add(node);
        visitedCells.add(`${x},${y}`);

        const pathMove = move(x, y, refPoint);
        if (!pathMove) return '';
        let path = '';
        ({
          next: [[x, y], refPoint],
          path: path,
        } = pathMove);

        pathCommands.push([path]);
      } while (!(x === startCell[0] && y === startCell[1] && refPoint === startRefPoint));

      pathCommands.push(['Z']); // Close the path

      const joined = pathCommands.join(' ');
      return joined;
    });
    return paths;
  });

  return pathCommands.join(' ');
};

function usePrevious<T>(value: T) {
  const ref = useRef<T>(null);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

function Food({ position, side }: { position: Pos; side: Side }) {
  const [x, y] = position;
  const classes = side === 'blue' ? 'food fill-blue' : 'food fill-red';
  const exitAnim = { opacity: 0, scale: 5 };
  return (
    <motion.circle
      cx={(0.5 + x) * cellSize}
      cy={(0.5 + y) * cellSize}
      stroke="black"
      r={cellSize / 5}
      opacity={1}
      className={classes}
      initial={false}
      exit={exitAnim}
    />
  );
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

function Pacman({
  direction,
  mouthAngle,
  side,
}: {
  direction: number;
  mouthAngle: number;
  side: Side;
}) {
  const pacmanPath = (angle: number) => {
    const angle_rad = (angle / 180) * Math.PI;
    const radius = 8;
    const x = radius * Math.cos(angle_rad / 2);
    const y = radius * Math.sin(angle_rad / 2);
    return `M 0,0 L ${x},${-y} A ${radius},${radius} 0 1 0 ${x},${y} Z`;
  };

  const classes = side === 'blue' ? 'pacman fill-blue' : 'pacman fill-red';

  return (
    <g transform={`rotate(${direction})`} className={classes}>
      <path d={pacmanPath(mouthAngle)} stroke="black" strokeWidth={0.2} />
      <motion.circle
        cx={2.7}
        cy={direction < 160 ? -4.5 : 4.5}
        r={1.5}
        className={`eye`}
        stroke="black"
        fill="yellow"
        strokeWidth={0.2}
      />
    </g>
  );
}

function Ghost({ side }: { side: Side }) {
  const classes = side === 'blue' ? 'ghost fill-blue' : 'ghost fill-red';

  return (
    <g className={classes}>
      {/* Round path: // M -8 0 C -8 -4.4 -4.4 -8 0 -8 C 4.4 -8 8 -4.4 8 0 L 8 8 C 8 9 6.6667 5.6 6 5.6 S 4.6667 8.19 4 8.19 S 2.6667 5.6 2 5.6 S 0.6667 8.19 0 8.19 S -1.3333 5.6 -2 5.6 S -3.3333 8.19 -4 8.19 S -5.3333 5.6 -6 5.6 S -8 9 -8 8 C -8 5.3333 -8 2.6667 -8 0 Z  */}
      {/* Straight path: // M -8 0 C -8 -4.4 -4.4 -8 0 -8 C 4.4 -8 8 -4.4 8 0 L 8 8 L 6 5.6 L 4 8 L 2 5.6 L 0 8 L -2 5.6 L -4 8 L -6 5.6 L -8 8 L -8 0 Z */}

      <path
        d="M -8 0 C -8 -4.4 -4.4 -8 0 -8 C 4.4 -8 8 -4.4 8 0 L 8 8 C 8 9 6.6667 5.6 6 5.6 S 4.6667 8.19 4 8.19 S 2.6667 5.6 2 5.6 S 0.6667 8.19 0 8.19 S -1.3333 5.6 -2 5.6 S -3.3333 8.19 -4 8.19 S -5.3333 5.6 -6 5.6 S -8 9 -8 8 C -8 5.3333 -8 2.6667 -8 0 Z"
        stroke="black"
        strokeWidth={0.2}
        opacity={0.9}
      ></path>
      <path
        d="M -3.2 1.1 C -2.2 1.1 -1.4 0.1 -1.4 -1.2 C -1.4 -2.5 -2.2 -3.6 -3.2 -3.6 C -4.2 -3.6 -5.1 -2.5 -5.1 -1.2 C -5.1 0.1 -4.2 1.1 -3.2 1.1 Z
M 1.8 1.1 C 2.8 1.1 3.6 0.1 3.6 -1.2 C 3.6 -2.5 2.8 -3.6 1.8 -3.6 C 0.8 -3.6 -0 -2.5 -0 -1.2 C -0 0.1 0.8 1.1 1.8 1.1 Z"
        stroke="black"
        strokeWidth={0.2}
        fill="white"
      ></path>
      <path
        d="M -3.5 0 C -3.1 0 -2.8 -0.4 -2.8 -0.9 C -2.8 -1.5 -3.1 -1.9 -3.5 -1.9 C -3.9 -1.9 -4.2 -1.5 -4.2 -0.9 C -4.2 -0.4 -3.9 0 -3.5 0 Z
M 1.5 0 C 1.9 0 2.2 -0.4 2.2 -0.9 C 2.2 -1.5 1.9 -1.9 1.5 -1.9 C 1.1 -1.9 0.8 -1.5 0.8 -0.9 C 0.8 -0.4 1.1 0 1.5 0 Z"
        stroke="black"
        strokeWidth={0.2}
        fill="black"
      ></path>
    </g>
  );
}

function Bot({ position, side, width }: { position: Pos; side: Side; width: number }) {
  const leftSide = position[0] < width / 2;
  const inHomezone = () => {
    switch (side) {
      case 'blue':
        return leftSide;

      case 'red':
        return !leftSide;
    }
  };
  const [direction, setDirection] = useState(leftSide ? 0 : 180);
  const oldPosition = usePrevious(position);

  // const [mouthAngleTL, setMouthAngleTL] = useState(0);
  // useInterval(() => setMouthAngleTL(mouthAngleTL + 0.08), 10);

  const mouthAngle = 50; // Math.abs(50 * Math.sin(mouthAngleTL));

  const self = useRef<SVGGElement>(null);

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

  return (
    <motion.g
      ref={self}
      transform={`translate(${(position[0] + 0.5) * cellSize} ${(position[1] + 0.5) * cellSize}) scale(${cellSize / 16})`}
      className="bot"
      animate={{
        x: (position[0] + 0.5) * cellSize,
        y: (position[1] + 0.5) * cellSize,
        scale: cellSize / 16,
      }}
      initial={false}
      // initial={{
      //   x: (position[0] + 0.5) * cellSize,
      //   y: (position[1] + 0.5) * cellSize,
      //   scale: cellSize / 16
      // }}
      transition={{ duration: 0.1 }}
    >
      {inHomezone() ? (
        <Ghost side={side}></Ghost>
      ) : (
        <Pacman direction={direction} mouthAngle={mouthAngle} side={side}></Pacman>
      )}
    </motion.g>
  );
}

function BotSay({ position, say }: { position: Pos; say: string }) {
  const self = useRef<SVGGElement>(null);

  return (
    <motion.g
      ref={self}
      transform={`translate(${(position[0] + 0.5) * cellSize} ${(position[1] + 0.5) * cellSize}) scale(${cellSize / 16})`}
      className="bot"
      animate={{
        x: (position[0] + 0.5) * cellSize,
        y: (position[1] + 0.5) * cellSize,
        scale: cellSize / 16,
      }}
      initial={false}
      // initial={{
      //   x: (position[0] + 0.5) * cellSize,
      //   y: (position[1] + 0.5) * cellSize,
      //   scale: cellSize / 16
      // }}
      transition={{ duration: 0.1 }}
    >
      <text y="-15" className="say-bg">
        {say}
      </text>
      <text y="-15" className="say">
        {say}
      </text>
    </motion.g>
  );
}

function Walls({ shape, walls }: { shape: Pos; walls: Pos[] }) {
  const clusters = useMemo(() => findClusters(shape, walls), [shape, walls]);
  const [width, height] = shape;
  const showWallCells = false;

  return (
    <>
      <g className="maze-elems">
        <line
          x1={(width * cellSize) / 2}
          y1={offset}
          x2={(width * cellSize) / 2}
          y2={height * cellSize - offset}
          strokeWidth={cellSize / 6}
          className="maze-border"
        />

        {showWallCells &&
          walls.map(([x, y]) => (
            <rect
              key={`${x},${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              className="wall-cell"
            />
          ))}

        <g className="wall-main">
          {clusters.map(cluster => (
            <path
              className="wall"
              key={`${cluster[0]},${cluster[1]}-${cluster.length}`}
              d={createPath(cluster)}
            />
          ))}
        </g>
        <g className="wall-overlay">
          {clusters.map(cluster => (
            <path
              className="wall"
              key={`${cluster[0]},${cluster[1]}-${cluster.length}`}
              d={createPath(cluster)}
            />
          ))}
        </g>
      </g>
    </>
  );
}

function Maze({
  game_uuid,
  shape,
  walls,
  food,
  bots,
  team_names,
  say,
  whowins,
  gameover,
  round,
  turn,
  do_animate,
}: {
  game_uuid: string;
  shape: Pos;
  walls: Pos[];
  food: Pos[];
  bots: [Pos, Pos, Pos, Pos];
  team_names: [string, string];
  say: [string, string, string, string];
  whowins: number | null;
  gameover: boolean;
  round: number;
  turn: number;
  do_animate: boolean;
}) {
  const [width, height] = shape;
  const [a, x, b, y] = bots;
  const [sayA, sayX, sayB, sayY] = say;

  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope>(null);
  const scope2 = useRef<Scope>(null);
  const pathAnimationRef = useRef<Timeline>(null);

  const svgId = useId(); // might not be needed thanks to css variables

  useEffect(() => {
    if (!game_uuid || !do_animate) return;
    if (pathAnimationRef.current) return;

    scope.current = createScope({ root }).add(self => {
      if (!root.current) return;

      const tl = createTimeline({ autoplay: false });

      const wallPathDrawable = svg.createDrawable('.maze-elems path.wall');

      // console.log(wallPathDrawable[0].getTotalLength());
      const wallSpeeds: number[] = [];
      const wallDelays: number[] = [];

      let delay = 0;

      for (const wall of wallPathDrawable) {
        const current = wall.getTotalLength();
        wallSpeeds.push(current);
        wallDelays.push(delay);
        delay += current;
      }

      // function shuffle(array: any[]) {
      //   for (let i = array.length - 1; i > 0; i--) {
      //     let j = Math.floor(Math.random() * (i + 1));
      //     [array[i], array[j]] = [array[j], array[i]];
      //   }
      // }

      // shuffleExceptFirst(wallPathDrawable);

      // maze building
      tl.label('draw')
        .set(root.current, {
          // "--color-maze": "#fcdb04",
          '--color-maze': '#000',
        })
        .set('.wall-main path.wall', {
          stroke: `url(#smooth-grad-${svgId})`,
          strokeWidth: 0,
          // fill: 'black',
          strokeLinecap: 'round',
          strokeLinejoin: 'bevel',
        })
        // .sync(
        //   animate('.maze-elems path.wall', {
        //     strokeWidth: 20,
        //     ease: 'linear',
        //     duration: 0,
        //     // delay: function (el, i) { return ((i == 0) ? 0 : 2000) + i * 25 },
        //   }))
        .sync(
          animate(wallPathDrawable, {
            draw: '0 1',
            ease: 'linear',
            // duration: 2000,
            // duration: function (el, i) { return wallSpeeds[i]; },
            strokeWidth: [2, 2],
            delay: function (el, i) {
              return i * 25;
            },
            // delay: function (el, i) { return wallDelays[i]; },
            // delay: function (el, i) { return ((i == 0) ? 0 : 2000) + i * 25 },
            // delay: function (el, i) { return ((i == 0) ? 0 : Math.floor(Math.random() * 2500)) },
            direction: 'alternate',
            loop: false,
          }),
        )
        .sync(
          animate('.wall-main path.wall', {
            fillOpacity: [0, 0.7], // ffa
            ease: 'linear',
            duration: 2000,
          }),
          2000,
        )
        .sync(
          animate('.wall-main path.wall', {
            strokeWidth: 0,
            ease: 'linear',
            duration: 2000,
          }),
          4000,
        );

      // reveal elements
      tl.label('reveal')
        .sync(
          animate('.food-elems', {
            opacity: [0, 1],
            ease: 'linear',
            duration: 2000,
          }),
          3000,
        )
        .sync(
          animate('.bot-elems', {
            opacity: [0, 1],
            ease: 'linear',
            duration: 2000,
          }),
          3500,
        )
        .sync(
          animate('.maze-border', {
            opacity: [0, 1],
            ease: 'linear',
            duration: 2000,
          }),
          3500,
        );

      pathAnimationRef.current = tl;
      tl.play();
    });

    return () => {
      pathAnimationRef.current?.pause();
      pathAnimationRef.current = null;
      scope.current?.revert();
    };
  }, [game_uuid, do_animate]);

  useEffect(() => {
    scope2.current = createScope({ root });

    return () => {
      scope2.current?.revert(); // only on unmount
    };
  }, []);

  // game over screen
  useEffect(() => {
    if (!scope2.current) return;

    let targetColor = '#000';

    // if (gameover) {
    //   targetColor = {
    //     0: ["#000", "var(--color-blue)"],
    //     1: ["#000", "var(--color-red)"],
    //     2: ["url(#smooth-grad)"]
    //   }[whowins ?? -1] ?? ["#000"];
    // }

    // if (gameover) {
    //   targetColor = {
    //     0: "var(--color-blue)",
    //     1: "var(--color-red)",
    //     2: "#ffa" // draw
    //   }[whowins ?? -1] ?? "#000";
    // }

    //color-mix(in srgb, var(--color-overlay) 70%, white 30%)

    if (gameover) {
      targetColor =
        {
          0: 'color-mix(in srgb, var(--color-blue) 70%, white 30%)',
          1: 'color-mix(in srgb, var(--color-red) 70%, white 30%)',
          2: `url(#smooth-grad-${svgId})`,
        }[whowins ?? -1] ?? '#000';
    }

    console.log(targetColor);

    scope2.current.add(() => {
      if (!root.current) return;

      // animate(root.current, {
      //   "--color-overlay": targetColor,
      //   ease: 'linear',
      //   duration: 200,
      // });

      const tl = createTimeline({ autoplay: false });

      if (gameover) {
        tl.set(root.current, {
          '--color-overlay': ['#000', targetColor],
        })
          .sync(
            animate('.wall-overlay', {
              opacity: 1,
              ease: 'linear',
              duration: 200,
            }),
            0,
          )
          .sync(
            animate('.wall-main', {
              opacity: 0,
              ease: 'linear',
              duration: 50,
            }),
            150,
          );
      } else {
        tl.sync(
          animate('.wall-main', {
            opacity: 1,
            ease: 'linear',
            duration: 200,
          }),
        ).sync(
          animate('.wall-overlay', {
            opacity: 0,
            ease: 'linear',
            duration: 200,
          }),
        );
      }

      tl.play();
    });
  }, [gameover, whowins]);

  return (
    <div ref={root} className="mazebox">
      <svg
        // width={width * cellSize}
        // height={height * cellSize}
        viewBox={`0 0 ${width * cellSize} ${height * cellSize}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <style type="text/css">{`
          @scope {
            .maze-border {
              stroke: url(#grad-${svgId});
              stroke-linecap: butt;
            }
            .wall-main path {
              stroke-width: 0;
              fill-opacity: 0.7;
            }
            .wall-main path.wall {
              fill: var(--color-maze);
              stroke-linecap: round;
              stroke-linejoin: bevel;
            }
            .wall-overlay {
              opacity: 0;
            }
            .wall-overlay path.wall {
              fill: var(--color-overlay);
              stroke-linecap: round;
              stroke-linejoin: bevel;
            }
            .food-elems {
              fill-opacity: 1;
            }
            .food {
              stroke: #000000;
              stroke-width: 0.3;
            }
            .wall-cell {
              opacity: 2;
              fill: lightblue;
              stroke: #d3d3d3;
            }
            .fill-blue {
              fill: var(--color-blue);
            }
            .fill-red {
              fill: var(--color-red);
            }
            .say-bg {
              stroke-width: 1.7px;
              stroke: white;
              font-size: 7px;
              text-anchor: middle;
              dominant-baseline: middle;
              z-index: 90;
            }
            .say {
              font-size: 7px;
              text-anchor: middle;
              dominant-baseline: middle;
              z-index: 100;
            }
            .gameover-overlay {
              fill: #FFC903;
              letter-spacing: 0px;
              stroke: #ED1B22;
              stroke-width: ${((height * cellSize) / 8 / 8) * 1.2}px;
              stroke-linejoin: round;
              paint-order: stroke;
            }
          }
        `}</style>

        <defs>
          <linearGradient id={`grad-${svgId}`} gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-blue)" offset="0" />
            <stop stopColor="var(--color-blue)" offset="50%" />
            <stop stopColor="var(--color-red)" offset="50%" />
            <stop stopColor="var(--color-red)" offset="100%" />
          </linearGradient>
          <linearGradient id={`smooth-grad-${svgId}`} gradientUnits="userSpaceOnUse">
            <stop stopColor="color-mix(in srgb, var(--color-blue) 70%, white 30%)" offset="0" />
            <stop stopColor="color-mix(in srgb, var(--color-red) 70%, white 30%)" offset="100%" />
          </linearGradient>
        </defs>

        <g>
          <Walls shape={shape} walls={walls}></Walls>
          <g className="food-elems">
            <AnimatePresence>
              {food.map(([x, y]) => (
                <Food
                  key={`${x},${y}`}
                  position={[x, y]}
                  side={x < width / 2 ? 'blue' : 'red'}
                ></Food>
              ))}
            </AnimatePresence>
          </g>

          <g className="bot-elems">
            {
              // sorting bots to ensure the lastest bot is on top

              [
                [turn, <Bot position={a} key="botA" side="blue" width={width}></Bot>],
                [(turn + 3) % 4, <Bot position={x} key="botX" side="red" width={width}></Bot>],
                [(turn + 2) % 4, <Bot position={b} key="botB" side="blue" width={width}></Bot>],
                [(turn + 1) % 4, <Bot position={y} key="botY" side="red" width={width}></Bot>],
              ]
                .toSorted()
                .toReversed()
                .map(([_t, val]) => val)
            }
            {
              // text after bots so that bots do not cover text
              [
                [turn, <BotSay position={a} key="say-botA" say={sayA} />],
                [(turn + 3) % 4, <BotSay position={x} key="say-botX" say={sayX} />],
                [(turn + 2) % 4, <BotSay position={b} key="say-botB" say={sayB} />],
                [(turn + 1) % 4, <BotSay position={y} key="say-botY" say={sayY} />],
              ]
                .toSorted()
                .toReversed()
                .map(([_t, val]) => val)
            }
          </g>

          {gameover ? (
            <>
              <text
                fontSize={((height * cellSize) / 8) * 1.1}
                className="gameover-overlay"
                y="40%"
                transform={`translate(${(width * cellSize) / 2})`}
                dominantBaseline="middle"
                textAnchor="middle"
              >
                <tspan x="0" textAnchor="middle">
                  GAME OVER
                </tspan>
                <tspan x="0" textAnchor="middle" dy={((height * cellSize) / 8) * 1.5}>
                  {whowins == null || whowins == 2 ? 'DRAW' : `${team_names[whowins]} wins!`}
                </tspan>
              </text>
            </>
          ) : null}
        </g>
      </svg>
    </div>
  );
}
export default Maze;
