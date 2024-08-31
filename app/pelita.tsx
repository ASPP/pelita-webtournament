"use client"

import React, {
  Reducer,
  useEffect,
  useReducer
} from "react";


import Maze from "./maze";
import ZMQReceiver from "./zmqreceiver";
import TypewriterText from "./typewritertext";
import { GameState } from "./zmqreceiver";
import anime from "animejs";

type PelitaState = "initial" | "movie" | "intro" | "match" | "faulted";
type PelitaEvent = "start-movie" | "start-intro" | "game-playing" | "clear-page" | "fail";

const MAX_LINES = 20;

const reducer: Reducer<PelitaState, PelitaEvent> = (state, event) => {
  switch (state) {
    case "initial":
      if (event === "start-movie") return "movie";
      break;
    case "movie":
      if (event === "start-intro") return "intro";
      break;
    case "intro":
      if (event === "game-playing") return "match";
      if (event === "clear-page") return "intro";
      break;
    case "match":
      if (event === "game-playing") return "match";
      if (event === "clear-page") return "intro";
      break;
  }
  return state;
};

function PelitaMain({ gameState }: { gameState: GameState }) {
  const [team1, team2] = gameState.team_names;

  return <div id="main">
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
    >
    </Maze>

    <div className="flex flex-row text-xs text-slate-600">
      <div className="basis-1/2 w-64 px-2">ᗧ Pelita Tournament, ASPP 2024 Ηράκλειο</div>
      <div className="basis-1/2 text-right w-64 px-2">Round {gameState.round ?? "-"}/{gameState.max_rounds}</div>
    </div>

  </div>
}


function Pelita() {
  const initialState: PelitaState = "initial";
  const [state, dispatch] = useReducer(reducer, initialState);

  const [showPre, setShowPre] = React.useState(true);
  const [showMain, setShowMain] = React.useState(true);
  const [typewriterText, setTypewriterText] = React.useState<string[]>([]);

  const [gameState, setGameState] = React.useState<GameState>();

  const bg_color = ((state) => {
    switch (state) {
      case "initial":
      case "movie":
      case "intro":
        return "#000"

      case "match":
      default:
        return "#fff";
    }

  })(state);


  const crt = ((state) => {
    switch (state) {
      case "initial":
      case "movie":
      case "intro":
        return "crt"

      case "match":
      default:
        return "";
    }

  })(state);


  useEffect(() => {
    anime.timeline()
      .add({
        targets: 'body',
        background: bg_color,
        easing: 'linear',
        duration: 2000,
      }, 3000)
  }, [bg_color]);

  const flip = () => {
    //setShowMain(!showMain);
    //setShowPre(!showPre);
  };

  const updateGameState = (gameState: GameState) => {
    dispatch("game-playing");
    setGameState((oldState) => {
      if (oldState?.game_uuid === gameState.game_uuid) {
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
  }

  const updateMessage = (msg: string) => {
    let split_str = msg.split(/\r?\n/);
    setTypewriterText(oldText => [...oldText, ...split_str]);
  }

  const clearPage = () => {
    dispatch("clear-page");
    setTypewriterText([]);
  }

  const handleClick = async () => {
    switch (state) {
      case "initial":
        dispatch("start-movie");
        break;
      case "movie":
        dispatch("start-intro");
        break
      default:
        break;
    }
  };

  function showIntro() {
    return <TypewriterText text={typewriterText} lines={MAX_LINES}></TypewriterText>;
  }

  function inner() {

    if (state == "initial") {
      return <button onClick={handleClick}>Start Movie</button>;
    } else if (state == "movie") {
      return <video autoPlay controls onEnded={handleClick}>
        <source src={"Pelita Supercut ASPP Heraklion 2024.mp4"} type="video/mp4" />
      </video>;
    } else if (state == "intro" || state == "match") {

      return (
        <div>
          <h1 className="fixed top-0 left-0 z-20 w-full px-24 py-4 text-xl">
            ᗧ Pelita Tournament 2024
          </h1>

          {state === "intro" ? showIntro() : null}

          {state === "match" && gameState ?
            <PelitaMain gameState={gameState}></PelitaMain>
            : null
          }

          <ZMQReceiver url='ws://localhost:5556' sendGameState={updateGameState} sendMessage={updateMessage} sendClearPage={clearPage}></ZMQReceiver>
        </div>
      );
    }
  };

  return (
  <main className={`min-h-screen flex-col items-center justify-between px-24 py-12 ${crt}`}>
    <div className="z-10 w-full max-w-screen items-center justify-between font-mono text-sm">

    { inner() }

    </div>
  </main>
  );
};
export default Pelita;
