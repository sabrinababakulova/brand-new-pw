import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

const traits = [
  {
    label: 'Builder-first',
    copy: 'I prototype quickly, ship early, and iterate in public.',
  },
  {
    label: 'AI × Product',
    copy: 'I build practical AI workflows that feel human and useful.',
  },
  {
    label: 'Infra confidence',
    copy: 'I can spin up servers, automate systems, and keep momentum.',
  },
]

function App() {
  return (
    <main id="home" className="page-wrap px-4 pb-10 pt-10 sm:pt-12">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2.2rem] border-[rgba(211,113,166,0.28)] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(246,174,222,0.42),transparent_68%)]" />
        <div className="pointer-events-none absolute -right-20 top-20 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(224,116,183,0.22),transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-12 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,190,221,0.2),transparent_70%)]" />

        <p className="island-kicker mb-4 text-[rgba(129,50,90,0.9)]">SWE</p>

        <h1 className="display-title max-w-4xl text-5xl leading-[0.95] font-bold tracking-tight text-[var(--sea-ink)] sm:text-7xl">
          I build cool
          <span className="block text-[rgba(187,67,138,0.95)]">internet things.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--sea-ink-soft)] sm:text-lg">
          Indie hacker, designer-minded engineer, and unapologetically curious
          creator. I ship products at startup speed across AI, UX, and
          infrastructure.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
          <a
            href="https://github.com/sabrinababakulova"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[rgba(184,75,141,0.34)] bg-[rgba(243,166,212,0.2)] px-5 py-2.5 text-[rgba(126,39,92,1)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(243,166,212,0.32)]"
          >
            GitHub
          </a>
          <a
            href="https://t.me/toCandyStore"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[rgba(41,95,108,0.25)] bg-white/70 px-5 py-2.5 text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(184,75,141,0.45)]"
          >
            Telegram Channel
          </a>
        </div>
      </section>

      <section id="about" className="mt-6 grid gap-4 sm:grid-cols-3">
        {traits.map((trait, index) => (
          <article
            key={trait.label}
            className="island-shell feature-card rise-in rounded-2xl border-[rgba(190,98,151,0.2)] p-5"
            style={{ animationDelay: `${index * 100 + 80}ms` }}
          >
            <h2 className="text-sm font-extrabold tracking-[0.11em] text-[rgba(155,55,112,0.92)] uppercase">
              {trait.label}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
              {trait.copy}
            </p>
          </article>
        ))}
      </section>

      <section id="signature" className="island-shell mt-6 rounded-2xl border-[rgba(190,98,151,0.24)] p-6 sm:p-8">
        <p className="text-xs font-bold tracking-[0.14em] text-[rgba(155,55,112,0.9)] uppercase">
          Signature
        </p>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[var(--sea-ink)] sm:text-xl">
          Bold but intentional. Minimal but expressive. Feminine without losing
          edge.
        </p>
      </section>
    </main>
  )
}
