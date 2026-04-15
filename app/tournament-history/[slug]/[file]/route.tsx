import fs from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; file: string }> },
) {
  const { slug, file } = await params;
  // console.log(request, slug, file);

  const filePath = path.join(process.cwd(), 'content', 'tournaments', slug, file);

  const json = await fs.readFile(filePath, 'utf8');

  return NextResponse.json(JSON.parse(json));
}

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const tournamentFolders = await fs.readdir('content/tournaments/', { withFileTypes: true });
  const slugs = [];

  for (const entry of tournamentFolders) {
    if (!entry.isDirectory()) continue;

    const jsonFiles = await fs.readdir(`content/tournaments/${entry.name}`);
    for (const jsonFile of jsonFiles) {
      if (!jsonFile.endsWith('.json')) continue;
      slugs.push({ slug: entry.name, file: jsonFile });
    }
  }

  return slugs;
}
