'use client';

import { animate } from 'animejs';
import { colorNameToCode } from 'color-name-to-code';
import { useEffect, useEffectEvent, useRef } from 'react';

import Maze from './maze';
import { FatalError, GameState } from './pelita_types';

const defaultColors: [string, string] = ['rgb(94, 158, 217)', 'rgb(235, 90, 90)'];

function hexColBrightness(hexCol: string) {
  // TODO: The code only works with hex codes currently
  if (!hexCol.startsWith('#')) return 127;
  if (hexCol.length === 4) {
    hexCol = '#' + hexCol[1] + hexCol[1] + hexCol[2] + hexCol[2] + hexCol[3] + hexCol[3];
  }
  if (hexCol.length !== 7) return 127;

  const r = parseInt(hexCol.substring(1, 3), 16);
  const g = parseInt(hexCol.substring(3, 5), 16);
  const b = parseInt(hexCol.substring(5, 7), 16);
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  return hsp;
}

function showError(error: FatalError) {
  return `Round ${error.round}, ${error.type}: ${error.description}`;
}

export default function PelitaFrame({
  gameState,
  colors = defaultColors,
  footer,
  do_animate = false,
  subtleGameOver = false,
}: {
  gameState: GameState;
  colors?: [string, string];
  footer: string;
  do_animate?: boolean;
  subtleGameOver?: boolean;
}) {
  let [colorBlue, colorRed] = colors;
  let [colorBlueBg, colorRedBg] = ['unset', 'unset'];

  const root = useRef<HTMLDivElement>(null);

  const elements_to_reveal = useRef<Element[]>([]);

  const addToReveal = (el: Element | null) => {
    if (el && !elements_to_reveal.current.includes(el)) elements_to_reveal.current.push(el);
  };

  const onAnimate = useEffectEvent(() => {
    animate(elements_to_reveal.current, {
      opacity: [0, 1],
      duration: do_animate ? 2000 : 0,
      delay: do_animate ? 3000 : 0,
    });
  });

  useEffect(() => {
    // if (!do_animate) return;
    onAnimate();
  }, [do_animate, gameState.game_uuid]);

  if (!colorBlue.includes('(') && !colorBlue.includes('#')) {
    // the animations do not like colour names
    colorBlue = colorNameToCode(colorBlue);
  }

  if (!colorRed.includes('(') && !colorRed.includes('#')) {
    colorRed = colorNameToCode(colorRed);
  }

  if (hexColBrightness(colorBlue) > 200) {
    colorBlueBg = '#000000';
  }

  if (hexColBrightness(colorRed) > 200) {
    colorRedBg = '#000000';
  }

  const [team1, team2] = gameState.team_names;
  const [team_info1, team_info2] = gameState.team_infos;
  const [group1, group2] = gameState.team_specs;

  const stats1 = <>
          {gameState.game_stats.num_errors ? `Errors: ${gameState.game_stats.num_errors[0]}, ` : ""}Kills:{' '}
          {gameState.game_stats.kills[0] + gameState.game_stats.kills[2]}, Deaths:{' '}
          {gameState.game_stats.deaths[0] + gameState.game_stats.deaths[2]}, Time:{' '}
          {gameState.game_stats.team_time[0].toFixed(2)}{' '}
  </>;

  const stats2 = <>
          {gameState.game_stats.num_errors ? `Errors: ${gameState.game_stats.num_errors[1]}, ` : ""}Kills:{' '}
          {gameState.game_stats.kills[1] + gameState.game_stats.kills[3]}, Deaths:{' '}
          {gameState.game_stats.deaths[1] + gameState.game_stats.deaths[3]}, Time:{' '}
          {gameState.game_stats.team_time[1].toFixed(2)}{' '}
          </>;


  const say: [string, string, string, string] = subtleGameOver ? ['', '', '', ''] : gameState.say;

  if (subtleGameOver && gameState.gameover) {
    footer = gameState.whowins == 2 ? 'DRAW' : `${gameState.team_names[gameState.whowins]} wins!`;
  }

  return (
    <div
      ref={root}
      className="pelita @container pb-2"
      style={
        {
          '--color-blue': colorBlue,
          '--color-red': colorRed,
          '--color-blue-bg': colorBlueBg,
          '--color-red-bg': colorRedBg,
        } as React.CSSProperties
      }
    >
      {/* text-[clamp(var(--text-xl),2cqw,3rem)] */}
      <h2 className={`flex flex-row text-[clamp(0.8rem,2.7cqw,var(--text-3xl))] leading-[1.1] p-2 team-names opacity-0`} ref={addToReveal}>
        <span className="basis-1/2 text-right w-64 blue-bot">
          <span className="p-1 blue-bot-bg">
            <small>{team_info1}</small> <b className={(gameState.gameover && gameState.whowins === 0) ? "underline" : "" }>{team1}</b> {gameState.game_stats.score[0]}
          </span>
        </span>
        <span className="basis-1 px-2">:</span>
        <span className="basis-1/2 text-left w-64 red-bot">
          <span className="p-1 red-bot-bg">
            {gameState.game_stats.score[1]} <b className={(gameState.gameover && gameState.whowins === 1) ? "underline" : "" }>{team2}</b> <small>{team_info2}</small>
          </span>
        </span>
      </h2>
      <div className={`flex flex-row text-[clamp(0.7rem,1.4cqw,var(--text-2xl))] leading-[1.1] team-stats opacity-0`} ref={addToReveal}>
        <div className="basis-1/2 w-64 px-2 py-1">
          {stats1}
        </div>
        <div className="basis-1/2 text-right w-64 px-2 py-1">
          {stats2}
        </div>
      </div>

      <Maze
        key={gameState.game_uuid}
        game_uuid={gameState.game_uuid}
        shape={gameState.shape}
        walls={gameState.walls}
        food={gameState.food}
        bots={gameState.bots}
        team_names={gameState.team_names}
        say={say}
        whowins={gameState.whowins}
        gameover={gameState.gameover}
        round={gameState.round}
        turn={gameState.turn}
        do_animate={do_animate}
        gameOverScreen={!subtleGameOver}
      ></Maze>

      <div className={`flex flex-row text-[clamp(0.7rem,1.4cqw,var(--text-2xl))] leading-[1.1] text-slate-600 footer opacity-0`} ref={addToReveal}>
        <div className="basis-1/2 w-64 px-2 py-1">{footer}</div>
        <div className="basis-1/2 text-right w-64 px-2 py-1">
          <>
          {gameState.fatal_errors[0].length != 0 && gameState.fatal_errors[0].map(showError)}
          {gameState.fatal_errors[1].length != 0 && gameState.fatal_errors[1].map(showError)}
          {gameState.fatal_errors[0].length == 0 && gameState.fatal_errors[1].length == 0 && (<>Round {gameState.round}/{gameState.max_rounds}</>)}
          </>
        </div>
      </div>
    </div>
  );
}
