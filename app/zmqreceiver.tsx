'use client'

import React, { useEffect, useState } from 'react';
import { conv_game_state } from './pelita_msg';
import type { RootMsg, GameState } from './pelita_msg';
import * as zmq from 'jszmq';


const ZMQReceiver = ({ url, sendGameState, sendMessage, sendClearPage }: { url: string,
  sendGameState: (gs: GameState) => any,
  sendMessage: (msg: string) => any,
  sendClearPage: () => any
 }

) => {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    console.log('hi');
    const socket = zmq.socket('sub');
    socket.options.reconnectInterval = 1000;
    socket.connect(url);
    socket.subscribe('');

    socket.on('message', (message) => {
      setMessages((prevMessages) => [/*...prevMessages, */message.toString()]);
      let parsed = JSON.parse(message) as RootMsg;
      console.log(parsed);
      if (parsed.__action__ === 'SPEAK') {
        // Replacing all ANSI code here
        sendMessage(parsed['__data__'].replaceAll(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''));
      } else if (parsed.__action__ === 'CLEAR') {
        sendClearPage();
      } else if (parsed.__action__ === 'observe') {
        let conv = conv_game_state(parsed.__data__);
        sendGameState(conv);
      } else if (parsed.__action__ === 'INIT') {
        sendClearPage();
      }
    });

    return () => {
      socket.unsubscribe('');
      socket.close();
    };
  }, [url, sendGameState, sendClearPage, sendMessage]);

  return (<></>
    // <footer className="fixed bottom-0 left-0 z-20 w-full p-4 bg-white border-t border-gray-200 shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 dark:border-gray-600">
    //   <h2 className='text-xs text-slate-300'>ZeroMQ Messages:</h2>
    //   <ul>
    //     {messages.map((message, index) => (
    //       <li key={index} className='text-xs text-slate-300' style={{fontSize: 0.45 + 'rem', lineHeight: 0.5 + 'rem'}}>{message}</li>
    //     ))}
    //   </ul>
    // </footer>
  );
};

export default ZMQReceiver;
