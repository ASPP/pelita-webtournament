'use client';

export function PelitaReplayControls({
  hasQuit,
  onQuit,
  onRewind,
  canPrev,
  onBack,
  onPlayPause,
  started,
  onStep,
  canNext,
  hasFF,
  onFastForward,
}: {
  hasQuit: boolean;
  onQuit?: () => void;
  onRewind: () => void;
  canPrev: boolean;
  onBack: () => void;
  onPlayPause: () => void;
  started: boolean;
  onStep: () => void;
  canNext: boolean;
  hasFF: boolean;
  onFastForward: () => void;
}) {
  const buttonCols = 4 + (hasFF ? 1 : 0) + (hasQuit ? 1 : 0);
  const buttonClassNames =
    'bg-transparent w-full text-[clamp(0.3rem,18cqw,0.8rem)] hover:bg-blue-500 text-blue-700 font-semibold hover:text-white p-1 border border-blue-500 hover:border-transparent rounded disabled:border-white-500';

  return (
    <div className={`grid grid-cols-${buttonCols} gap-4 items-center justify-between`}>
      {hasQuit && (
        <div className="@container">
          <button className={buttonClassNames} onClick={onQuit}>
            quit
          </button>
        </div>
      )}

      <div className="@container">
        <button className={buttonClassNames} onClick={onRewind} disabled={!canPrev}>
          rewind
        </button>
      </div>
      <div className="@container">
        <button className={buttonClassNames} onClick={onBack} disabled={!canPrev}>
          back
        </button>
      </div>
      <div className="@container">
        <button
          className={buttonClassNames}
          onClick={onPlayPause}
        >
          {started ? `pause` : `play`}
        </button>
      </div>
      <div className="@container">
        <button className={buttonClassNames} onClick={onStep} disabled={!canNext}>
          step
        </button>
      </div>

      {hasFF && (
        <div className="@container">
          <button className={buttonClassNames} onClick={onFastForward} disabled={!canNext}>
            forward
          </button>
        </div>
      )}
    </div>
  );
}
