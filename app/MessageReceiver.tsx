'use client';

import { useSSE } from 'use-next-sse';

import type { RootMsg } from './pelita_types';



export function replaceAnsi(s: string) {
  return s.replaceAll(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    '',
  );
}

export function useMessageReceiver(path?: string): RootMsg | undefined {
  path ??= "/api/stream";

  const { data, error } = useSSE<RootMsg>({
    url: path
  });

  if (!data) return;
  return data;
};
