import { DateTime } from 'luxon'
import vine from '@vinejs/vine'
import {
  AutomationActionDefinition,
  AutomationEvent,
  AutomationEventPayload,
  AutomationHookResult,
} from '#services/automation/types'
import { SpotifyPollingActionHook, SpotifyPollingCheckpoint } from './spotify_action.js'
import SpotifyApiClient, {
  SpotifyPlaylistTrackItem,
  SpotifyPlaylistSummary,
  SpotifyTrack,
} from '#services/automation/actions/spotify/spotify_api_client'
import { normalizeSpotifyPlaylistId } from '#services/automation/spotify/helpers'

export interface SpotifyPlaylistTrackConfig {
  playlistId: string
}

export interface SpotifyPlaylistTrackCheckpoint extends SpotifyPollingCheckpoint {
  playlistId: string
}

export interface SpotifyPlaylistTrackPayload extends AutomationEventPayload {
  playlistId: string
  playlistName: string
  playlistUrl?: string
  trackId: string
  trackName: string
  artists: { id: string | null; name: string }[]
  album: { id: string | null; name: string; imageUrl?: string }
  addedAt: string
  addedBy?: { id?: string | null; displayName?: string | null }
  spotifyUrl?: string
  previewUrl?: string | null
}

class SpotifyPlaylistTrackHook extends SpotifyPollingActionHook<
  SpotifyPlaylistTrackConfig,
  SpotifyPlaylistTrackCheckpoint,
  SpotifyPlaylistTrackPayload
> {
  constructor(
    client: SpotifyApiClient,
    config: SpotifyPlaylistTrackConfig,
    private readonly playlistSummary: SpotifyPlaylistSummary
  ) {
    super(client, config)
  }

  protected async handlePoll(): Promise<
    AutomationHookResult<SpotifyPlaylistTrackCheckpoint, SpotifyPlaylistTrackPayload>
  > {
    const checkpoint = this.checkpoint || this.createEmptyCheckpoint()
    const items = await this.client.getPlaylistTracks(this.config.playlistId, 50)

    const cursor = this.resolveNewCursor(
      items.map((item: SpotifyPlaylistTrackItem) => ({
        id: item.track?.id ?? null,
        addedAt: item.added_at,
      }))
    )

    if (!checkpoint.initialized) {
      const nextCheckpoint = this.markInitialized(
        {
          ...checkpoint,
          playlistId: this.config.playlistId,
        },
        cursor
      )
      this.checkpoint = nextCheckpoint
      return {
        checkpoint: nextCheckpoint,
        events: [],
      }
    }

    const newItems = this.extractNewItems(items, checkpoint)
    const events = newItems.map((item) => this.makeEvent(item))

    const orderedEvents = events.sort((a, b) => {
      return DateTime.fromISO(a.occurredAt).toMillis() - DateTime.fromISO(b.occurredAt).toMillis()
    })

    const nextCheckpoint = this.updateCursor(checkpoint, cursor)
    this.checkpoint = nextCheckpoint
    return {
      checkpoint: nextCheckpoint,
      events: orderedEvents,
    }
  }

  private extractNewItems(
    items: SpotifyPlaylistTrackItem[],
    checkpoint: SpotifyPlaylistTrackCheckpoint
  ): SpotifyPlaylistTrackItem[] {
    const cursor = checkpoint.cursor
    const validItems = items.filter((item) => item.added_at && item.track?.id)

    if (!cursor) {
      return validItems.sort((a, b) => {
        return DateTime.fromISO(a.added_at!).toMillis() - DateTime.fromISO(b.added_at!).toMillis()
      })
    }

    const cursorTime = DateTime.fromISO(cursor.addedAt)
    const seenAtCursor = new Set(cursor.idsAtCursor)

    return validItems
      .filter((item) => {
        const addedAt = DateTime.fromISO(item.added_at!)
        if (addedAt > cursorTime) {
          return true
        }
        if (addedAt.equals(cursorTime)) {
          return !seenAtCursor.has(item.track!.id!)
        }
        return false
      })
      .sort((a, b) => {
        return DateTime.fromISO(a.added_at!).toMillis() - DateTime.fromISO(b.added_at!).toMillis()
      })
  }

  private makeEvent(item: SpotifyPlaylistTrackItem): AutomationEvent<SpotifyPlaylistTrackPayload> {
    const track = item.track
    if (!track || !track.id) {
      throw new Error('Cannot create event for track without identifier')
    }

    const addedAtIso = item.added_at
      ? (DateTime.fromISO(item.added_at).toISO() ?? DateTime.now().toISO())
      : DateTime.now().toISO()
    const summary = this.playlistSummary

    return {
      id: `${summary.id}:${track.id}:${addedAtIso}`,
      occurredAt: addedAtIso,
      payload: {
        playlistId: summary.id,
        playlistName: summary.name,
        playlistUrl: summary.external_urls?.spotify,
        trackId: track.id,
        trackName: track.name,
        artists: track.artists.map((artist) => ({
          id: artist.id ?? null,
          name: artist.name,
        })),
        album: {
          id: track.album?.id ?? null,
          name: track.album?.name ?? 'Unknown album',
          imageUrl: this.resolveLargestImage(track),
        },
        addedAt: addedAtIso,
        addedBy: summary.owner
          ? {
              id: summary.owner.id ?? undefined,
              displayName: summary.owner.display_name ?? undefined,
            }
          : undefined,
        spotifyUrl: track.external_urls?.spotify,
        previewUrl: track.preview_url ?? null,
      },
    }
  }

  private resolveLargestImage(track: SpotifyTrack): string | undefined {
    if (!track.album?.images || track.album.images.length === 0) {
      return undefined
    }
    const sorted = [...track.album.images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))
    return sorted[0]?.url
  }
}

const configValidator = vine.compile(
  vine.object({
    playlistId: vine
      .string()
      .trim()
      .minLength(5)
      .transform((value) => normalizeSpotifyPlaylistId(value)),
  })
)

export const spotifyPlaylistTrackAction: AutomationActionDefinition<
  SpotifyPlaylistTrackConfig,
  SpotifyPlaylistTrackCheckpoint,
  SpotifyPlaylistTrackPayload
> = {
  id: 'spotify:new_playlist_track',
  serviceId: 'spotify',
  displayName: 'New playlist track',
  description: 'Triggers when a new track is added to the selected Spotify playlist.',
  fields: [
    {
      name: 'playlistId',
      label: 'Playlist',
      type: 'string',
      description:
        'Provide the playlist ID, full Spotify URL, or URI (spotify:playlist:...). Collaborative playlists require edit access.',
      placeholder: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
      required: true,
    },
  ],
  minimumPollingIntervalMs: 60_000,
  async validateConfig(input: unknown) {
    return configValidator.validate(input ?? {})
  },
  async createHook(params) {
    const client = new SpotifyApiClient(params.account)
    const summary = await client.getPlaylistSummary(params.config.playlistId)
    return new SpotifyPlaylistTrackHook(client, params.config, summary)
  },
}
