import type { HttpContext } from '@adonisjs/core/http'
import {
  automationActionRegistry,
  ensureDefaultAutomationActionsRegistered,
  AnyAutomationActionDefinition,
} from '#services/automation/index'

function serializeAction(action: AnyAutomationActionDefinition) {
  return {
    id: action.id,
    serviceId: action.serviceId,
    displayName: action.displayName,
    description: action.description,
    fields: action.fields,
    minimumPollingIntervalMs: action.minimumPollingIntervalMs,
  }
}

export default class AutomationActionsController {
  async index({ request, response }: HttpContext) {
    ensureDefaultAutomationActionsRegistered()

    const serviceId = request.qs().serviceId as string | undefined
    const actions = serviceId
      ? automationActionRegistry.listByService(serviceId)
      : automationActionRegistry.listAll()

    return response.ok({
      actions: actions.map(serializeAction),
    })
  }
}
