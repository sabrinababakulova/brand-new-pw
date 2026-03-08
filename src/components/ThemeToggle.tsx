import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark'

type ThemeToggleProps = {
  className?: string
}

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyThemeMode(mode: ThemeMode) {
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(mode)
  document.documentElement.setAttribute('data-theme', mode)
  document.documentElement.style.colorScheme = mode
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const [mode, setMode] = useState<ThemeMode>('light')
  const [isBouncing, setIsBouncing] = useState(false)

  useEffect(() => {
    const initialMode = getInitialMode()
    setMode(initialMode)
    applyThemeMode(initialMode)
  }, [])

  function toggleMode() {
    const nextMode: ThemeMode = mode === 'light' ? 'dark' : 'light'
    setMode(nextMode)
    applyThemeMode(nextMode)
    window.localStorage.setItem('theme', nextMode)

    setIsBouncing(true)
    window.setTimeout(() => setIsBouncing(false), 360)
  }

  const isLight = mode === 'light'
  const label = isLight
    ? 'Theme: Sun mode. Click to switch to Moon mode.'
    : 'Theme: Moon mode. Click to switch to Sun mode.'

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      className={`theme-morph-toggle ${className ?? ''} ${
        isBouncing ? 'is-bouncing' : ''
      }`}
    >
      <span className={`theme-icon theme-icon--sun ${isLight ? 'is-on' : ''}`} aria-hidden="true">
        ☀
      </span>
      <span className={`theme-icon theme-icon--moon ${isLight ? '' : 'is-on'}`} aria-hidden="true">
        ☾
      </span>
    </button>
  )
}
