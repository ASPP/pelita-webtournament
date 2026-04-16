import fs from 'fs/promises';
import Link from 'next/link';

export default async function Page() {
  const availableTournaments = await tournaments();

  return (
    <>
      <ul>
        {availableTournaments.map(entry => (
          <li key={entry.slug}>
            <Link href={`tournament-history/${entry.slug}`}>{entry.slug}</Link>
          </li>
        ))}
      </ul>
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
