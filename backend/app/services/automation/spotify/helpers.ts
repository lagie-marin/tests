const SPOTIFY_ID_REGEX = /^[a-zA-Z0-9]{22}$/

function isValidSpotifyId(value: string) {
  return SPOTIFY_ID_REGEX.test(value)
}

function matchFromUri(value: string, type: 'track' | 'playlist') {
  const pattern = new RegExp(`^spotify:${type}:([a-zA-Z0-9]+)$`, 'i')
  const match = pattern.exec(value.trim())
  if (!match) {
    return null
  }

  const id = match[1]
  return isValidSpotifyId(id) ? id : null
}

function matchFromUrl(value: string, type: 'track' | 'playlist') {
  try {
    const url = new URL(value)
    const pattern = new RegExp(`/${type}/([a-zA-Z0-9]+)`, 'i')
    const match = pattern.exec(url.pathname)
    if (!match) {
      return null
    }

    const id = match[1]
    return isValidSpotifyId(id) ? id : null
  } catch (error) {
    return null
  }
}

function sanitizeSpotifyId(value: string) {
  return value.trim().split('?')[0]
}

export function normalizeSpotifyPlaylistId(value: string): string {
  const trimmed = value.trim()

  const uriId = matchFromUri(trimmed, 'playlist')
  if (uriId) {
    return uriId
  }

  const urlId = matchFromUrl(trimmed, 'playlist')
  if (urlId) {
    return urlId
  }

  const sanitized = sanitizeSpotifyId(trimmed)
  if (isValidSpotifyId(sanitized)) {
    return sanitized
  }

  throw new Error('Référence de playlist Spotify invalide.')
}

export function resolveSpotifyTrackId(value: string): string | null {
  const trimmed = value.trim()
  const uriId = matchFromUri(trimmed, 'track')
  if (uriId) {
    return uriId
  }

  const urlId = matchFromUrl(trimmed, 'track')
  if (urlId) {
    return urlId
  }

  if (/^[a-zA-Z0-9]+$/.test(trimmed)) {
    const sanitized = sanitizeSpotifyId(trimmed)
    return isValidSpotifyId(sanitized) ? sanitized : null
  }

  return null
}

export function toSpotifyTrackUri(value: string): string | null {
  const trackId = resolveSpotifyTrackId(value)
  if (trackId) {
    return `spotify:track:${trackId}`
  }

  if (value.trim().startsWith('spotify:track:')) {
    return value.trim()
  }

  return null
}
