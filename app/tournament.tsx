'use client';

import { createTimeline } from 'animejs';
import React, { Reducer, useCallback, useEffect, useReducer } from 'react';

import DemoGame from './demo/page';
import Pelita from './pelita';
import { GameState, TournamentMetadata } from './pelita_msg';
import TypewriterText from './typewritertext';
import ZMQReceiver from './zmqreceiver';

type PelitaState =
  | 'initial'
  | 'movie'
  | 'intro'
  | 'match'
  | 'faulted'
  | 'demo-columns'
  | 'demo-game';
type PelitaEvent =
  | 'start-movie'
  | 'start-intro'
  | 'game-playing'
  | 'clear-page'
  | 'fail'
  | 'do-demo'
  | 'do-demo-columns'
  | 'do-demo-game';

const MAX_LINES = 20;

const reducer: Reducer<PelitaState, PelitaEvent> = (state, event) => {
  console.log(`${state} -> ${event}`);
  switch (state) {
    case 'initial':
      if (event === 'start-movie') return 'movie';
      if (event === 'do-demo-columns') return 'demo-columns';
      if (event === 'do-demo-game') return 'demo-game';
      break;
    case 'movie':
      if (event === 'start-intro') return 'intro';
      break;
    case 'intro':
      if (event === 'game-playing') return 'match';
      if (event === 'clear-page') return 'intro';
      break;
    case 'match':
      if (event === 'game-playing') return 'match';
      if (event === 'clear-page') return 'intro';
      break;
  }
  return state;
};

function PelitaTournament() {
  const initialState: PelitaState = 'initial';
  const [state, dispatch] = useReducer(reducer, initialState);

  const [typewriterText, setTypewriterText] = React.useState<string[]>([]);

  const [gameState, setGameState] = React.useState<GameState>();
  const [tournamentMetadata, setTournamentMetadata] = React.useState<TournamentMetadata>();

  const bg_color = (state => {
    switch (state) {
      case 'initial':
      case 'movie':
      case 'intro':
        return '#000';

      case 'match':
      default:
        return '#fff';
    }
  })(state);

  const crt = (state => {
    switch (state) {
      case 'initial':
      case 'intro':
      case 'demo-columns':
      case 'movie':
        return 'crt';

      case 'demo-game':
      case 'match':
      default:
        return '';
    }
  })(state);

  let color1 = 'rgb(94, 158, 217)';
  let color2 = 'rgb(235, 90, 90)';

  if (typeof tournamentMetadata !== 'undefined') {
    for (const [_teamId, team] of Object.entries(tournamentMetadata.teams)) {
      if (team.spec == gameState?.team_specs[0]) {
        console.log('Team blue (%s) is %s', team.spec, team.color);
        if (team.color) color1 = team.color;
      }
      if (team.spec == gameState?.team_specs[1]) {
        console.log('Team red (%s) is %s', team.spec, team.color);
        if (team.color) color2 = team.color;
      }
    }
  }

  // console.log("Metadata");
  console.log(tournamentMetadata);

  const colors: [string, string] = [color1, color2];

  useEffect(() => {
    createTimeline().add(
      'body',
      {
        background: bg_color,
        easing: 'easeout',
        duration: 5000,
      },
      3000,
    );
  }, [bg_color]);

  const updateGameState = useCallback((gameState: GameState) => {
    dispatch('game-playing');
    setGameState(oldState => {
      if (oldState?.game_uuid === gameState.game_uuid) {
        // we keep the walls array so that the effects are not re-run
        // TODO: Maybe the effect should depend on only the game_uuid having changed?
        const newState = {
          ...gameState,
          walls: oldState.walls,
        };
        return newState;
      }
      return gameState;
    });
  }, []);

  const updateMessage = useCallback((msg: string) => {
    const split_str = msg.split(/\r?\n/);
    setTypewriterText(oldText => [...oldText, ...split_str]);
  }, []);

  const clearPage = useCallback(() => {
    dispatch('clear-page');
    setTypewriterText([]);
  }, []);

  const handleClick = () => {
    switch (state) {
      case 'initial':
        dispatch('start-movie');
        break;
      case 'movie':
        dispatch('start-intro');
        break;
      default:
        break;
    }
  };

  const doDemoColumns = () => {
    dispatch('do-demo-columns');
  };

  const doDemoGame = () => {
    dispatch('do-demo-game');
  };

  function showIntro() {
    return <TypewriterText text={typewriterText} lines={MAX_LINES}></TypewriterText>;
  }

  function demoColumns() {
    return (
      <TypewriterText
        text={[
          '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789',
        ]}
        lines={MAX_LINES}
      ></TypewriterText>
    );
  }

  return (
    <>
      <main className={`min-h-screen flex-col items-center justify-between px-24 py-12 ${crt}`}>
        <div className="z-10 w-full max-w-screen items-center justify-between font-mono text-sm">
          {state == 'initial' && (
            <>
              <div>
                <button onClick={handleClick}>Start Pelita Tournament</button>{' '}
                <button onClick={handleClick}>(quick)</button>
              </div>
              <div>
                <button onClick={doDemoColumns}>Demo Columns</button>{' '}
                <button onClick={doDemoGame}>Demo Maze</button>
              </div>
            </>
          )}
          {state === 'intro' && showIntro()}
          {state === 'demo-columns' && demoColumns()}
          {state === 'demo-game' && <DemoGame clearPage={clearPage} />}

          {state == 'match' && (
            <div>
              <h1 className="fixed top-0 left-0 z-20 w-full px-24 py-4 text-xl">
                ᗧ Pelita Tournament {tournamentMetadata?.location}
              </h1>

              {gameState && tournamentMetadata && (
                <Pelita
                  gameState={gameState}
                  colors={colors}
                  footer={`ᗧ Pelita Tournament, ${tournamentMetadata.location} ${tournamentMetadata.date}`}
                  do_animate={true}
                ></Pelita>
              )}
            </div>
          )}

          <ZMQReceiver
            url="ws://localhost:5556"
            sendGameState={updateGameState}
            sendMessage={updateMessage}
            sendClearPage={clearPage}
            setTournamentMetadata={setTournamentMetadata}
          ></ZMQReceiver>
        </div>
      </main>

      {state == 'movie' && (
        <aside className="video-overlay">
          <video autoPlay controls onEnded={handleClick}>
            <source src={'Pelita Supercut ASPP.mp4'} type="video/mp4" />
          </video>
        </aside>
      )}
    </>
  );
}
export default PelitaTournament;
