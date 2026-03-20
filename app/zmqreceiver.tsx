'use client';

import { useEffect, useState } from 'react';

import type { RootMsg, GameState, TournamentMetadata } from './pelita_msg';

import { useDebugMessages } from './debugmessages';
import { conv_game_state } from './pelita_msg';

function replaceAnsi(s: string) {
  return s.replaceAll(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    '',
  );
}

export default function ZMQReceiver({
  path,
  sendGameState,
  sendMessage,
  sendClearPage,
  setTournamentMetadata,
}: {
  path: string;
  sendGameState: (gs: GameState) => void;
  sendMessage?: (msg: string) => void;
  sendClearPage?: () => void;
  setTournamentMetadata?: (tournamentMetadata: TournamentMetadata) => void;
}) {
  const [isConnected, setIsConnected] = useState(false);

  const { addDebugMessage } = useDebugMessages();

  useEffect(() => {
    const es = new EventSource(path);

    es.onopen = _event => {
      setIsConnected(true);
      // console.log(event);
    };

    es.onerror = err => {
      console.log(err);
    };

    es.onmessage = event => {
      let parsed: RootMsg | undefined = undefined;
      try {
        parsed = JSON.parse(event.data) as RootMsg;
        addDebugMessage(event.data);
      } catch (err) {
        if (err instanceof SyntaxError) {
          addDebugMessage(`Syntax Error: ${event.data}`);
          console.error(err);
        } else {
          addDebugMessage(`Error ${err}: ${event.data}`);
          console.error(err);
        }
      }

      if (!parsed) return;

      // console.log(parsed);

      if (parsed.__action__ === 'SPEAK') {
        // Replacing all ANSI code here
        sendMessage?.(replaceAnsi(parsed.__data__));
      } else if (parsed.__action__ === 'CLEAR') {
        sendClearPage?.();
      } else if (parsed.__action__ === 'observe') {
        const conv = conv_game_state(parsed.__data__);
        sendGameState(conv);
      } else if (parsed.__action__ === 'INIT') {
        const metadata = parsed.__data__;
        console.log('Setting metadata', metadata);
        setTournamentMetadata?.(metadata);
        sendClearPage?.();
      }
    };

    return () => {
      es.close();
    };
  }, [path, sendGameState, sendMessage, sendClearPage, setTournamentMetadata, addDebugMessage]);

  return <></>;
}
