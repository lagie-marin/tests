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
  SpotifySavedTrackItem,
  SpotifyTrack,
} from '#services/automation/actions/spotify/spotify_api_client'

export interface SpotifySavedTrackConfig {}

export interface SpotifySavedTrackCheckpoint extends SpotifyPollingCheckpoint {
  cursor?: {
    addedAt: string
    idsAtCursor: string[]
  }
}

export interface SpotifySavedTrackPayload extends AutomationEventPayload {
  trackId: string
  trackName: string
  artists: {
    id: string | null
    name: string
  }[]
  album: {
    id: string | null
    name: string
    imageUrl?: string
  }
  durationMs: number
  spotifyUrl?: string
  previewUrl?: string | null
  addedAt: string
}

class SpotifySavedTrackHook extends SpotifyPollingActionHook<
  SpotifySavedTrackConfig,
  SpotifySavedTrackCheckpoint,
  SpotifySavedTrackPayload
> {
  constructor(client: SpotifyApiClient, config: SpotifySavedTrackConfig) {
    super(client, config)
  }

  protected async handlePoll(): Promise<
    AutomationHookResult<SpotifySavedTrackCheckpoint, SpotifySavedTrackPayload>
  > {
    const checkpoint = this.checkpoint || this.createEmptyCheckpoint()
    const items = await this.client.getSavedTracks(50)

    const cursor = this.resolveNewCursor(
      items.map((item: SpotifySavedTrackItem) => ({
        id: item.track?.id ?? null,
        addedAt: item.added_at,
      }))
    )

    if (!checkpoint.initialized) {
      const initialized = this.markInitialized(checkpoint, cursor)
      this.checkpoint = initialized
      return {
        checkpoint: initialized,
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
    items: SpotifySavedTrackItem[],
    checkpoint: SpotifySavedTrackCheckpoint
  ): SpotifySavedTrackItem[] {
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

  private makeEvent(item: SpotifySavedTrackItem): AutomationEvent<SpotifySavedTrackPayload> {
    const track = item.track
    if (!track || !track.id) {
      throw new Error('Cannot create event for track without identifier')
    }

    const addedAt = item.added_at
      ? (DateTime.fromISO(item.added_at).toISO() ?? DateTime.now().toISO())
      : DateTime.now().toISO()
    return {
      id: `${track.id}:${addedAt}`,
      occurredAt: addedAt,
      payload: {
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
        durationMs: track.duration_ms,
        spotifyUrl: track.external_urls?.spotify,
        previewUrl: track.preview_url ?? null,
        addedAt,
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

const configValidator = vine.compile(vine.object({}))

export const spotifySavedTrackAction: AutomationActionDefinition<
  SpotifySavedTrackConfig,
  SpotifySavedTrackCheckpoint,
  SpotifySavedTrackPayload
> = {
  id: 'spotify:new_saved_track',
  serviceId: 'spotify',
  displayName: 'New saved track',
  description: 'Triggers when a new track is added to the user library (Liked Songs).',
  fields: [],
  minimumPollingIntervalMs: 60_000,
  async validateConfig(input: unknown) {
    return configValidator.validate(input ?? {})
  },
  createHook(params) {
    const client = new SpotifyApiClient(params.account)
    return new SpotifySavedTrackHook(client, params.config)
  },
}
