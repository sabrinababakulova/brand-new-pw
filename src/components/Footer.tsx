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
    <footer className="mt-20 border-t border-[var(--line)] px-4 pb-14 pt-10 text-[var(--sea-ink-soft)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">&copy; {year} SWE. All rights reserved.</p>
        <p className="island-kicker m-0">Built with taste, code, and chaos</p>
      </div>

      <div className="page-wrap mt-4">
        <div className="rounded-2xl border border-[rgba(188,86,145,0.2)] bg-[linear-gradient(165deg,rgba(255,255,255,0.92),rgba(255,244,251,0.86))] px-4 py-3 text-sm dark:border-[rgba(171,129,160,0.34)] dark:bg-[linear-gradient(165deg,rgba(26,24,35,0.96),rgba(22,19,32,0.96))]">
          <span className="font-semibold text-[rgba(129,50,90,0.95)] dark:text-[rgba(241,205,233,0.95)]">
            Now Playing:
          </span>{' '}
          {track?.isPlaying && track.songUrl ? (
            <a
              href={track.songUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--sea-ink)] underline decoration-[rgba(188,86,145,0.4)] underline-offset-2 dark:text-[rgba(241,205,233,0.95)]"
            >
              {track.title} — {track.artist}
            </a>
          ) : (
            <span className="text-[var(--sea-ink-soft)] dark:text-[rgba(214,193,222,0.86)]">
              Not playing anything right now
            </span>
          )}
        </div>
      </div>
    </footer>
  )
}
