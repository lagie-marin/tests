import vine from '@vinejs/vine'
import logger from '@adonisjs/core/services/logger'
import { AutomationEventPayload, AutomationReactionDefinition } from '#services/automation/types'
import SpotifyApiClient from '#services/automation/actions/spotify/spotify_api_client'
import { resolveSpotifyTrackId } from '#services/automation/spotify/helpers'
import { SpotifyReactionHandler } from '#services/automation/reactions/spotify/spotify_reaction'

export interface SpotifySaveTrackConfig {
  fallbackTrackId?: string | null
}

export type SpotifySaveTrackPayload = AutomationEventPayload

class SpotifySaveTrackHandler extends SpotifyReactionHandler<
  SpotifySaveTrackConfig,
  SpotifySaveTrackPayload
> {
  async execute(payload: SpotifySaveTrackPayload): Promise<void> {
    const fallback = this.config.fallbackTrackId ? [this.config.fallbackTrackId] : undefined
    const trackIds = this.resolveTrackIds(payload, fallback)

    if (trackIds.length === 0) {
      throw new Error('Aucune piste Spotify valide à enregistrer dans la bibliothèque.')
    }

    logger.debug(
      {
        trackIds,
        hasFallback: Boolean(fallback),
        payloadKeys: Object.keys(payload ?? {}),
      },
      'SpotifySaveTrackHandler: resolved track ids %{trackIds}'
    )

    await this.client.saveTracks(trackIds.slice(0, 50))
  }
}

const configValidator = vine.compile(
  vine.object({
    fallbackTrackId: vine.string().trim().optional(),
  })
)

export const spotifySaveTrackReaction: AutomationReactionDefinition<
  SpotifySaveTrackConfig,
  SpotifySaveTrackPayload
> = {
  id: 'spotify:save_track',
  serviceId: 'spotify',
  displayName: 'Ajouter le titre à "Titres likés"',
  description: 'Enregistre le titre Spotify dans la bibliothèque de l’utilisateur.',
  fields: [
    {
      name: 'fallbackTrackId',
      label: 'Titre de secours',
      type: 'string',
      description:
        'Optionnel. Titre à enregistrer si l’événement ne fournit pas de piste (ID, URL ou URI).',
      placeholder: '0VjIjW4GlUZAMYd2vXMi3b',
      required: false,
    },
  ],
  async validateConfig(input: unknown) {
    const raw = await configValidator.validate(input ?? {})

    const normalized: SpotifySaveTrackConfig = {
      fallbackTrackId: raw.fallbackTrackId ? resolveSpotifyTrackId(raw.fallbackTrackId) : undefined,
    }

    if (raw.fallbackTrackId && !normalized.fallbackTrackId) {
      throw new Error('Référence de piste Spotify invalide pour le titre de secours.')
    }

    return normalized
  },
  createHandler(params) {
    const client = new SpotifyApiClient(params.account)
    return new SpotifySaveTrackHandler(client, params.config)
  },
}
