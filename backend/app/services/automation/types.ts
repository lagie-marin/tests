import SocialAccount from '#models/social_account'

export type AutomationServiceId = string
export type MaybePromise<T> = T | Promise<T>

export interface AutomationActionFieldOption {
  value: string
  label: string
  description?: string
}

export type AutomationActionFieldType = 'string' | 'number' | 'select' | 'boolean'

export interface AutomationActionField {
  name: string
  label: string
  type: AutomationActionFieldType
  description?: string
  required?: boolean
  placeholder?: string
  options?: AutomationActionFieldOption[]
}

export interface AutomationEventPayload {
  [key: string]: unknown
}

export interface AutomationEvent<Payload extends AutomationEventPayload> {
  id: string
  occurredAt: string
  payload: Payload
}

export interface AutomationHookResult<Checkpoint, Payload extends AutomationEventPayload> {
  checkpoint: Checkpoint
  events: AutomationEvent<Payload>[]
}

export interface AutomationActionHookParams<Config> {
  account: SocialAccount
  config: Config
}

export interface AutomationActionHook<Checkpoint, Payload extends AutomationEventPayload> {
  loadCheckpoint(checkpoint: Checkpoint | null): void
  execute(): Promise<AutomationHookResult<Checkpoint, Payload>>
}

export interface AutomationActionDefinition<
  Config,
  Checkpoint,
  Payload extends AutomationEventPayload,
> {
  id: string
  serviceId: AutomationServiceId
  displayName: string
  description: string
  fields: AutomationActionField[]
  minimumPollingIntervalMs: number
  validateConfig(input: unknown): MaybePromise<Config>
  createHook(
    params: AutomationActionHookParams<Config>
  ): MaybePromise<AutomationActionHook<Checkpoint, Payload>>
}

export type AnyAutomationActionDefinition = AutomationActionDefinition<
  any,
  any,
  AutomationEventPayload
>

export interface AutomationReactionHandlerParams<Config> {
  account: SocialAccount
  config: Config
}

export interface AutomationReactionHandler<Payload extends AutomationEventPayload> {
  execute(payload: Payload): MaybePromise<void>
}

export interface AutomationReactionDefinition<
  Config,
  Payload extends AutomationEventPayload,
> {
  id: string
  serviceId: AutomationServiceId
  displayName: string
  description: string
  fields: AutomationActionField[]
  validateConfig(input: unknown): MaybePromise<Config>
  createHandler(
    params: AutomationReactionHandlerParams<Config>
  ): MaybePromise<AutomationReactionHandler<Payload>>
}

export type AnyAutomationReactionDefinition = AutomationReactionDefinition<
  any,
  AutomationEventPayload
>
