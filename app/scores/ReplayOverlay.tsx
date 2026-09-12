'use client';

import Ansi from 'ansi-to-react';
import { useEffect, useState } from 'react';

import PelitaReplay from '@/app/PelitaReplay';

import { GameOutput, OutputMode } from './models';
import { Replay, HOST } from './TeamsRanking';

function GameOutputContent({ uuid, outputMode }: { uuid: string; outputMode: OutputMode }) {
  const [gameOutput, setGameOutput] = useState<GameOutput | null>(null);

  useEffect(() => {
    void fetch(`${HOST}/game_output/${uuid}`, { cache: 'force-cache' })
      .then(r => r.json())
      .then(data => {
        setGameOutput(prev => data);
      });
  }, [uuid]);

  let stdout: undefined | string = '';
  let stderr: undefined | string = '';

  switch (outputMode) {
    case 'BlueOutput':
      stdout = gameOutput?.participants.find(el => el.color == 1)?.stdout;
      stderr = gameOutput?.participants.find(el => el.color == 1)?.stderr;
      break;
    case 'RedOutput':
      stdout = gameOutput?.participants.find(el => el.color == 2)?.stdout;
      stderr = gameOutput?.participants.find(el => el.color == 2)?.stderr;
      break;

    default:
      stdout = gameOutput?.game_stdout;
      stderr = gameOutput?.game_stderr;
      break;
  }

  return (
    <div className="text-xs max-h-96 overflow-scroll">
      <div className="whitespace-pre-line">
        <Ansi>{stdout}</Ansi>
      </div>
      <div className="whitespace-pre-line">
        <Ansi>{stderr}</Ansi>
      </div>
    </div>
  );
}

export function ReplayOverlay({
  replay,
  closeReplayOverlay,
  colorMode,
  colorFromString,
}: {
  replay: Replay;
  closeReplayOverlay: () => void;
  colorMode: boolean;
  colorFromString: (str: string) => string | undefined;
}) {
  const [outputMode, setOutputMode] = useState<OutputMode>('Replay');

  return (
    <div className="fixed inset-0 bg-white/50 dark:bg-black/50" onClick={closeReplayOverlay}>
      <aside className="absolute flex justify-center items-center inset-0">
        <div
          className="border rounded bg-white dark:bg-gray-800 pt-0 p-8 w-11/12 md:w-3/4 lg:w-1/2"
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <div className="relative">
            <div className="p-2">
              <div className="text-gray-500 text-xs">
                {replay.uuid} |{' '}
                <button
                  onClick={() => {
                    setOutputMode('Replay');
                  }}
                  className={outputMode === 'Replay' ? 'text-black' : ''}
                >
                  Replay
                </button>{' '}
                |{' '}
                <button
                  onClick={() => {
                    setOutputMode('GameOutput');
                  }}
                  className={outputMode === 'GameOutput' ? 'text-black' : ''}
                >
                  Game output
                </button>{' '}
                |{' '}
                <button
                  onClick={() => {
                    setOutputMode('BlueOutput');
                  }}
                  className={outputMode === 'BlueOutput' ? 'text-black' : ''}
                >
                  Blue output
                </button>{' '}
                |{' '}
                <button
                  onClick={() => {
                    setOutputMode('RedOutput');
                  }}
                  className={outputMode === 'RedOutput' ? 'text-black' : ''}
                >
                  Red output
                </button>
              </div>
            </div>
          </div>

          {outputMode == 'Replay' && (
            <PelitaReplay
              src={`${HOST}/game_replay/${replay.uuid}`}
              colorMap={
                colorMode
                  ? {
                      [replay.slug1]: `${colorFromString(replay.slug1)}`,
                      [replay.slug2]: `${colorFromString(replay.slug2)}`,
                    }
                  : undefined
              }
              team_specs={[replay.slug1, replay.slug2]}
              rawGameState={true}
              startEnd={true}
              hasQuit={true}
              hasFF={true}
              subtleGameOver={!colorMode}
              onQuit={closeReplayOverlay}
            ></PelitaReplay>
          )}

          {outputMode != 'Replay' && (
            <div className="p-2">
              <GameOutputContent uuid={replay.uuid} outputMode={outputMode}></GameOutputContent>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
