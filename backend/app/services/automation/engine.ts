import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import Automation from '#models/automation'
import AutomationState from '#models/automation_state'
import SocialAccount from '#models/social_account'
import {
  automationActionRegistry,
  automationReactionRegistry,
  ensureDefaultAutomationCatalogRegistered,
  AutomationActionDefinition,
  AutomationReactionDefinition,
} from '#services/automation/index'

function safeServiceAccountId(serviceId: string) {
  return serviceId
}

export class AutomationEngine {
  async run(): Promise<void> {
    ensureDefaultAutomationCatalogRegistered()

    const automations = await Automation.query()
      .where('enabled', true)
      .preload('state')
      .preload('user')

    if (automations.length === 0) {
      logger.debug('AutomationEngine: no automation to process')
      return
    }

    logger.info(`AutomationEngine: processing ${automations.length} automation(s)`)

    for (const automation of automations) {
      await this.processAutomation(automation).catch((error) => {
        logger.error(
          {
            automationId: automation.id,
            userId: automation.userId,
            error: error?.message,
          },
          'AutomationEngine: failed to process automation %{automationId}'
        )
      })
    }
  }

  private async processAutomation(automation: Automation) {
    const actionDefinition = automationActionRegistry.findById(
      automation.actionId
    ) as AutomationActionDefinition<any, any, any> | null
    const reactionDefinition = automationReactionRegistry.findById(
      automation.reactionId
    ) as AutomationReactionDefinition<any, any> | null

    if (!actionDefinition || !reactionDefinition) {
      logger.warn(
        {
          automationId: automation.id,
        },
        'AutomationEngine: unknown action or reaction. Disabling automation %{automationId}'
      )
      automation.enabled = false
      await automation.save()
      return
    }

    const actionAccount = await this.resolveServiceAccount(
      automation.userId,
      actionDefinition.serviceId
    )

    const reactionAccount = await this.resolveServiceAccount(
      automation.userId,
      reactionDefinition.serviceId
    )

    if (!actionAccount) {
      logger.warn(
        {
          automationId: automation.id,
          serviceId: actionDefinition.serviceId,
        },
        'AutomationEngine: missing social account for action service %{serviceId}'
      )
      await this.markStateFailure(automation, 'Compte manquant pour le service déclencheur.')
      return
    }

    if (!reactionAccount) {
      logger.warn(
        {
          automationId: automation.id,
          serviceId: reactionDefinition.serviceId,
        },
        'AutomationEngine: missing social account for reaction service %{serviceId}'
      )
      await this.markStateFailure(automation, 'Compte manquant pour le service de réaction.')
      return
    }

    const state = await AutomationState.firstOrCreate(
      { automationId: automation.id },
      { checkpoint: null, lastRunAt: null, lastEventAt: null, lastError: null }
    )

    const hook = await actionDefinition.createHook({
      account: actionAccount,
      config: automation.actionConfig ?? {},
    })

    hook.loadCheckpoint(state.checkpoint ? (state.checkpoint as any) : null)

    const result = await hook.execute()

    state.checkpoint = result.checkpoint ?? null
    state.lastRunAt = DateTime.now()
    state.lastError = null

    if (!result.events || result.events.length === 0) {
      state.lastError = null
      await state.save()
      logger.debug(
        {
          automationId: automation.id,
        },
        'AutomationEngine: no events for automation %{automationId}'
      )
      return
    }

    const handlerInstance = await reactionDefinition.createHandler({
      account: reactionAccount,
      config: automation.reactionConfig ?? {},
    })

    for (const event of result.events) {
      try {
        await handlerInstance.execute(event.payload)
        const occurredAt = DateTime.fromISO(event.occurredAt)
        state.lastEventAt = occurredAt.isValid ? occurredAt : DateTime.now()
        logger.info(
          {
            automationId: automation.id,
            eventId: event.id,
            actionId: automation.actionId,
            reactionId: automation.reactionId,
          },
          'AutomationEngine: executed reaction for automation %{automationId}'
        )
      } catch (error: any) {
        state.lastError = error?.message ?? 'Erreur lors de l’exécution de la réaction.'
        logger.error(
          {
            automationId: automation.id,
            eventId: event.id,
            error: error?.message,
          },
          'AutomationEngine: failed executing reaction for automation %{automationId}'
        )
      }
    }

    await state.save()
  }

  private async resolveServiceAccount(userId: number, serviceId: string) {
    const provider = safeServiceAccountId(serviceId)
    return SocialAccount.query().where('userId', userId).andWhere('provider', provider).first()
  }

  private async markStateFailure(automation: Automation, message: string) {
    const state = await AutomationState.firstOrCreate(
      { automationId: automation.id },
      { checkpoint: null, lastRunAt: null, lastEventAt: null, lastError: null }
    )

    state.lastError = message
    state.lastRunAt = DateTime.now()
    await state.save()
  }
}

const automationEngine = new AutomationEngine()
export default automationEngine
