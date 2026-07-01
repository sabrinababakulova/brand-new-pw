import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";

type NowPlaying = {
	title: string;
	artist: string;
	songUrl: string;
	isPlaying: boolean;
};

export default function Footer() {
	const year = new Date().getFullYear();
	const [track, setTrack] = useState<NowPlaying | null>(null);

	useEffect(() => {
		let active = true;

		const load = async () => {
			try {
				const response = await fetch("/api/spotify-now-playing");
				const data = (await response.json()) as {
					nowPlaying: NowPlaying | null;
				};
				if (active) {
					setTrack(data.nowPlaying);
				}
			} catch {
				if (active) {
					setTrack(null);
				}
			}
		};

		void load();
		const timer = window.setInterval(load, 60_000);

		return () => {
			active = false;
			window.clearInterval(timer);
		};
	}, []);

	return (
		<footer
			className="border-t py-10 reveal"
			style={{ "--reveal-delay": "720ms" } as CSSProperties}
		>
			<div className="page-shell flex flex-col gap-6">
				<div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
					<div className="space-y-2 text-sm text-muted-foreground">
						<p className="font-medium text-foreground">Sabrina Babakulova</p>
						<p>© {year} Sabrina Babakulova. All rights reserved.</p>
						<p>Tashkent, Uzbekistan</p>
					</div>

					<div className="flex flex-wrap gap-2">
						<Button asChild variant="ghost" size="sm">
							<a
								href="https://github.com/sabrinababakulova"
								target="_blank"
								rel="noreferrer"
							>
								GitHub
							</a>
						</Button>
						<Button asChild variant="ghost" size="sm">
							<a
								href="https://www.linkedin.com/in/sb0304/"
								target="_blank"
								rel="noreferrer"
							>
								LinkedIn
							</a>
						</Button>
						<Button asChild variant="ghost" size="sm">
							<a
								href="https://t.me/toCandyStore"
								target="_blank"
								rel="noreferrer"
							>
								Telegram
							</a>
						</Button>
					</div>
				</div>

				<Separator />

				<Card>
					<CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
						<div className="space-y-1">
							<CardTitle className="text-base">Spotify</CardTitle>
						</div>
						<Badge variant={track?.isPlaying ? "default" : "secondary"}>
							{track?.isPlaying ? "Now playing" : "Offline"}
						</Badge>
					</CardHeader>
					<CardContent>
						{track?.isPlaying && track.songUrl ? (
							<a
								href={track.songUrl}
								target="_blank"
								rel="noreferrer"
								className="text-sm text-muted-foreground underline underline-offset-4"
							>
								{track.title} — {track.artist}
							</a>
						) : (
							<p className="text-sm text-muted-foreground">
								Spotify: not broadcasting right now
							</p>
						)}
					</CardContent>
				</Card>
			</div>
		</footer>
	);
}
