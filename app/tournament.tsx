"use client"

import React, {
  Reducer,
  useEffect,
  useReducer
} from "react";

import ZMQReceiver from "./zmqreceiver";
import TypewriterText from "./typewritertext";
import { GameState } from "./pelita_msg";
import Pelita from "./pelita";
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


function PelitaTournament() {
  const initialState: PelitaState = "initial";
  const [state, dispatch] = useReducer(reducer, initialState);

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
  };

  return (
    <main className={`min-h-screen flex-col items-center justify-between px-24 py-12 ${crt}`}>
      <div className="z-10 w-full max-w-screen items-center justify-between font-mono text-sm">

        {state == "initial" && <button onClick={handleClick}>Start Movie</button>}

        {state == "movie" && <video autoPlay controls onEnded={handleClick}>
          <source src={"Pelita Supercut ASPP Heraklion 2024.mp4"} type="video/mp4" />
        </video>
        }

        {state === "intro" && showIntro()}

        {state == "match" &&
          <div>
            <h1 className="fixed top-0 left-0 z-20 w-full px-24 py-4 text-xl">
              ᗧ Pelita Tournament 2024
            </h1>

            { gameState && <Pelita gameState={gameState} footer="ᗧ Pelita Tournament, ASPP 2024 Ηράκλειο" animate={true}></Pelita> }
          </div>
        }

        <ZMQReceiver url='ws://localhost:5556' sendGameState={updateGameState} sendMessage={updateMessage} sendClearPage={clearPage}></ZMQReceiver>
      </div>
    </main>
  );
};
export default PelitaTournament;
