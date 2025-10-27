import { DateTime } from 'luxon'
import SocialAccount from '#models/social_account'
import env from '#start/env'

export interface SpotifySavedTrackItem {
  added_at: string
  track: SpotifyTrack | null
}

export interface SpotifyPlaylistTrackItem {
  added_at: string | null
  track: SpotifyTrack | null
}

export interface SpotifyTrack {
  id: string | null
  name: string
  artists: { id: string | null; name: string }[]
  album: {
    id: string | null
    name: string
    images?: { url: string; width?: number; height?: number }[]
  }
  duration_ms: number
  external_urls?: {
    spotify?: string
  }
  preview_url?: string | null
}

export interface SpotifyPlaylistSummary {
  id: string
  name: string
  external_urls?: {
    spotify?: string
  }
  images?: { url: string; width?: number; height?: number }[]
  owner?: {
    id?: string | null
    display_name?: string | null
  }
}

export class SpotifyApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'SpotifyApiError'
  }
}

export interface SpotifyApiClientOptions {
  onCredentialsUpdated?: (account: SocialAccount) => Promise<void> | void
}

export default class SpotifyApiClient {
  private readonly apiBaseUrl = 'https://api.spotify.com/v1'
  private readonly authUrl = 'https://accounts.spotify.com/api/token'

  constructor(
    private account: SocialAccount,
    private options: SpotifyApiClientOptions = {}
  ) {}

  async getSavedTracks(limit = 20): Promise<SpotifySavedTrackItem[]> {
    const response = await this.request<{ items: SpotifySavedTrackItem[] }>(
      `/me/tracks?limit=${limit}`
    )
    return response.items
  }

  async getPlaylistTracks(playlistId: string, limit = 20): Promise<SpotifyPlaylistTrackItem[]> {
    const path = `/playlists/${encodeURIComponent(playlistId)}/tracks?limit=${limit}&fields=items(added_at,track(id,name,artists(id,name),album(id,name,images),duration_ms,external_urls,preview_url))`
    const response = await this.request<{ items: SpotifyPlaylistTrackItem[] }>(path)
    return response.items
  }

  async getPlaylistSummary(playlistId: string): Promise<SpotifyPlaylistSummary> {
    const path = `/playlists/${encodeURIComponent(
      playlistId
    )}?fields=id,name,external_urls,images,owner(id,display_name)`
    return this.request<SpotifyPlaylistSummary>(path)
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<void> {
    const uris = trackUris.filter((uri) => typeof uri === 'string' && uri.length > 0)
    if (uris.length === 0) {
      return
    }

    await this.request<{ snapshot_id: string }>(
      `/playlists/${encodeURIComponent(playlistId)}/tracks`,
      {
        method: 'POST',
        body: JSON.stringify({ uris: uris.slice(0, 100) }),
      }
    )
  }

  async saveTracks(trackIds: string[]): Promise<void> {
    const ids = trackIds.filter((id) => typeof id === 'string' && id.length > 0)
    if (ids.length === 0) {
      return
    }

    console.debug('SpotifyApiClient.saveTracks ids', ids)

    const params = new URLSearchParams({ ids: ids.slice(0, 50).join(',') })
    await this.request<void>(`/me/tracks?${params.toString()}`, { method: 'PUT' }, 0, {
      expectJson: false,
    })
  }

  private async request<T>(
    path: string,
    init?: RequestInit,
    attempt = 0,
    options?: { expectJson?: boolean }
  ): Promise<T> {
    const accessToken = await this.ensureAccessToken()

    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 401 && attempt === 0) {
      await this.refreshAccessToken()
      return this.request(path, init, attempt + 1, options)
    }

    if (!response.ok) {
      let message = `Spotify API request failed with status ${response.status}`
      try {
        const body = await response.json()
        if (body?.error?.message) {
          message = body.error.message
        }
      } catch (error) {
        // ignore JSON parsing errors
      }
      throw new SpotifyApiError(message, response.status)
    }

    if (options?.expectJson === false || response.status === 204) {
      return undefined as T
    }

    try {
      return (await response.json()) as T
    } catch (error) {
      if (options?.expectJson === false) {
        return undefined as T
      }
      throw error
    }
  }

  private async ensureAccessToken(): Promise<string> {
    const accessToken = this.account.accessToken

    if (!accessToken) {
      return this.refreshAccessToken()
    }

    const expiresAt = this.account.tokenExpiresAt
    if (!expiresAt) {
      return accessToken
    }

    const shouldRefresh = expiresAt.diffNow('seconds').seconds < 60
    if (shouldRefresh) {
      return this.refreshAccessToken()
    }

    return accessToken
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = this.account.refreshToken
    if (!refreshToken) {
      throw new Error('Cannot refresh Spotify token without refresh token')
    }

    const clientId = env.get('SPOTIFY_CLIENT_ID')
    const clientSecret = env.get('SPOTIFY_CLIENT_SECRET')
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await fetch(this.authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    })

    if (!response.ok) {
      throw new SpotifyApiError('Failed to refresh Spotify access token', response.status)
    }

    const tokens = (await response.json()) as {
      access_token: string
      refresh_token?: string
      expires_in: number
      token_type?: string
      scope?: string
    }

    this.account.accessToken = tokens.access_token
    if (tokens.refresh_token) {
      this.account.refreshToken = tokens.refresh_token
    }
    if (tokens.token_type) {
      this.account.tokenType = tokens.token_type
    }
    this.account.tokenExpiresAt = DateTime.now().plus({ seconds: tokens.expires_in })

    await this.account.save()
    await this.options.onCredentialsUpdated?.(this.account)

    return this.account.accessToken!
  }
}
