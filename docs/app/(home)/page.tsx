import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col justify-center items-center text-center flex-1 px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">Chronos</h1>

      <p className="text-fd-muted-foreground max-w-xl mb-2">
        Server-side lag compensation for Roblox. The server records player positions, rewinds to the
        moment a shot was fired, and validates the hit against that past state.
      </p>

      <p className="text-fd-muted-foreground text-sm mb-8">Pure Luau. No dependencies, server only.</p>

      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/docs"
          className="rounded-lg px-5 py-2.5 font-medium bg-fd-primary text-fd-primary-foreground hover:opacity-90 transition-opacity"
        >
          Read the docs
        </Link>
        <a
          href="https://github.com/Clovis500c/Chronos/releases"
          className="rounded-lg px-5 py-2.5 font-medium border border-fd-border hover:bg-fd-accent transition-colors"
        >
          Download
        </a>
      </div>
    </main>
  );
}
