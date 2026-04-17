'use client';

import Compact from '@uiw/react-color-compact';
import { createTimeline } from 'animejs';
import { useCallback, useEffect, useState } from 'react';

import { useMessageReceiver } from '@/app/message_receiver';
import PelitaMatch from '@/app/pelita_match';
import { convertGameState, GameState } from '@/app/pelita_types';


function SingleGame() {
  const [animationState, setAnimationState] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);

  // const [webSocketMode, setWebSocketMode] = useState(false);

  const defaultColors = ['rgb(94, 158, 217)', 'rgb(235, 90, 90)'];

  const [color1, setColor1] = useState(defaultColors[0]);
  const [color2, setColor2] = useState(defaultColors[1]);

  const [showColor1, setShowColor1] = useState(false);
  const [showColor2, setShowColor2] = useState(false);

  useEffect(() => {
    const tl = createTimeline().add(
      'body',
      {
        background: '#fff',
        easing: 'easeout',
        duration: animationState ? 5000 : 0,
      },
      animationState ? 3000 : 0,
    );

    return () => {
      tl.revert();
    };
  }, [animationState, gameState?.game_uuid]);

  const colors: [string, string] = [color1, color2];

  const updateGameState = useCallback((gameState: GameState) => {
    setGameState(oldState => {
      if (!oldState) return gameState;
      if (oldState.game_uuid === gameState.game_uuid) {
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

  const data = useMessageReceiver()
  // console.log(data);

  useEffect(() => {
    if (data?.__action__ === 'observe') {
    const conv = convertGameState(data.__data__);
    updateGameState(conv);
    }
  }, [data, updateGameState]);


  return (
    <div>
      {/* <h1 className="fixed top-0 left-0 z-20 w-full px-24 py-4 text-xl">
      ᗧ Pelita Tournament
    </h1> */}

      {gameState && (
        <PelitaMatch
          gameState={gameState}
          colors={colors}
          footer={`ᗧ Pelita Tournament, location date`}
          do_animate={animationState}
        ></PelitaMatch>
      )}
{/*
      <ZMQReceiver
        sendGameState={updateGameState}
      ></ZMQReceiver> */}

      <div>
        <button
          onClick={() => {
            setAnimationState(e => !e);
          }}
        >
          Animation {animationState ? 'ON' : 'OFF'}
        </button>
        {' | '}
        <span className="relative inline-block">
          <button
            onClick={() => {
              setShowColor1(old => !old);
            }}
          >
            <span className={showColor1 ? 'underline' : ''}>
              Color Bot1 <span style={{ color: color1 }}>⚫&#xFE0E;</span>
            </span>
          </button>{' '}
          {showColor1 && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
              <Compact
                color={color1}
                style={{
                  width: '250px',
                  boxShadow: 'rgb(0 0 0 / 15%) 0px 0px 0px 1px, rgb(0 0 0 / 15%) 0px 8px 16px',
                }}
                onChange={color => {
                  setColor1(color.hex);
                }}
              />
            </div>
          )}
        </span>
        {' | '}
        <span className="relative inline-block">
          <button
            onClick={() => {
              setShowColor2(old => !old);
            }}
          >
            <span className={showColor2 ? 'underline' : ''}>
              Color Bot2 <span style={{ color: color2 }}>⚫&#xFE0E;</span>
            </span>
          </button>{' '}
          {showColor2 && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
              <Compact
                color={color2}
                style={{
                  width: '250px',
                  boxShadow: 'rgb(0 0 0 / 15%) 0px 0px 0px 1px, rgb(0 0 0 / 15%) 0px 8px 16px',
                }}
                onChange={color => {
                  setColor2(color.hex);
                }}
              />
            </div>
          )}
        </span>
        {' | '}
        <button
          onClick={() => {
            setColor1(defaultColors[0]);
            setColor2(defaultColors[1]);
          }}
        >
          Reset Colors
        </button>
      </div>
    </div>
  );
}

export default SingleGame;
