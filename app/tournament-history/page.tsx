import fs from 'fs/promises';
import Link from 'next/link';

import { H1Underline } from '@/app/utils/utils';

export default async function Page() {
  const availableTournaments = await tournaments();

  return (
    <>
      <H1Underline>ASPP tournament history</H1Underline>
      <ul>
        {availableTournaments.map(entry => (
          <li key={entry.slug}>
            <Link href={`tournament-history/${entry.slug}`} className="hover:underline">
              {entry.slug}
            </Link>
          </li>
        ))}
      </ul>

      <Link href={'/'} className="hover:underline ">
        ... back
      </Link>
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
