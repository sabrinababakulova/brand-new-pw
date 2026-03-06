import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

const pillars = [
  {
    title: 'DIRECTION',
    copy: 'I turn abstract ideas into sharp product narratives and interfaces.',
  },
  {
    title: 'EXECUTION',
    copy: 'I ship with precision: design, code, infrastructure, and automation.',
  },
  {
    title: 'PRESENCE',
    copy: 'A feminine edge, a technical core, and a point of view that feels modern.',
  },
]

function App() {
  return (
    <main className="page-wrap px-4 pb-12 pt-14 sm:pt-16">
      <section className="rise-in relative overflow-hidden rounded-[2.4rem] border border-[rgba(188,158,124,0.36)] bg-[linear-gradient(165deg,rgba(255,255,255,0.92),rgba(248,241,235,0.86))] px-6 py-10 shadow-[0_28px_60px_rgba(67,44,23,0.12),inset_0_1px_0_rgba(255,255,255,0.82)] sm:px-12 sm:py-14">
        <div className="pointer-events-none absolute -left-16 -top-14 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(237,214,191,0.52),transparent_70%)]" />
        <div className="pointer-events-none absolute -right-20 top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(223,188,156,0.3),transparent_72%)]" />

        <p className="mb-4 text-[0.68rem] font-bold tracking-[0.24em] text-[rgba(118,82,54,0.88)] uppercase">
          SABRINA BABAKULOVA
        </p>

        <h1 className="display-title max-w-4xl text-5xl leading-[0.9] font-semibold tracking-tight text-[rgba(39,28,20,0.96)] sm:text-7xl">
          Editorial energy.
          <span className="mt-1 block italic text-[rgba(140,92,65,0.94)]">
            Luxury restraint.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-[rgba(74,54,39,0.88)] sm:text-lg">
          I design and build digital experiences with a couture mindset:
          intentional, expressive, and technically grounded. My work blends AI,
          product craft, and clean execution.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="https://github.com/sabrinababakulova"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[rgba(133,93,66,0.42)] bg-[rgba(255,255,255,0.72)] px-5 py-2.5 text-xs font-bold tracking-[0.12em] text-[rgba(64,43,29,0.94)] no-underline uppercase transition hover:-translate-y-0.5 hover:bg-white"
          >
            Explore Work
          </a>
          <a
            href="https://t.me/toCandyStore"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[rgba(184,155,127,0.52)] bg-[rgba(236,219,203,0.46)] px-5 py-2.5 text-xs font-bold tracking-[0.12em] text-[rgba(110,74,48,0.94)] no-underline uppercase transition hover:-translate-y-0.5 hover:bg-[rgba(236,219,203,0.68)]"
          >
            Follow Journal
          </a>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {pillars.map((item, index) => (
          <article
            key={item.title}
            className="rise-in rounded-2xl border border-[rgba(188,158,124,0.26)] bg-[linear-gradient(170deg,rgba(255,255,255,0.8),rgba(248,241,235,0.64))] p-5 shadow-[0_12px_32px_rgba(67,44,23,0.08)]"
            style={{ animationDelay: `${index * 90 + 70}ms` }}
          >
            <h2 className="text-[0.69rem] font-extrabold tracking-[0.2em] text-[rgba(118,82,54,0.88)] uppercase">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[rgba(74,54,39,0.88)]">
              {item.copy}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-[rgba(188,158,124,0.28)] bg-[rgba(255,255,255,0.72)] p-6 shadow-[0_16px_34px_rgba(67,44,23,0.08)] sm:p-8">
        <p className="text-[0.69rem] font-bold tracking-[0.2em] text-[rgba(118,82,54,0.88)] uppercase">
          Brand Note
        </p>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[rgba(39,28,20,0.95)] sm:text-xl">
          For teams and products that want beauty with velocity — not one or the
          other.
        </p>
      </section>
    </main>
  )
}
