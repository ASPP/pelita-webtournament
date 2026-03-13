"use client"

import Compact from "@uiw/react-color-compact";
import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

import Pelita from "../pelita";
import { GameState, GameStats } from "../pelita_msg";
import ZMQReceiver from "../zmqreceiver";
import { animate, createTimeline } from "animejs";

function dummyGameState(width: number, height: number) {
  const gameStats: GameStats = {
    score: [0, 0],
    num_errors: [0, 0],
    kills: [0, 0, 0, 0],
    deaths: [0, 0, 0, 0],
    team_time: [0, 0]
  };

  const bots: [[number, number], [number, number], [number, number], [number, number]] = [[1, 1], [1, 2], [width - 2, height - 3], [width - 2, height - 2]];
  const food: [number, number][] = [];

  // TODO: Make a state
  const walls: [number, number][] = [];
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      if (i == 0 || i == width - 1 || j == 0 || j == height - 1 || Math.random() < 0.3) {
        if (!bots.some((el) => el.every((val, idx) => val === [i, j][idx])))
          walls.push([i, j]);
      } else {
        if (Math.random() < 0.1)
          food.push([i, j]);
      }
    }
  }

  const gameState: GameState = {
    game_uuid: uuidv4(),
    shape: [width, height],
    walls: walls,
    food: food,
    bots: bots,
    team_names: ["Team A", "Team B"],
    team_infos: ["group #0", "group #1"],
    team_specs: ["..", ".."],
    game_stats: gameStats,
    whowins: 0,
    gameover: false,
    say: ["Hello", "", "", "Text"],
    round: 0,
    max_rounds: 0,
    turn: 0
  };
  return gameState;
}

type DemoState = "Running" | "BlueWins" | "RedWins" | "Draw";

function DemoGame({ shape = [32, 16], clearPage }: { shape?: [number, number], clearPage: () => void }) {
  const [width, height] = shape;
  const [state, setState] = useState<DemoState>("Running");
  const [animationState, setAnimationState] = useState(true);
  const [gameState, setGameState] = useState(dummyGameState(width, height));

  const [webSocketMode, setWebSocketMode] = useState(false);

  const defaultColors = ["rgb(94, 158, 217)", "rgb(235, 90, 90)"];

  const [color1, setColor1] = useState(defaultColors[0]);
  const [color2, setColor2] = useState(defaultColors[1]);

  const [showShape, setShowShape] = useState(false);
  const [showColor1, setShowColor1] = useState(false);
  const [showColor2, setShowColor2] = useState(false);

  useEffect(() => {
    createTimeline().add('body',
      {
        background: '#fff',
        easing: 'easeout',
        duration: animationState ? 5000 : 0,
      },
      animationState ? 3000 : 0,
    );
  }, [gameState]);

  if (!webSocketMode) {
    switch (state) {
      case "BlueWins":
        gameState.whowins = 0;
        gameState.gameover = true;
        break;
      case "RedWins":
        gameState.whowins = 1;
        gameState.gameover = true;
        break;
      case "Draw":
        gameState.whowins = 2;
        gameState.gameover = true;
        break;
      default:
        gameState.whowins = 0;
        gameState.gameover = false;
        break;
    }
  }

  const colors: [string, string] = [color1, color2];

  const updateGameState = useCallback((gameState: GameState) => {

    console.log(gameState);

    setGameState((oldState) => {
      if (oldState.game_uuid === gameState.game_uuid) {
        // we keep the walls array so that the effects are not re-run
        // TODO: Maybe the effect should depend on only the game_uuid having changed?
        const newState = {
          ...gameState,
          "walls": oldState.walls,
        };
        return newState;
      }
      return gameState;
    });
  }, []);


  return <div>
    <h1 className="fixed top-0 left-0 z-20 w-full px-24 py-4 text-xl">
      ᗧ Pelita Tournament
    </h1>

    <Pelita gameState={gameState} colors={colors} footer={`ᗧ Pelita Tournament, location date`} do_animate={animationState}>
    </Pelita>

    {webSocketMode &&
      <ZMQReceiver
        url='ws://localhost:5556'
        sendGameState={updateGameState}
      ></ZMQReceiver>
    }

    <div>
      <button onClick={() => { setGameState(dummyGameState(width, height)); }}>Regen</button>{' | '}
      <button onClick={() => { clearPage(); }}>Flip dark</button>{' | '}
      <span className="relative inline-block">
        <button onClick={() => { setShowShape(old => !old); }}><span className={showShape ? "underline" : ""}>Shape</span></button> {showShape &&
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
            <div className="flex backdrop-blur-sm p-2" style={{
              boxShadow: 'rgb(0 0 0 / 15%) 0px 0px 0px 1px, rgb(0 0 0 / 15%) 0px 8px 16px',
            }}>
              <button className="inline-block" onClick={() => { setGameState(dummyGameState(16, 8)); }}>16x8</button>
              {' | '}
              <button className="inline-block" onClick={() => { setGameState(dummyGameState(32, 16)); }}>32x16</button>
              {' | '}
              <button className="inline-block" onClick={() => { setGameState(dummyGameState(64, 32)); }}>64x32</button>
            </div>
          </div>
        }
      </span>
      {' | '}
      <button onClick={() => { setAnimationState((e) => !e); }}>Animation {animationState ? "ON" : "OFF"}</button>{' | '}
      <button onClick={() => { setState("Running"); }}><span className={webSocketMode ? "line-through" : ""}>Running</span></button>{' | '}
      <button onClick={() => { setState("BlueWins"); }}><span className={webSocketMode ? "line-through" : ""}>Blue Wins</span></button>{' | '}
      <button onClick={() => { setState("RedWins"); }}><span className={webSocketMode ? "line-through" : ""}>Red Wins</span></button>{' | '}
      <button onClick={() => { setState("Draw"); }}><span className={webSocketMode ? "line-through" : ""}>Draw</span></button>{' | '}
      <span className="relative inline-block">
        <button onClick={() => { setShowColor1(old => !old); }}><span className={showColor1 ? "underline" : ""}>Color Bot1 <span style={{ color: color1 }}>⚫&#xFE0E;</span></span></button> {showColor1 &&
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
            <Compact
              color={color1}
              style={{
                width: '250px',
                boxShadow: 'rgb(0 0 0 / 15%) 0px 0px 0px 1px, rgb(0 0 0 / 15%) 0px 8px 16px',
              }}
              onChange={(color) => { setColor1(color.hex); }}
            />
          </div>
        }
      </span>
      {' | '}
      <span className="relative inline-block">
        <button onClick={() => { setShowColor2(old => !old); }}><span className={showColor2 ? "underline" : ""}>Color Bot2 <span style={{ color: color2 }}>⚫&#xFE0E;</span></span></button> {showColor2 &&
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
            <Compact
              color={color2}
              style={{
                width: '250px',
                boxShadow: 'rgb(0 0 0 / 15%) 0px 0px 0px 1px, rgb(0 0 0 / 15%) 0px 8px 16px',
              }}
              onChange={(color) => { setColor2(color.hex); }}
            />
          </div>
        }
      </span>
      {' | '}
      <button onClick={() => {
        setColor1(defaultColors[0]);
        setColor2(defaultColors[1]);
      }}>Reset Colors</button>
      {' | '}
      <button onClick={() => { setWebSocketMode((e) => !e); }}>Websocket {webSocketMode ? "ON" : "OFF"}</button>
    </div>
  </div>;
};

export default DemoGame;