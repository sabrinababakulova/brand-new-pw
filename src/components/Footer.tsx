import { useEffect, useState } from "react"

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
		<footer className="site-footer">
			<div className="page-wrap footer-inner">
				<p>© {year} Sabrina. All rights reserved.</p>
				<p>
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
