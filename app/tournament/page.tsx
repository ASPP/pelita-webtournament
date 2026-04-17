'use client';

import { createTimeline } from 'animejs';
import { motion } from 'motion/react';
import { Reducer, useCallback, useEffect, useReducer, useState } from 'react';

import DebugFooter from '@/app/debugfooter';
import { useMessageReceiver, replaceAnsi } from '@/app/message_receiver';
import PelitaMatch from '@/app/pelita_match';
import { convertGameState, GameState, TeamMetadata, TournamentMetadata } from '@/app/pelita_types';
import SingleGame from '@/app/single-game';
import TypewriterText from '@/app/typewritertext';
import { ColoredDot } from '@/app/utils/utils';

type PelitaState =
  | 'initial'
  | 'movie'
  | 'drone-messages'
  | 'match'
  | 'faulted'
  | 'single-game'
  | 'demo-columns';
type PelitaEvent =
  | 'start-movie'
  | 'start-drone'
  | 'video-error'
  | 'game-playing'
  | 'clear-page'
  | 'fail'
  | 'do-single-game'
  | 'do-demo-columns';

const MAX_LINES = 20;

const reducer: Reducer<PelitaState, PelitaEvent> = (state, event) => {
  console.log(`${state} -> ${event}`);
  switch (state) {
    case 'initial':
      if (event === 'start-movie') return 'movie';
      if (event === 'do-demo-columns') return 'demo-columns';
      if (event === 'start-drone') return 'drone-messages';
      if (event === 'do-single-game') return 'single-game';
      break;
    case 'movie':
      if (event === 'start-drone') return 'drone-messages';
      if (event === 'video-error') return 'initial';
      break;
    case 'drone-messages':
      if (event === 'game-playing') return 'match';
      if (event === 'clear-page') return 'drone-messages';
      break;
    case 'match':
      if (event === 'game-playing') return 'match';
      if (event === 'clear-page') return 'drone-messages';
      break;
  }
  return state;
};

function TeamReadyness({ teams }: { teams?: TeamMetadata[] }) {
  if (!teams) return <i>Not connected</i>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {Object.entries(teams).map(([_id, team]) => (
        <ColoredDot key={team.spec} color={team.color} />
      ))}
    </motion.div>
  );
}

function PelitaTournament() {
  const initialState: PelitaState = 'initial';
  const [state, dispatch] = useReducer(reducer, initialState);

  const [typewriterText, setTypewriterText] = useState<string[]>([]);

  const [gameState, setGameState] = useState<GameState>();
  const [tournamentMetadata, setTournamentMetadata] = useState<TournamentMetadata>();

  const [apiLocation, setApiLocation] = useState('');

  const bg_color = (state => {
    switch (state) {
      case 'initial':
      case 'movie':
      case 'drone-messages':
        return '#000';

      case 'match':
      default:
        return '#fff';
    }
  })(state);

  const crt = (state => {
    switch (state) {
      case 'initial':
      case 'drone-messages':
      case 'demo-columns':
      case 'movie':
        return 'crt';

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

    console.log(tournamentMetadata);
  }

  const colors: [string, string] = [color1, color2];

  useEffect(() => {
    // window is not available during pre-rendering
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApiLocation(`${window.location.protocol}://${window.location.host}/api/collect`);
  }, []);

  useEffect(() => {
    const tl = createTimeline().add(
      'body',
      {
        background: bg_color,
        easing: 'easeout',
        duration: 5000,
      },
      3000,
    );

    return () => {
      tl.revert();
    };
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

  const doClearPage = useCallback(() => {
    dispatch('clear-page');
    setTypewriterText([]);
  }, []);

  const data = useMessageReceiver();

  if (data && data.__action__ !== 'observe') console.log(data.__action__);

  useEffect(() => {
    // We use an effect so that we don’t act multiple times on new data.
    if (!data) return;

    if (!(data.__action__ === 'observe')) console.log(data.__action__);

    if (data.__action__ === 'SPEAK') {
      // Replacing all ANSI code here
      updateMessage(replaceAnsi(data.__data__));
    } else if (data.__action__ === 'CLEAR') {
      doClearPage();
    } else if (data.__action__ === 'observe') {
      const conv = convertGameState(data.__data__);
      updateGameState(conv);
    } else if (data.__action__ === 'INIT') {
      const metadata = data.__data__;
      console.log('Setting metadata', metadata);
      setTournamentMetadata(metadata);
      doClearPage();
    }
  }, [data, doClearPage, updateGameState, updateMessage]);

  const doDemoColumns = () => {
    dispatch('do-demo-columns');
  };

  function droneMessages() {
    return <TypewriterText text={typewriterText} lines={MAX_LINES}></TypewriterText>;
  }

  function demoColumns() {
    return (
      <>
        <TypewriterText
          text={[
            '123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789',
          ]}
          lines={MAX_LINES}
        ></TypewriterText>
        <p>Normal text</p>
      </>
    );
  }

  return (
    <>
      <main
        className={`min-h-screen flex-col items-center justify-between px-24 py-12 ${crt} crt-blurry-area dark:text-black`}
      >
        <div className="z-10 w-full max-w-screen items-center justify-between font-mono text-base">
          {state == 'initial' && (
            <>
              <div>
                <button
                  onClick={() => {
                    dispatch('start-movie');
                  }}
                >
                  Start Pelita Tournament
                </button>{' '}
                <button
                  onClick={() => {
                    dispatch('start-drone');
                  }}
                >
                  (no intro)
                </button>
              </div>
              <div>
                <TeamReadyness teams={tournamentMetadata?.teams} />
                <p>POST messages to {apiLocation}</p>
              </div>
              <div>
                <button onClick={doDemoColumns}>Demo Columns</button>{' '}
              </div>
              <div>
                <button
                  onClick={() => {
                    dispatch('do-single-game');
                  }}
                >
                  Single game
                </button>
              </div>
            </>
          )}
          {state === 'drone-messages' && droneMessages()}
          {state === 'demo-columns' && demoColumns()}

          {state === 'single-game' && <SingleGame />}

          {state == 'match' && (
            <div>
              <h1 className="fixed top-0 left-0 z-20 w-full px-24 py-4 text-xl">
                ᗧ Pelita Tournament {tournamentMetadata?.location}
              </h1>

              {gameState && tournamentMetadata && (
                <PelitaMatch
                  gameState={gameState}
                  colors={colors}
                  footer={`ᗧ Pelita Tournament, ${tournamentMetadata.location} ${tournamentMetadata.date}`}
                  do_animate={true}
                ></PelitaMatch>
              )}
            </div>
          )}
        </div>
      </main>

      <DebugFooter />

      {state == 'movie' && (
        <aside className="video-overlay">
          <video
            autoPlay
            controls
            onEnded={() => {
              dispatch('start-drone');
            }}
            onError={() => {
              dispatch('video-error');
            }}
          >
            <source src={'Pelita Supercut ASPP.mp4'} type="video/mp4" />
            <p>Video not found.</p>
          </video>
        </aside>
      )}
    </>
  );
}
export default PelitaTournament;
