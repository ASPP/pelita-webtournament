'use client';

import { createScope, createTimeline, Timeline } from 'animejs';
import { colorNameToCode } from 'color-name-to-code';
import { useEffect, useRef } from 'react';

import Maze from './maze';
import { GameState } from './pelita_msg';

const defaultColors: [string, string] = ['rgb(94, 158, 217)', 'rgb(235, 90, 90)'];

export default function Pelita({
  gameState,
  colors = defaultColors,
  footer,
  do_animate = false,
}: {
  gameState: GameState;
  colors?: [string, string];
  footer: string;
  do_animate?: boolean;
}) {
  let [colorBlue, colorRed] = colors;
  const [team1, team2] = gameState.team_names;
  const [team_info1, team_info2] = gameState.team_infos;
  const [group1, group2] = gameState.team_specs;

  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<any>(null);
  const pathAnimationRef = useRef<Timeline>(null);

  useEffect(() => {
    if (!do_animate) return;
    if (pathAnimationRef.current) return;

    scope.current = createScope({ root }).add(self => {
      if (pathAnimationRef.current) return;

      const tl = createTimeline({ autoplay: false });

      const elems_to_hide = ['.team-names', '.team-stats', '.footer'];

      tl.set(elems_to_hide, {
        opacity: 0,
      }).add(
        elems_to_hide,
        {
          opacity: [0, 1],
          duration: 2000,
        },
        3000,
      );

      pathAnimationRef.current = tl;
      tl.play();
    });

    return () => {
      pathAnimationRef.current?.pause();
      pathAnimationRef.current = null;
      scope.current?.revert();
    };
  }, [do_animate]);

  if (!colorBlue.includes('(') && !colorBlue.includes('#')) {
    // the animations do not like colour names
    colorBlue = colorNameToCode(colorBlue);
  }

  if (!colorRed.includes('(') && !colorRed.includes('#')) {
    colorRed = colorNameToCode(colorRed);
  }

  return (
    <div
      ref={root}
      className="pelita"
      style={
        {
          '--color-blue': colorBlue,
          '--color-red': colorRed,
        } as React.CSSProperties
      }
    >
      <h2 className="flex flex-row text-xl p-2 team-names">
        <span className="basis-1/2 text-right w-64 blue-bot">
          <small>{team_info1}</small> <b>{team1}</b> {gameState.game_stats.score[0]}
        </span>
        <span className="basis-1 px-2">:</span>
        <span className="basis-1/2 text-left w-64 red-bot">
          {gameState.game_stats.score[1]} <b>{team2}</b> <small>{team_info2}</small>
        </span>
      </h2>
      <div className="flex flex-row text-xs team-stats">
        <div className="basis-1/2 w-64 px-2">
          Errors: {gameState.game_stats.num_errors[0]}, Kills:{' '}
          {gameState.game_stats.kills[0] + gameState.game_stats.kills[2]}, Deaths:{' '}
          {gameState.game_stats.deaths[0] + gameState.game_stats.deaths[2]}, Time:{' '}
          {gameState.game_stats.team_time[0].toFixed(2)}{' '}
        </div>
        <div className="basis-1/2 text-right w-64 px-2">
          Errors: {gameState.game_stats.num_errors[1]}, Kills:{' '}
          {gameState.game_stats.kills[1] + gameState.game_stats.kills[3]}, Deaths:{' '}
          {gameState.game_stats.deaths[1] + gameState.game_stats.deaths[3]}, Time:{' '}
          {gameState.game_stats.team_time[1].toFixed(2)}{' '}
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
        say={gameState.say}
        whowins={gameState.whowins}
        gameover={gameState.gameover}
        round={gameState.round}
        turn={gameState.turn}
        do_animate={do_animate}
      ></Maze>

      <div className="flex flex-row text-xs text-slate-600 footer">
        <div className="basis-1/2 w-64 px-2">{footer}</div>
        <div className="basis-1/2 text-right w-64 px-2">
          Round {gameState.round}/{gameState.max_rounds}
        </div>
      </div>
    </div>
  );
}
