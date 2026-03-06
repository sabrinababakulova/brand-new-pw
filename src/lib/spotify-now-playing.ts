type SpotifyTrack = {
  title: string
  artist: string
  album: string
  songUrl: string
  isPlaying: boolean
}

type SpotifyTokenResponse = {
  access_token: string
}

const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const SPOTIFY_NOW_PLAYING_ENDPOINT =
  'https://api.spotify.com/v1/me/player/currently-playing'

export async function getNowPlaying(): Promise<SpotifyTrack | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return null
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const tokenRes = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!tokenRes.ok) {
    return null
  }

  const tokenJson = (await tokenRes.json()) as SpotifyTokenResponse

  const nowPlayingRes = await fetch(SPOTIFY_NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
    },
  })

  if (nowPlayingRes.status === 204 || nowPlayingRes.status === 202) {
    return {
      title: '',
      artist: '',
      album: '',
      songUrl: '',
      isPlaying: false,
    }
  }

  if (!nowPlayingRes.ok) {
    return null
  }

  const song = (await nowPlayingRes.json()) as {
    is_playing?: boolean
    item?: {
      name?: string
      external_urls?: { spotify?: string }
      album?: { name?: string }
      artists?: Array<{ name?: string }>
    }
  }

  if (!song.item) {
    return null
  }

  return {
    title: song.item.name ?? '',
    artist: song.item.artists?.map((a) => a.name).filter(Boolean).join(', ') ?? '',
    album: song.item.album?.name ?? '',
    songUrl: song.item.external_urls?.spotify ?? '',
    isPlaying: Boolean(song.is_playing),
  }
}
