"use client"

import Maze from "./maze";
import { GameState } from "./pelita_msg";

function Pelita({ gameState, footer, animate }: { gameState: GameState, footer: string, animate: boolean }) {
  const [team1, team2] = gameState.team_names;

  return <div className="pelita">
    <h2 className="flex flex-row text-lg p-2">
      <span className="basis-1/2 text-right w-64 blue-bot"><b>{team1}</b> {gameState.game_stats.score[0]}</span>
      <span className="basis-1 px-2">:</span>
      <span className="basis-1/2 text-left w-64 red-bot">{gameState.game_stats.score[1]} <b>{team2}</b></span>
    </h2>
    <div className="flex flex-row text-xs">
      <div className="basis-1/2 w-64 px-2">Errors: {gameState.game_stats.num_errors[0]}, Kills: {gameState.game_stats.kills[0] + gameState.game_stats.kills[2]}, Deaths: {gameState.game_stats.deaths[0] + gameState.game_stats.deaths[2]}, Time: {gameState.game_stats.team_time[0].toFixed(2)} </div>
      <div className="basis-1/2 text-right w-64 px-2">Errors: {gameState.game_stats.num_errors[1]}, Kills: {gameState.game_stats.kills[1] + gameState.game_stats.kills[3]}, Deaths: {gameState.game_stats.deaths[1] + gameState.game_stats.deaths[3]}, Time: {gameState.game_stats.team_time[1].toFixed(2)} </div>
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
      animate={animate}
    >
    </Maze>

    <div className="flex flex-row text-xs text-slate-600">
      <div className="basis-1/2 w-64 px-2">{ footer }</div>
      <div className="basis-1/2 text-right w-64 px-2">Round {gameState.round ?? "-"}/{gameState.max_rounds}</div>
    </div>

  </div>
}
export default Pelita;
