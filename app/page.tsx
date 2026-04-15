import Link from 'next/link';

export default function Home() {
  return (
    <main
      className={`min-h-screen flex-col items-center justify-between px-24 py-12`}>
      <div className="z-10 w-full max-w-screen items-center justify-between font-mono text-sm text-white">
          <div>
            <Link href="tournament">New Tournament</Link>
          </div>
          <div>
            <Link href="tournament-history">Tournament history</Link>
          </div>
          <div>
            <Link href="demo">Demos</Link>
          </div>
      </div>
    </main>
  );
}
