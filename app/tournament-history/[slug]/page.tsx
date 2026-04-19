import type { MDXComponents } from 'mdx/types';

import fs from 'fs/promises';

import PelitaReplay from '@/app/pelita_replay';
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

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { default: TournamentPage, frontmatter } = await import(
    `@/content/tournaments/${slug}/tournament.mdx`
  );
  const colorMap = frontmatter?.colors ?? {};

  const components: MDXComponents = {
    PelitaReplay: props => (
      <PelitaReplay src={`${slug}/${props.src}`} colorMap={colorMap}></PelitaReplay>
    ),
    code: ({ children }: { children: string }) => {
      return <code dangerouslySetInnerHTML={{ __html: embolden(escapeHtml(children)) }}></code>;
    },
    ul: props => <ul className="list-(--list-marker) list-inside" {...props}></ul>,
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
