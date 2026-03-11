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
        <circle cx="11" cy="11" r="6.25" />
        <path d="m16 16 4.25 4.25" />
      </svg>
    ),
  },
  {
    key: 'custom',
    label: 'Custom',
    href: '#signature',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="toolbar-icon">
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5 20c1.35-3.2 4.05-4.8 7-4.8s5.65 1.6 7 4.8" />
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
