import { AnyAutomationReactionDefinition } from '#services/automation/types'
import { spotifyAddTrackToPlaylistReaction } from '#services/automation/reactions/spotify/add_track_to_playlist_reaction'
import { spotifySaveTrackReaction } from '#services/automation/reactions/spotify/save_track_reaction'

export const spotifyAutomationReactions: AnyAutomationReactionDefinition[] = [
  spotifyAddTrackToPlaylistReaction,
  spotifySaveTrackReaction,
]
