import { AutomationActionHook, AutomationHookResult, AutomationEventPayload } from '#services/automation/types'

export interface PollingCheckpoint {
  lastEventId?: string
  lastPollAt?: string
  [key: string]: unknown
}

export abstract class PollingAutomationHook<
  Checkpoint extends PollingCheckpoint,
  Payload extends AutomationEventPayload,
> implements AutomationActionHook<Checkpoint, Payload>
{
  protected checkpoint: Checkpoint | null = null

  loadCheckpoint(checkpoint: Checkpoint | null): void {
    this.checkpoint = checkpoint
  }

  async execute(): Promise<AutomationHookResult<Checkpoint, Payload>> {
    return this.poll()
  }

  protected abstract poll(): Promise<AutomationHookResult<Checkpoint, Payload>>
}
