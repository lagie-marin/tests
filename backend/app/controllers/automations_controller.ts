import type { HttpContext } from '@adonisjs/core/http'
import Automation from '#models/automation'
import AutomationState from '#models/automation_state'
import {
  automationActionRegistry,
  automationReactionRegistry,
  ensureDefaultAutomationCatalogRegistered,
} from '#services/automation/index'
import { storeAutomationValidator } from '#validators/automations'

export default class AutomationsController {
  async index({ auth }: HttpContext) {
    const user = await auth.authenticate()

    const automations = await Automation.query()
      .where('userId', user.id)
      .preload('state')
      .orderBy('created_at', 'desc')

    return {
      automations: automations.map((automation) => ({
        id: automation.id,
        name: automation.name,
        description: automation.description,
        enabled: automation.enabled,
        action: {
          id: automation.actionId,
          serviceId: automation.actionServiceId,
          config: automation.actionConfig,
        },
        reaction: {
          id: automation.reactionId,
          serviceId: automation.reactionServiceId,
          config: automation.reactionConfig,
        },
        state: automation.state
          ? {
              lastRunAt: automation.state.lastRunAt?.toISO() ?? null,
              lastEventAt: automation.state.lastEventAt?.toISO() ?? null,
              lastError: automation.state.lastError,
              checkpoint: automation.state.checkpoint,
              createdAt: automation.state.createdAt?.toISO() ?? null,
              updatedAt: automation.state.updatedAt?.toISO() ?? null,
            }
          : null,
        createdAt: automation.createdAt.toISO(),
        updatedAt: automation.updatedAt?.toISO() ?? null,
      })),
    }
  }

  async store({ auth, request, response }: HttpContext) {
    const user = await auth.authenticate()
    ensureDefaultAutomationCatalogRegistered()

    const payload = await request.validateUsing(storeAutomationValidator)

    const actionDefinition = automationActionRegistry.findById(payload.action.id)
    if (!actionDefinition) {
      return response.badRequest({
        message: 'Action inconnue.',
        details: { field: 'action.id' },
      })
    }

    const reactionDefinition = automationReactionRegistry.findById(payload.reaction.id)
    if (!reactionDefinition) {
      return response.badRequest({
        message: 'Réaction inconnue.',
        details: { field: 'reaction.id' },
      })
    }

    try {
      const actionConfig = await actionDefinition.validateConfig(payload.action.config ?? {})
      const reactionConfig = await reactionDefinition.validateConfig(payload.reaction.config ?? {})

      const normalizedActionConfig =
        actionConfig && typeof actionConfig === 'object' && Object.keys(actionConfig).length > 0
          ? actionConfig
          : null
      const normalizedReactionConfig =
        reactionConfig && typeof reactionConfig === 'object' && Object.keys(reactionConfig).length > 0
          ? reactionConfig
          : null

      const automation = await Automation.create({
        userId: user.id,
        name: payload.name,
        description: payload.description ?? null,
        actionId: actionDefinition.id,
        actionServiceId: actionDefinition.serviceId,
        actionConfig: normalizedActionConfig,
        reactionId: reactionDefinition.id,
        reactionServiceId: reactionDefinition.serviceId,
        reactionConfig: normalizedReactionConfig,
        enabled: payload.enabled ?? true,
      })

      await AutomationState.firstOrCreate(
        { automationId: automation.id },
        {
          checkpoint: null,
          lastRunAt: null,
          lastEventAt: null,
          lastError: null,
        }
      )

      return response.created({
        message: 'Automation enregistrée avec succès.',
        automation: {
          id: automation.id,
          name: automation.name,
          description: automation.description,
          enabled: automation.enabled,
          action: {
            id: automation.actionId,
            serviceId: automation.actionServiceId,
            config: automation.actionConfig,
          },
          reaction: {
            id: automation.reactionId,
            serviceId: automation.reactionServiceId,
            config: automation.reactionConfig,
          },
          createdAt: automation.createdAt.toISO(),
          updatedAt: automation.updatedAt?.toISO(),
        },
      })
    } catch (error: any) {
      return response.badRequest({
        message: error?.message || 'Configuration invalide pour cette automation.',
      })
    }
  }
}
