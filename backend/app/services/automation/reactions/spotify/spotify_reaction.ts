import { AutomationEventPayload, AutomationReactionHandler } from '#services/automation/types'
import SpotifyApiClient from '#services/automation/actions/spotify/spotify_api_client'
import { resolveSpotifyTrackId, toSpotifyTrackUri } from '#services/automation/spotify/helpers'

function normalizeInputToStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }
  if (typeof value === 'string') {
    return [value]
  }
  return []
}

function expandPotentialTrackIdStrings(value: string): string[] {
  const candidates = new Set<string>()
  const trimmed = value.trim()
  if (!trimmed) {
    return []
  }

  candidates.add(trimmed)

  if (trimmed.includes(':')) {
    trimmed
      .split(':')
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .forEach((part) => candidates.add(part))
  }

  if (trimmed.includes('/')) {
    trimmed
      .split('/')
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .forEach((part) => candidates.add(part))
  }

  if (trimmed.includes(' ')) {
    trimmed
      .split(' ')
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .forEach((part) => candidates.add(part))
  }

  return Array.from(candidates)
}

export abstract class SpotifyReactionHandler<Config, Payload extends AutomationEventPayload>
  implements AutomationReactionHandler<Payload>
{
  constructor(
    protected readonly client: SpotifyApiClient,
    protected readonly config: Config
  ) {}

  abstract execute(payload: Payload): Promise<void> | void

  protected resolveTrackUris(
    payload: AutomationEventPayload,
    fallback?: string | string[]
  ): string[] {
    const payloadAny = payload as Record<string, unknown>
    const candidates: string[] = []

    const arrayKeys = ['trackUris', 'uris', 'tracks']
    const singleKeys = ['trackUri', 'uri', 'spotifyUri']
    const arrayIdKeys = ['trackIds', 'ids']
    const singleIdKeys = ['trackId', 'id', 'spotifyId']

    arrayKeys.forEach((key) => {
      normalizeInputToStringArray(payloadAny[key]).forEach((value) => {
        candidates.push(...expandPotentialTrackIdStrings(value))
      })
    })

    singleKeys.forEach((key) => {
      normalizeInputToStringArray(payloadAny[key]).forEach((value) => {
        candidates.push(...expandPotentialTrackIdStrings(value))
      })
    })

    arrayIdKeys.forEach((key) => {
      normalizeInputToStringArray(payloadAny[key]).forEach((value) => {
        expandPotentialTrackIdStrings(value).forEach((expanded) => {
          const uri = toSpotifyTrackUri(expanded)
        if (uri) {
            candidates.push(uri)
          }
        })
      })
    })

    singleIdKeys.forEach((key) => {
      normalizeInputToStringArray(payloadAny[key]).forEach((value) => {
        expandPotentialTrackIdStrings(value).forEach((expanded) => {
          const uri = toSpotifyTrackUri(expanded)
          if (uri) {
            candidates.push(uri)
          }
        })
      })
    })

    const trackObject = payloadAny.track as Record<string, unknown> | undefined
    if (trackObject && typeof trackObject === 'object') {
      normalizeInputToStringArray(trackObject['uri']).forEach((value) => {
        candidates.push(...expandPotentialTrackIdStrings(value))
      })
      normalizeInputToStringArray(trackObject['id']).forEach((value) => {
        expandPotentialTrackIdStrings(value).forEach((expanded) => {
          const uri = toSpotifyTrackUri(expanded)
          if (uri) {
            candidates.push(uri)
          }
        })
      })
    }

    if (fallback) {
      const fallbackArray = Array.isArray(fallback) ? fallback : [fallback]
      fallbackArray.forEach((value) => {
        expandPotentialTrackIdStrings(value).forEach((expanded) => {
          const uri = toSpotifyTrackUri(expanded)
          if (uri) {
            candidates.push(uri)
          }
        })
      })
    }

    const uris = candidates
      .map((candidate) => toSpotifyTrackUri(candidate))
      .filter((uri): uri is string => Boolean(uri))

    return Array.from(new Set(uris))
  }

  protected resolveTrackIds(
    payload: AutomationEventPayload,
    fallback?: string | string[]
  ): string[] {
    const payloadAny = payload as Record<string, unknown>
    const ids = new Set<string>()

    const gather = (value: unknown) => {
      normalizeInputToStringArray(value).forEach((candidate) => {
        expandPotentialTrackIdStrings(candidate).forEach((expanded) => {
          const id = resolveSpotifyTrackId(expanded)
          if (id) {
            ids.add(id)
          }
        })
      })
    }

    const arrayIdKeys = ['trackIds', 'ids'] as const
    arrayIdKeys.forEach((key) => gather(payloadAny[key]))

    const singleIdKeys = ['trackId', 'id', 'spotifyId'] as const
    singleIdKeys.forEach((key) => gather(payloadAny[key]))

    const trackObject = payloadAny.track as Record<string, unknown> | undefined
    if (trackObject && typeof trackObject === 'object') {
      gather(trackObject['id'])
      gather(trackObject['uri'])
    }

    if (fallback) {
      const fallbackArray = Array.isArray(fallback) ? fallback : [fallback]
      fallbackArray.forEach((value) => {
        expandPotentialTrackIdStrings(value).forEach((expanded) => {
          const id = resolveSpotifyTrackId(expanded)
          if (id) {
            ids.add(id)
          }
        })
      })
    }

    if (ids.size === 0) {
      const uris = this.resolveTrackUris(payload, fallback)
      uris.forEach((uri) => {
        const id = resolveSpotifyTrackId(uri)
        if (id) {
          ids.add(id)
        }
      })
    }

    return Array.from(ids)
  }
}
