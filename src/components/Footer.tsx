import { useEffect, useState } from 'react'

type NowPlaying = {
  title: string
  artist: string
  songUrl: string
  isPlaying: boolean
}

export default function Footer() {
  const year = new Date().getFullYear()
  const [track, setTrack] = useState<NowPlaying | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const res = await fetch('/api/spotify-now-playing')
        const data = (await res.json()) as { nowPlaying: NowPlaying | null }
        if (active) {
          setTrack(data.nowPlaying)
        }
      } catch {
        if (active) {
          setTrack(null)
        }
      }
    }

    void load()
    const timer = window.setInterval(load, 60_000)

    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  return (
    <footer className="site-footer-wrap mt-20 px-4 pb-24 pt-10 text-[var(--site-ink-soft)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">&copy; {year} SWE. All rights reserved.</p>
        <p className="site-kicker m-0">Built with taste, code, and chaos</p>
      </div>

      <div className="page-wrap mt-4">
        <div className="site-card px-4 py-3 text-sm">
          <span className="font-semibold text-[var(--site-gold-soft)]">Now Playing:</span>{' '}
          {track?.isPlaying && track.songUrl ? (
            <a
              href={track.songUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--site-ink)] underline decoration-[rgba(232,175,72,0.5)] underline-offset-2"
            >
              {track.title} — {track.artist}
            </a>
          ) : (
            <span className="text-[var(--site-ink-soft)]">Not playing anything right now</span>
          )}
        </div>
      </div>
    </footer>
  )
}
