import { test } from '@japa/runner'
import {
  automationActionRegistry,
  automationReactionRegistry,
  ensureDefaultAutomationActionsRegistered,
  ensureDefaultAutomationReactionsRegistered,
} from '#services/automation/index'

test.group('Automation actions registry', () => {
  test('registers Spotify actions', async ({ assert }) => {
    ensureDefaultAutomationActionsRegistered()

    const spotifyActions = automationActionRegistry.listByService('spotify')
    const actionIds = spotifyActions.map((action) => action.id)

    assert.include(actionIds, 'spotify:new_saved_track')
    assert.include(actionIds, 'spotify:new_playlist_track')
  })

  test('registers Spotify reactions', async ({ assert }) => {
    ensureDefaultAutomationReactionsRegistered()

    const spotifyReactions = automationReactionRegistry.listByService('spotify')
    const reactionIds = spotifyReactions.map((reaction) => reaction.id)

    assert.include(reactionIds, 'spotify:add_track_to_playlist')
    assert.include(reactionIds, 'spotify:save_track')
  })
})
