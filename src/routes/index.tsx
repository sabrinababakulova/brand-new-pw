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
      <section className="site-panel rise-in relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14">
        <div className="ambient-orb ambient-orb--a" />
        <div className="ambient-orb ambient-orb--b" />

        <p className="site-kicker mb-4">SWE</p>

        <h1 className="display-title max-w-4xl text-5xl leading-[0.95] font-bold tracking-tight text-[var(--site-ink)] sm:text-7xl">
          I build cool
          <span className="block text-[var(--site-gold-soft)]">internet things.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--site-ink-soft)] sm:text-lg">
          Indie hacker, designer-minded engineer, and unapologetically curious creator. I
          ship products at startup speed across AI, UX, and infrastructure.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
          <a
            href="https://github.com/sabrinababakulova"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold"
          >
            GitHub
          </a>
          <a
            href="https://t.me/toCandyStore"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass"
          >
            Telegram Channel
          </a>
        </div>
      </section>

      <section id="about" className="mt-6 grid gap-4 sm:grid-cols-3">
        {traits.map((trait, index) => (
          <article
            key={trait.label}
            className="site-card rise-in p-5"
            style={{ animationDelay: `${index * 100 + 80}ms` }}
          >
            <h2 className="text-sm font-extrabold tracking-[0.11em] text-[var(--site-gold-soft)] uppercase">
              {trait.label}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--site-ink-soft)]">{trait.copy}</p>
          </article>
        ))}
      </section>

      <section id="signature" className="site-card mt-6 p-6 sm:p-8">
        <p className="text-xs font-bold tracking-[0.14em] text-[var(--site-gold)] uppercase">
          Signature
        </p>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[var(--site-ink)] sm:text-xl">
          Bold but intentional. Minimal but expressive. Feminine without losing edge.
        </p>
      </section>
    </main>
  )
}
