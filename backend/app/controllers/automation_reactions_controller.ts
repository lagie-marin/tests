import type { HttpContext } from '@adonisjs/core/http'
import {
  automationReactionRegistry,
  ensureDefaultAutomationReactionsRegistered,
  AnyAutomationReactionDefinition,
} from '#services/automation/index'

function serializeReaction(reaction: AnyAutomationReactionDefinition) {
  return {
    id: reaction.id,
    serviceId: reaction.serviceId,
    displayName: reaction.displayName,
    description: reaction.description,
    fields: reaction.fields,
  }
}

export default class AutomationReactionsController {
  async index({ request, response }: HttpContext) {
    ensureDefaultAutomationReactionsRegistered()

    const serviceId = request.qs().serviceId as string | undefined
    const reactions = serviceId
      ? automationReactionRegistry.listByService(serviceId)
      : automationReactionRegistry.listAll()

    return response.ok({
      reactions: reactions.map(serializeReaction),
    })
  }
}
