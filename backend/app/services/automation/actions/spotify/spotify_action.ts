import { DateTime } from 'luxon'
import { PollingAutomationHook, PollingCheckpoint } from '#services/automation/hooks/polling_hook'
import { AutomationEventPayload, AutomationHookResult } from '#services/automation/types'
import SpotifyApiClient from '#services/automation/actions/spotify/spotify_api_client'

export interface SpotifyPollingCheckpoint extends PollingCheckpoint {
  initialized: boolean
  cursor?: {
    addedAt: string
    idsAtCursor: string[]
  }
}

export abstract class SpotifyPollingActionHook<
  Config,
  Checkpoint extends SpotifyPollingCheckpoint,
  Payload extends AutomationEventPayload,
> extends PollingAutomationHook<Checkpoint, Payload> {
  constructor(
    protected readonly client: SpotifyApiClient,
    protected readonly config: Config
  ) {
    super()
  }

  protected createEmptyCheckpoint(): Checkpoint {
    return {
      initialized: false,
      lastPollAt: DateTime.now().toISO(),
    } as Checkpoint
  }

  protected markInitialized(
    checkpoint: Checkpoint,
    cursor: SpotifyPollingCheckpoint['cursor']
  ): Checkpoint {
    const result = {
      ...(checkpoint || this.createEmptyCheckpoint()),
      initialized: true,
      cursor,
      lastPollAt: DateTime.now().toISO(),
    }

    return result as Checkpoint
  }

  protected updateCursor(
    checkpoint: Checkpoint,
    cursor: SpotifyPollingCheckpoint['cursor']
  ): Checkpoint {
    return {
      ...(checkpoint || this.createEmptyCheckpoint()),
      initialized: true,
      cursor,
      lastPollAt: DateTime.now().toISO(),
    } as Checkpoint
  }

  protected abstract handlePoll(): Promise<AutomationHookResult<Checkpoint, Payload>>

  protected async poll(): Promise<AutomationHookResult<Checkpoint, Payload>> {
    return this.handlePoll()
  }

  protected resolveNewCursor(
    items: { id: string | null; addedAt: string | null }[]
  ): SpotifyPollingCheckpoint['cursor'] | undefined {
    const first = items.find((item) => item.addedAt)
    if (!first || !first.addedAt) {
      return undefined
    }

    const referenceTimestamp = first.addedAt
    const idsAtCursor = items
      .filter((item) => item.addedAt === referenceTimestamp && item.id)
      .map((item) => item.id!) // filtered nulls upstream

    if (idsAtCursor.length === 0) {
      return undefined
    }

    return {
      addedAt: referenceTimestamp,
      idsAtCursor,
    }
  }
}
