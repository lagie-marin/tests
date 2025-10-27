import vine from '@vinejs/vine'
import { AutomationEventPayload, AutomationReactionDefinition } from '#services/automation/types'
import SpotifyApiClient from '#services/automation/actions/spotify/spotify_api_client'
import { normalizeSpotifyPlaylistId, toSpotifyTrackUri } from '#services/automation/spotify/helpers'
import { SpotifyReactionHandler } from '#services/automation/reactions/spotify/spotify_reaction'

export interface SpotifyAddTrackToPlaylistConfig {
  playlistId: string
  fallbackTrackUri?: string | null
}

export type SpotifyTrackPayload = AutomationEventPayload

class SpotifyAddTrackToPlaylistHandler extends SpotifyReactionHandler<
  SpotifyAddTrackToPlaylistConfig,
  SpotifyTrackPayload
> {
  async execute(payload: SpotifyTrackPayload): Promise<void> {
    const fallback = this.config.fallbackTrackUri ? [this.config.fallbackTrackUri] : undefined
    const trackUris = this.resolveTrackUris(payload, fallback)

    if (trackUris.length === 0) {
      throw new Error('Aucune piste Spotify valide à ajouter à la playlist.')
    }

    if (!this.config || typeof this.config.playlistId !== 'string') {
      throw new Error('Configuration de playlist Spotify manquante.')
    }

    const playlistId = normalizeSpotifyPlaylistId(this.config.playlistId)
    await this.client.addTracksToPlaylist(playlistId, trackUris.slice(0, 50))
  }
}

const configValidator = vine.compile(
  vine.object({
    playlistId: vine.string().trim().minLength(5),
    fallbackTrackUri: vine.string().trim().optional(),
  })
)

export const spotifyAddTrackToPlaylistReaction: AutomationReactionDefinition<
  SpotifyAddTrackToPlaylistConfig,
  SpotifyTrackPayload
> = {
  id: 'spotify:add_track_to_playlist',
  serviceId: 'spotify',
  displayName: 'Ajouter un titre à une playlist',
  description: 'Ajoute un ou plusieurs titres Spotify à la playlist sélectionnée.',
  fields: [
    {
      name: 'playlistId',
      label: 'Playlist cible',
      type: 'string',
      description:
        'Identifiant, URL ou URI de la playlist Spotify qui recevra les nouveaux titres.',
      placeholder: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
      required: true,
    },
    {
      name: 'fallbackTrackUri',
      label: 'Titre de secours',
      type: 'string',
      description:
        'Optionnel. Titre à ajouter si l’événement ne fournit pas de piste (ID, URL ou URI).',
      placeholder: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b',
      required: false,
    },
  ],
  async validateConfig(input: unknown) {
    const raw = await configValidator.validate(input ?? {})

    const normalized: SpotifyAddTrackToPlaylistConfig = {
      playlistId: normalizeSpotifyPlaylistId(raw.playlistId),
      fallbackTrackUri: raw.fallbackTrackUri ? toSpotifyTrackUri(raw.fallbackTrackUri) : undefined,
    }

    if (raw.fallbackTrackUri && !normalized.fallbackTrackUri) {
      throw new Error('Référence de piste Spotify invalide pour le titre de secours.')
    }

    return normalized
  },
  createHandler(params) {
    const client = new SpotifyApiClient(params.account)
    return new SpotifyAddTrackToPlaylistHandler(client, params.config)
  },
}
