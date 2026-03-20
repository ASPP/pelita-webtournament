import * as zmq from 'zeromq';

import { eventBus } from './event-bus';

let started = false;

export default async function startZMQSubscriber() {
  if (started) return;
  started = true;

  const sock = new zmq.Subscriber();
  await sock.bind('tcp://127.0.0.1:5559');
  sock.subscribe('');
  console.log('ZMQ subscriber connected', sock);

  (async () => {
  for await (const [msg] of sock) {
    // console.log(msg.toString());
    eventBus.emit(msg.toString());
  }
  })().catch((err: unknown) => {
    console.error('ZMQ error:', err);
  });

  return sock;
}
