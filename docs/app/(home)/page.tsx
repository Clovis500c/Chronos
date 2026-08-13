import Link from 'next/link';
import { Crosshair, GitCompareArrows, History, PackageOpen, ServerCog, Timer } from 'lucide-react';

const features = [
  {
    icon: History,
    title: 'Rewinds the world',
    body: 'The server keeps a rolling log of every player position and reconstructs any past moment on demand.',
  },
  {
    icon: Crosshair,
    title: 'Validates from the shooter',
    body: 'Hits are tested against the world as the shooter saw it, not against where targets have since moved.',
  },
  {
    icon: Timer,
    title: 'Fixed-rate sampling',
    body: 'An accumulator keeps recording at a steady 30Hz whether the server runs at 60 FPS or stutters.',
  },
  {
    icon: PackageOpen,
    title: 'Zero dependencies',
    body: 'Three Luau files. No framework, no package manager, no build step. Drop it in and require it.',
  },
  {
    icon: ServerCog,
    title: 'Server authoritative',
    body: 'Client timestamps are clamped to MaxChronos, so a spoofed time cannot rewind five seconds.',
  },
  {
    icon: GitCompareArrows,
    title: 'Interpolated lookups',
    body: 'Requested moments rarely land on a snapshot, so CFrame:Lerp fills the gap between the two around it.',
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-b border-fd-border">
        <div className="absolute inset-0 chronos-grid" aria-hidden />
        <div className="absolute inset-0 chronos-glow" aria-hidden />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:py-32">
          <span className="mb-6 rounded-full border border-fd-border bg-fd-card/60 px-3 py-1 text-xs font-medium text-fd-muted-foreground backdrop-blur">
            Pure Luau · No dependencies · Server only
          </span>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            <span className="chronos-gradient-text">Chronos</span>
          </h1>

          <p className="mt-5 text-lg text-fd-muted-foreground">
            Server-side lag compensation for Roblox. The server records player positions, rewinds to
            the moment a shot was fired, and validates the hit against that past state.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/docs"
              className="rounded-lg bg-fd-primary px-5 py-2.5 font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              Read the docs
            </Link>
            <a
              href="https://github.com/Clovis500c/Chronos/releases"
              className="rounded-lg border border-fd-border px-5 py-2.5 font-medium transition-colors hover:bg-fd-accent"
            >
              Download .rbxm
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-fd-border">
        <div className="mx-auto grid max-w-5xl gap-px bg-fd-border sm:grid-cols-2">
          <div className="bg-fd-background p-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fd-muted-foreground">
              Without compensation
            </h2>
            <p className="text-fd-muted-foreground">
              Your screen shows other players where they <em>were</em> a few frames ago. You aim
              perfectly and fire — on the server they have already moved, and your ray passes through
              empty space. The shot was correct and it still did not register.
            </p>
          </div>

          <div className="bg-fd-background p-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fd-primary">
              With Chronos
            </h2>
            <p className="text-fd-muted-foreground">
              The shot carries the timestamp it was fired at. The server rewinds its position log to
              that instant, rebuilds where everyone actually was, and judges the ray against that.
              Aim correctly on a bad connection and you still hit.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-fd-border bg-fd-card p-5 transition-colors hover:border-fd-primary/40"
            >
              <feature.icon className="mb-3 size-5 text-fd-primary" />
              <h3 className="mb-1.5 font-semibold">{feature.title}</h3>
              <p className="text-sm text-fd-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-fd-border">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold">Three files, one require</h2>
          <p className="mt-3 text-fd-muted-foreground">
            Drop the module in <code className="text-fd-primary">ServerStorage</code> and start
            recording.
          </p>

          <pre className="mt-6 overflow-x-auto rounded-xl border border-fd-border bg-fd-card p-5 text-left text-sm">
            <code>{`local Chronos = require(game.ServerStorage.Chronos)

Chronos:Start()

local Hit = Chronos:ValidateHit(Player, Origin, Direction, ClientTime)`}</code>
          </pre>

          <Link
            href="/docs"
            className="mt-8 inline-block rounded-lg bg-fd-primary px-5 py-2.5 font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </section>
    </main>
  );
}
