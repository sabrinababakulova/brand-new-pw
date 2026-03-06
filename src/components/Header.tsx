import { Link } from '@tanstack/react-router'
import BetterAuthHeader from '../integrations/better-auth/header-user.tsx'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-4 z-50 px-4">
      <nav className="page-wrap flex items-center justify-between gap-3 rounded-2xl border border-[rgba(188,86,145,0.24)] bg-[linear-gradient(165deg,rgba(255,255,255,0.76),rgba(255,244,251,0.66))] px-4 py-3 shadow-[0_16px_36px_rgba(140,43,101,0.14),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-xl sm:px-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(190,98,151,0.26)] bg-[rgba(247,191,224,0.24)] px-3 py-1.5 text-sm font-semibold tracking-tight text-[rgba(120,38,89,0.96)] no-underline"
        >
          <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#f3a6d4,#d16eb2)]" />
          Sabrina
        </Link>

        <div className="hidden items-center gap-5 text-xs font-bold tracking-[0.12em] text-[rgba(120,38,89,0.82)] uppercase sm:flex">
          <a href="#home" className="no-underline transition hover:text-[rgba(120,38,89,1)]">
            Home
          </a>
          <a href="#about" className="no-underline transition hover:text-[rgba(120,38,89,1)]">
            About
          </a>
          <a
            href="#signature"
            className="no-underline transition hover:text-[rgba(120,38,89,1)]"
          >
            Signature
          </a>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href="https://github.com/sabrinababakulova"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[rgba(248,219,237,0.65)] hover:text-[var(--sea-ink)] sm:block"
          >
            <span className="sr-only">Go to Sabrina GitHub</span>
            <svg viewBox="0 0 16 16" aria-hidden="true" width="20" height="20">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
          </a>
          <a
            href="https://t.me/toCandyStore"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[rgba(248,219,237,0.65)] hover:text-[var(--sea-ink)] sm:block"
          >
            <span className="sr-only">Open Telegram channel</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
              <path
                fill="currentColor"
                d="M9.78 18.65c-.37 0-.31-.14-.44-.5l-1.11-3.65 8.55-5.41c.4-.24.69-.11.39.16l-6.93 6.26-.27 3.14c.39 0 .56-.18.77-.39l1.86-1.81 3.86 2.85c.71.39 1.22.19 1.4-.66L20.8 4.5c.26-1.03-.39-1.5-1.06-1.2L2.68 9.86c-1.03.42-1.01.99-.18 1.25l4.38 1.37 10.13-6.39c.48-.29.91-.13.55.19"
              />
            </svg>
          </a>
          <BetterAuthHeader />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
