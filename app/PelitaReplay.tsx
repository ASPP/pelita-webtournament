'use client';

import { useEffect, useState } from 'react';

import { convertGameStateL, GameState } from './pelita_types';
import PelitaFrame from './PelitaFrame';
import { PelitaReplayControls } from './PelitaReplayControls';

type ColorMap = Record<string, string>;

export function usePelitaReplay(src: string, rawGameState = false) {
  const [frames, setFrames] = useState<GameState[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(src, { cache: 'force-cache' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(r => (rawGameState ? convertGameStateL(r) : r))
      .then(data => {
        if (!cancelled) setFrames(data);
      })
      .catch(error => {
        if (!cancelled) setError(error);
      });

    return () => {
      cancelled = true;
    };
  }, [src, rawGameState]);

  return { frames, error };
}

export default function PelitaReplay({
  src,
  team_specs,
  rawGameState = false,
  colorMap,
  preloadFrame,
  jumpToEnd = false,
  hasQuit = false,
  hasFF = false,
  subtleGameOver = false,
  onQuit,
}: {
  src: string;
  team_specs?: [string, string];
  rawGameState?: boolean;
  colorMap?: ColorMap;
  preloadFrame?: GameState;
  jumpToEnd?: boolean;
  hasQuit?: boolean;
  hasFF?: boolean;
  subtleGameOver?: boolean;
  onQuit?: () => void;
}) {
  const { frames, error } = usePelitaReplay(src, rawGameState);
  const [frameIndex, setFrameIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!frames) return;

    setFrameIndex(current => {
      if (current !== null) return current;

      return jumpToEnd ? frames.length - 1 : 0;
    });
  }, [frames, jumpToEnd]);



  const [started, setStarted] = useState(false);
  const delay = 40;


  const colors: [string, string] = ['rgb(94, 158, 217)', 'rgb(235, 90, 90)'];

  const [loadingString, setLoadingString] = useState('Loading replay.');

  let footer = "";
  let currentGameState = (frames && frameIndex !== null ? frames[frameIndex] : undefined);
  if (!currentGameState && preloadFrame) {
    currentGameState = preloadFrame;
    footer = loadingString;
  }
  if (currentGameState) currentGameState.game_uuid ??= src;

  colorMap ??= {};

  useEffect(() => {
    const id = setTimeout(() => {
      if (!started) return;
      if (!frames || frames.length === 0) return;

      setFrameIndex(state => {
        if (state == null) return 0;
        if (state + 1 < frames.length) return state + 1;

        clearTimeout(id);
        setStarted(false);
        return state;
      });
    }, delay);
    return () => {
      clearTimeout(id);
    };
  }, [started, frames, frameIndex]);

  function back() {
    if (!frames || frames.length === 0) return;

    setStarted(false);
    setFrameIndex(s => (s !== null ? Math.max(s - 1, 0) : null));
  }

  function rewind() {
    if (!frames || frames.length === 0) return;

    setStarted(false);
    setFrameIndex(s => (s !== null ? 0 : null));
  }

  function fastForward() {
    if (!frames || frames.length === 0) return;

    setStarted(false);
    setFrameIndex(s => (s !== null ? frames.length - 1 : null));
  }

  function step() {
    if (!frames || frames.length === 0) return;

    setStarted(false);
    setFrameIndex(s => (s !== null ? Math.min(s + 1, frames.length - 1) : null));
  }

  function playPause() {
    setStarted(s => !s);
  }

  if (error) {
    return (
      <div className="p-2">
        <i>{`${error}`}</i>
      </div>
    );
  }

  if (!currentGameState) {
    return (
      <div className="p-2">
        <i>{loadingString}</i>
      </div>
    );
  }

  team_specs ??= currentGameState.team_specs;
  if (team_specs[0] in colorMap) {
    colors[0] = colorMap[team_specs[0]];
  }

  if (team_specs[1] in colorMap) {
    colors[1] = colorMap[team_specs[1]];
  }

  const canPrev = frames !== null && frameIndex !== null && frameIndex !== 0;
  const canNext = frames !== null && frameIndex !== null && frameIndex !== frames.length - 1;

  return (
    <div className="">
      <PelitaFrame
        do_animate={false}
        footer={footer}
        colors={colors}
        gameState={currentGameState}
        subtleGameOver={subtleGameOver}
      ></PelitaFrame>

      <PelitaReplayControls hasQuit={hasQuit} onQuit={onQuit} onRewind={rewind} canPrev={canPrev} onBack={back} onPlayPause={playPause} started={started} onStep={step} canNext={canNext} hasFF={hasFF} onFastForward={fastForward}  />
    </div>
  );
}

