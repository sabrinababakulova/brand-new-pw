import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import ThemeToggle from './ThemeToggle'

type NavItem = {
  key: string
  label: string
  href: string
  icon: ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'home',
    label: 'Home',
    href: '#home',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="toolbar-icon">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M6.75 9.75v10.5h10.5V9.75" />
      </svg>
    ),
  },
  {
    key: 'resume',
    label: 'Resume',
    href: '#about',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="toolbar-icon">
        <path d="M7.5 3.75h6.75L18.75 8.25v12H7.5z" />
        <path d="M14.25 3.75v4.5h4.5" />
        <path d="M9.75 12h6" />
        <path d="M9.75 15.75h4.5" />
      </svg>
    ),
  },
  {
    key: 'custom',
    label: 'Custom',
    href: '#signature',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="toolbar-icon">
        <path d="M12 4.5v3" />
        <path d="M12 16.5v3" />
        <path d="m6.75 6.75 2.1 2.1" />
        <path d="m15.15 15.15 2.1 2.1" />
        <path d="M4.5 12h3" />
        <path d="M16.5 12h3" />
        <path d="m6.75 17.25 2.1-2.1" />
        <path d="m15.15 8.85 2.1-2.1" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
]

export default function Header() {
  const [activeKey, setActiveKey] = useState<string>('home')
  const trackRef = useRef<HTMLDivElement | null>(null)
  const buttonRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [indicator, setIndicator] = useState({ x: 0, width: 0 })

  const activeIndex = useMemo(
    () => Math.max(0, NAV_ITEMS.findIndex((item) => item.key === activeKey)),
    [activeKey],
  )

  useEffect(() => {
    function syncFromHash() {
      const hash = window.location.hash
      const found = NAV_ITEMS.find((item) => item.href === hash)
      if (found) {
        setActiveKey(found.key)
      }
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const track = trackRef.current
      const activeButton = buttonRefs.current[activeKey]
      if (!track || !activeButton) return

      const trackRect = track.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()

      setIndicator({
        x: buttonRect.left - trackRect.left,
        width: buttonRect.width,
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [activeKey])

  return (
    <header className="floating-toolbar-wrap">
      <div className="floating-toolbar-glow" aria-hidden="true" />

      <nav className="floating-toolbar" aria-label="Primary">
        <div className="floating-toolbar-grain" aria-hidden="true" />

        <div
          ref={trackRef}
          className="floating-toolbar-track"
          style={
            {
              '--indicator-x': `${indicator.x}px`,
              '--indicator-w': `${indicator.width}px`,
            } as CSSProperties
          }
        >
          <div className="gold-indicator" aria-hidden="true">
            <div className="gold-indicator__glow" />
            <div className="gold-indicator__clip">
              <div className="gold-indicator__spin" />
            </div>
            <div className="gold-indicator__inner" />
          </div>

          {NAV_ITEMS.map((item, index) => (
            <a
              key={item.key}
              ref={(el) => {
                buttonRefs.current[item.key] = el
              }}
              href={item.href}
              onClick={() => setActiveKey(item.key)}
              className={`floating-toolbar-btn ${
                activeIndex === index ? 'is-active' : ''
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </div>

        <div className="floating-toolbar-divider" aria-hidden="true" />
        <ThemeToggle className="floating-theme-toggle" />
      </nav>
    </header>
  )
}
