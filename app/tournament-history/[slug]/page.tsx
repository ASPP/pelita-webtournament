import type { MDXComponents } from 'mdx/types';

import fs from 'fs/promises';

import PelitaReplay from '@/app/pelita_replay';


export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { default: TournamentPage, frontmatter } = await import(`@/content/tournaments/${slug}/tournament.mdx`);
  const colorMap = frontmatter?.colors ?? {};

  const components: MDXComponents = {
    PelitaReplay: (props) => (
      <PelitaReplay src={`${slug}/${props.src}`} colorMap={colorMap}></PelitaReplay>
    )
  }

  return (
    <>
      <main
        className={`max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-62 xl:pr-16 px-4 lg:px-24 py-4 lg:py-12 bg-white`}
      >
        <div className="font-mono text-sm">
          <TournamentPage components={components}></TournamentPage>
        </div>
      </main>
    </>
  );
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
