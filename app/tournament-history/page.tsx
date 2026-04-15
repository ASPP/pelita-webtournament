import fs from 'fs/promises';
import Link from 'next/link';

export default async function Page() {
  const availableTournaments = await tournaments();

  return (
    <>
      <main
        className={`max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-62 xl:pr-16 px-4 lg:px-24 py-4 lg:py-12 bg-white`}
      >
        <div className="font-mono text-sm">
          <ul>
          {availableTournaments.map(entry => (
            <li key={entry.slug}><Link href={`tournament-history/${entry.slug}`}>{entry.slug}</Link></li>
          ))}
          </ul>
        </div>
      </main>
    </>
  );
}

export async function tournaments() {
  const tournamentFolders = await fs.readdir('content/tournaments/', { withFileTypes: true });

  return tournamentFolders
    .filter(entry => entry.isDirectory())
    .map(entry => {
      return { slug: entry.name };
    });
}
