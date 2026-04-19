'use client';

import { useEffect, useState } from 'react';

import PelitaMatch from './pelita_match';
import { GameState } from './pelita_types';

type ColorMap = Record<string, string>

export default function PelitaReplay({ src, colorMap, preloadFrame }: { src: string, colorMap?: ColorMap, preloadFrame?: GameState }) {
  const [position, setPosition] = useState(0);
  const [started, setStarted] = useState(false);
  const delay = 40;

  const [gameData, setGameData] = useState<GameState[]>();
  const colors: [string, string] = ['rgb(94, 158, 217)', 'rgb(235, 90, 90)'];

  colorMap ??= {};

  useEffect(() => {
    void fetch(src)
      .then((r) => r.json())
      .then((content: GameState[]) => {
        setGameData(content)
      });
  }, [src]);


  useEffect(() => {
    const id = setTimeout(() => {
      if (!started) return;
      if (!gameData) return;

      setPosition(state => {
        if (state + 1 < gameData.length) return state + 1;
        else {
          clearTimeout(id);
          setStarted(false);
          return state;
        }
      });
    }, delay);
    return () => {
      clearTimeout(id);
    };
  }, [position, started, gameData]);

  function back() {
    if (!gameData) return;

    setStarted(false);
    setPosition(s => Math.max(s - 1, 0));
  }

  function step() {
    if (!gameData) return;

    setStarted(false);
    setPosition(s => Math.min(s + 1, gameData.length - 1));
  }


  let current;

  if (!gameData && preloadFrame) {
     current = preloadFrame;
  } else if (gameData && gameData.length > 0) {
     current = gameData[position]
  } else {
    return (
      <p>
        <i>No match data</i>
      </p>
    );
  }

  // console.log(current);
  current.game_uuid ??= src;

  if (gameData && gameData.length > 0) {
    const team_specs: [string, string] = gameData[0].team_specs;
    if (team_specs[0] in colorMap) {
      colors[0] = colorMap[team_specs[0]];
    }

    if (team_specs[1] in colorMap) {
      colors[1] = colorMap[team_specs[1]];
    }
  }


  return (
    <div className="">
      <PelitaMatch do_animate={false} footer="" colors={colors} gameState={current}></PelitaMatch>

      <div className="flex flex-row gap-4 items-center justify-between">
        <button
          className="basis-1/4 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded disabled:border-white-500"
          onClick={() => {
            setPosition(0);
          }}
          disabled={!position}
        >
          rewind
        </button>
        <button
          className="basis-1/4 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
          onClick={back}
        >
          back
        </button>
        <button
          className="basis-1/4 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
          onClick={() => {
            setStarted(!started);
          }}
        >
          {started ? `pause` : `play`}
        </button>
        <button
          className="basis-1/4 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
          onClick={step}
        >
          step
        </button>
      </div>
    </div>
  );
}
