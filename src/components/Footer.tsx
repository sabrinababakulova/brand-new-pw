import { useEffect, useState } from "react"
import type { CSSProperties } from "react"

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
				const res = await fetch("/api/spotify-now-playing")
				const data = (await res.json()) as { nowPlaying: NowPlaying | null }
				if (active) setTrack(data.nowPlaying)
			} catch {
				if (active) setTrack(null)
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
		<footer className="site-footer reveal" style={{ "--reveal-delay": "720ms" } as CSSProperties}>
			<div className="page-wrap footer-inner">
				<div className="footer-col">
					<p>© {year} Sabrina Babakulova. All rights reserved.</p>
					<p>Tashkent, Uzbekistan</p>
				</div>
				<div className="footer-col footer-links">
					<a href="https://github.com/sabrinababakulova" target="_blank" rel="noreferrer">
						GitHub
					</a>
					<a href="https://www.linkedin.com/in/sb0304/" target="_blank" rel="noreferrer">
						LinkedIn
					</a>
					<a href="https://t.me/toCandyStore" target="_blank" rel="noreferrer">
						Telegram
					</a>
				</div>
				<p className="footer-track">
					{track?.isPlaying && track.songUrl ? (
						<>
							Now playing: <a href={track.songUrl}>{track.title} — {track.artist}</a>
						</>
					) : (
						"Spotify: not broadcasting right now"
					)}
				</p>
			</div>
		</footer>
	)
}
