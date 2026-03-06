import { createFileRoute } from '@tanstack/react-router'
import { getNowPlaying } from '../lib/spotify-now-playing'

export const Route = createFileRoute('/api/spotify-now-playing')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const nowPlaying = await getNowPlaying()
          return Response.json({ ok: true, nowPlaying })
        } catch {
          return Response.json({ ok: false, nowPlaying: null }, { status: 500 })
        }
      },
    },
  },
})
