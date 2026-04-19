import { createReadStream } from 'fs';
import fs from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';
import readline from 'readline';

import { convertGameStateL, GameState, ObserveGameState } from '@/app/pelita_types';

export async function parseJSON(filePath: string): Promise<ObserveGameState[]> {
  const json = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(json) as ObserveGameState[];
  return data;
}

export function parseJSONL(filePath: string): Promise<ObserveGameState[]> {
  return new Promise((resolve, reject) => {
    const fileStream = createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const results: ObserveGameState[] = [];

    rl.on('line', line => {
      if (line.trim()) {
        try {
          const data = JSON.parse(line.trim().replace(/$/g, '')) as ObserveGameState;
          results.push(data);
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error('Error parsing line:', error.message);
          } else {
            console.error('Unknown error:', error);
          }
        }
      }
    });

    rl.on('close', () => {
      resolve(results);
    });

    rl.on('error', reject);
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; file: string }> },
): Promise<NextResponse<GameState[]>> {
  const { slug, file } = await params;

  const filePath = path.join(process.cwd(), 'content', 'tournaments', slug, file);

  if (file.endsWith('.jsonl')) {
    const data = await parseJSONL(filePath);
    return NextResponse.json(convertGameStateL(data));
  } else {
    const data = await parseJSON(filePath);
    return NextResponse.json(convertGameStateL(data));
  }
}

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const tournamentFolders = await fs.readdir('content/tournaments/', { withFileTypes: true });
  const slugs = [];

  for (const entry of tournamentFolders) {
    if (!entry.isDirectory()) continue;

    const jsonFiles = await fs.readdir(`content/tournaments/${entry.name}`);
    for (const jsonFile of jsonFiles) {
      if (jsonFile.endsWith('.json') || jsonFile.endsWith('.jsonl')) {
        slugs.push({ slug: entry.name, file: jsonFile });
      }
    }
  }

  return slugs;
}
