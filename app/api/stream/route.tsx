import { createSSEHandler } from 'use-next-sse';

import { RootMsg } from '@/app/pelita_types';
import { eventBus } from '@/lib/event-bus';

export const dynamic = 'force-dynamic';

export const GET = createSSEHandler((send, close) => {
  const unsubscribe = eventBus.subscribe(msg => {
    // console.log(msg);
    send(JSON.parse(msg) as RootMsg);
    // close();
  });

  return () => {
    unsubscribe();
  };
});
