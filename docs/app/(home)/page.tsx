import Link from 'next/link';

const features = [
  ['Rewinds the world', 'A rolling log of every player position, rebuilt at any past moment on demand.'],
  ['Validates from the shooter', 'Hits are tested against the world as the shooter saw it, not where targets moved to.'],
  ['Fixed-rate sampling', 'Records at a steady 30Hz whether the server runs at 60 FPS or stutters under load.'],
  ['Zero dependencies', 'Three Luau files. No framework, no package manager, no build step.'],
  ['Server authoritative', 'Client timestamps are clamped, so a spoofed time cannot rewind five seconds.'],
  ['Interpolated lookups', 'Requested moments rarely land on a snapshot, so CFrame:Lerp fills the gap.'],
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Chronos</h1>

      <p className="mt-4 text-fd-muted-foreground">
        Server-side lag compensation for Roblox. The server records player positions, rewinds to the
        moment a shot was fired, and validates the hit against that past state.
      </p>

      <p className="mt-2 text-sm text-fd-muted-foreground">
        Pure Luau. No dependencies, server only.
      </p>

      <div className="mt-7 flex flex-wrap gap-2">
        <Link
          href="/docs"
          className="rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
        >
          Documentation
        </Link>
        <a
          href="https://github.com/Clovis500c/Chronos/releases"
          className="rounded-md border border-fd-border px-4 py-2 text-sm font-medium transition-colors hover:bg-fd-accent"
        >
          Download .rbxm
        </a>
      </div>

      <hr className="my-12 border-fd-border" />

      <h2 className="text-sm font-medium text-fd-muted-foreground">The problem</h2>

      <p className="mt-3">
        Your screen shows other players where they <em>were</em> a few frames ago. You aim perfectly
        and fire — on the server they have already moved, and the ray passes through empty space.
        The shot was correct and it still did not register.
      </p>

      <p className="mt-3">
        Chronos rewinds its position log to the instant the shot was fired, rebuilds where everyone
        actually was, and judges the ray against that.
      </p>

      <pre className="mt-6 overflow-x-auto rounded-md border border-fd-border bg-fd-card p-4 text-sm">
        <code>{`local Chronos = require(game.ServerStorage.Chronos)

Chronos:Start()

local Hit = Chronos:ValidateHit(Player, Origin, Direction, ClientTime)`}</code>
      </pre>

      <hr className="my-12 border-fd-border" />

      <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {features.map(([title, body]) => (
          <div key={title}>
            <dt className="text-sm font-medium">{title}</dt>
            <dd className="mt-1 text-sm text-fd-muted-foreground">{body}</dd>
          </div>
        ))}
      </dl>

      <hr className="my-12 border-fd-border" />

      <p className="text-sm text-fd-muted-foreground">
        Built by{' '}
        <a href="https://github.com/clovis500c" className="text-fd-foreground underline underline-offset-4">
          clovis500c
        </a>
        . MIT.{' '}
        <Link href="/docs" className="text-fd-foreground underline underline-offset-4">
          Read the docs →
        </Link>
      </p>
    </main>
  );
}
