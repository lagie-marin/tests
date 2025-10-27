import { automationActionRegistry } from '#services/automation/action_registry'
import { automationReactionRegistry } from '#services/automation/reaction_registry'
import { spotifyAutomationActions } from '#services/automation/actions/spotify/index'
import { spotifyAutomationReactions } from '#services/automation/reactions/spotify/index'

export * from '#services/automation/types'
export * from '#services/automation/action_registry'
export * from '#services/automation/reaction_registry'
export * from '#services/automation/hooks/polling_hook'

let actionsInitialized = false
let reactionsInitialized = false

export function ensureDefaultAutomationActionsRegistered() {
  if (actionsInitialized) {
    return
  }

  automationActionRegistry.registerMany(spotifyAutomationActions)
  actionsInitialized = true
}

export function ensureDefaultAutomationReactionsRegistered() {
  if (reactionsInitialized) {
    return
  }

  automationReactionRegistry.registerMany(spotifyAutomationReactions)
  reactionsInitialized = true
}

export function ensureDefaultAutomationCatalogRegistered() {
  ensureDefaultAutomationActionsRegistered()
  ensureDefaultAutomationReactionsRegistered()
}
