import Link from 'next/link';

export default function Home() {
  return (
    <main className={`min-h-screen flex-col items-center justify-between px-24 py-12`}>
      <div className="z-10 w-full max-w-screen items-center justify-between font-mono text-sm text-amber-100">
        <h1>Pelita tournament web viewer.</h1>
        <div className="mt-4">
          <Link href="tournament">View live tournament</Link> <sup>*</sup>
        </div>
        <div>
          <Link href="tournament-history">ASPP tournament history</Link>
        </div>
        <div>
          <Link href="demo">Demo maze</Link>
        </div>
        <div className="mt-8">
          <hr />
          <small>
            <sup>*</sup> Please note: Viewing a live tournament is only possible when run with a
            proper server. Not on Github. Instructions will follow.
          </small>
        </div>
      </div>
    </main>
  );
}
