import { AnyAutomationActionDefinition } from '#services/automation/types'
import { spotifyPlaylistTrackAction } from './new_playlist_track_action.js'
import { spotifySavedTrackAction } from './new_saved_track_action.js'

export const spotifyAutomationActions: AnyAutomationActionDefinition[] = [
  spotifySavedTrackAction,
  spotifyPlaylistTrackAction,
]
