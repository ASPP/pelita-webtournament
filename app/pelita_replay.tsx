'use client';

import { useEffect, useState } from 'react';

import PelitaMatch from './pelita_match';
import { convertGameStateL, GameState } from './pelita_types';

type ColorMap = Record<string, string>;

export default function PelitaReplay({
  src,
  team_specs,
  rawGameState = false,
  colorMap,
  preloadFrame,
  startEnd = false,
  hasQuit = false,
  hasFF = false,
  subtleGameOver = false,
  onQuit
}: {
  src: string;
  team_specs?: [string, string];
  rawGameState?: boolean;
  colorMap?: ColorMap;
  preloadFrame?: GameState;
  startEnd?: boolean;
  hasQuit?: boolean;
  hasFF?: boolean;
  subtleGameOver?: boolean;
  onQuit?: () => void
}) {
  const [position, setPosition] = useState(0);
  const [started, setStarted] = useState(false);
  const delay = 40;

  const [gameData, setGameData] = useState<GameState[]>(preloadFrame ? [preloadFrame] : []);
  const colors: [string, string] = ['rgb(94, 158, 217)', 'rgb(235, 90, 90)'];

  const [loadingString, setLoadingString] = useState("Loading replay.");

  colorMap ??= {};

  // console.log(colorMap);

  useEffect(() => {
    void fetch(src, { cache: 'force-cache' })
      .then(r => r.json())
      .then(r => (rawGameState ? convertGameStateL(r) : r))
      .then((content: GameState[]) => {
        setGameData(content);
        if (startEnd) {
          setPosition(content.length - 1);
        }
      }).catch((error) => {
        setLoadingString(`Something went wrong: ${error}`);
      });
  }, [src, rawGameState]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!started) return;
      if (gameData.length === 0) return;

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
    if (gameData.length === 0) return;

    setStarted(false);
    setPosition(s => Math.max(s - 1, 0));
  }

  function fastForward() {
    if (gameData.length === 0) return;

    setStarted(false);
    setPosition(s => Math.min(s + 1, gameData.length - 1));
  }

  function step() {
    if (gameData.length === 0) return;

    setStarted(false);
    setPosition(s => Math.min(s + 1, gameData.length - 1));
  }

  if (gameData.length === 0) {
    return (
      <div className='p-2'>
        <i>{loadingString}</i>
      </div>
    );
  }

  team_specs ??= gameData[0].team_specs;
  if (team_specs[0] in colorMap) {
    colors[0] = colorMap[team_specs[0]];
  }

  if (team_specs[1] in colorMap) {
    colors[1] = colorMap[team_specs[1]];
  }

  const currentGameState = gameData[position];
  currentGameState.game_uuid ??= src;

  const buttonCols = 4 + (hasFF ? 1 : 0) + (hasQuit ? 1 : 0);

  return (
    <div className="">
      <PelitaMatch do_animate={false} footer="" colors={colors} gameState={currentGameState} subtleGameOver={subtleGameOver}></PelitaMatch>

      <div className={`grid grid-cols-${4 + (hasFF ? 1 : 0) + (hasQuit ? 1 : 0)} gap-4 items-center justify-between`}>

        {hasQuit && <button
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded disabled:border-white-500"
          onClick={onQuit}
        >
          quit
        </button>
        }

        <button
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded disabled:border-white-500"
          onClick={() => {
            setPosition(0);
          }}
          disabled={!position}
        >
          rewind
        </button>
        <button
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
          onClick={back}
        >
          back
        </button>
        <button
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
          onClick={() => {
            setStarted(!started);
          }}
        >
          {started ? `pause` : `play`}
        </button>
        <button
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
          onClick={step}
        >
          step
        </button>

        {hasFF && <button
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
          onClick={() => {
            setPosition(gameData.length - 1);
          }}
        >
          forward
        </button>
        }

      </div>
    </div>
  );
}
