import type { MDXComponents } from 'mdx/types';

import fs from 'fs/promises';
import path from 'path';

import PelitaReplay from '@/app/pelita_replay';
import { convertGameStateL, GameState, ObserveGameState } from '@/app/pelita_types';

import { parseJSONL } from './[file]/route';
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function embolden(text: string) {
  return text.replace(/\*(.*?)\*/g, '<b>$1</b>');
}

async function preload(slug: string, file: string): Promise<GameState> {
  const filePath = path.join(process.cwd(), 'content', 'tournaments', slug, file);

  if (file.endsWith('.jsonl')) {
    const data = convertGameStateL(await parseJSONL(filePath));
    return data[0];
  } else {
    const json = await fs.readFile(filePath, 'utf8');
    const data = convertGameStateL(JSON.parse(json) as ObserveGameState[]);
    return data[0];
  }
}

async function getJSONFileNames(slug: string) {
  const jsonFiles = [];

  const files = await fs.readdir(`content/tournaments/${slug}`);
  for (const file of files) {
    if (file.endsWith('.json') || file.endsWith('.jsonl')) {
      jsonFiles.push({ slug: slug, file: file });
    }
  }

  return jsonFiles;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { default: TournamentPage, frontmatter } = await import(
    `@/content/tournaments/${slug}/tournament.mdx`
  );
  const colorMap = frontmatter?.colors ?? {};

  const frames = [];
  for (const f of await getJSONFileNames(slug)) {
    const { slug, file } = f;
    frames.push([file, await preload(slug, file)]);
  }

  const lookup = Object.fromEntries(frames) as Record<string, GameState>;

  function doLookup(path: string): GameState {
    if (path.startsWith('./')) path = path.slice(2);
    return lookup[path];
  }

  const components: MDXComponents = {
    PelitaReplay: props => (
      <PelitaReplay
        src={`${slug}/${props.src}`}
        colorMap={colorMap}
        preloadFrame={doLookup(props.src)}
      ></PelitaReplay>
    ),
    code: ({ children }: { children: string }) => {
      return <code dangerouslySetInnerHTML={{ __html: embolden(escapeHtml(children)) }}></code>;
    },
    ul: props => <ul className="list-(--list-marker) list-inside" {...props}></ul>,
    h1: ({children}) => <div><h1>{children}</h1><div>{"=".repeat(children.length)}</div></div>
  };

  return <TournamentPage components={components}></TournamentPage>;
}

export async function generateStaticParams() {
  const tournamentFolders = await fs.readdir('content/tournaments/', { withFileTypes: true });

  return tournamentFolders
    .filter(entry => entry.isDirectory())
    .map(entry => {
      return { slug: entry.name };
    });
}

export const dynamicParams = false;
