import { AnyAutomationReactionDefinition } from '#services/automation/types'

export class AutomationReactionRegistry {
  private readonly reactions = new Map<string, AnyAutomationReactionDefinition>()

  register(reaction: AnyAutomationReactionDefinition) {
    if (this.reactions.has(reaction.id)) {
      throw new Error(`Automation reaction "${reaction.id}" is already registered`)
    }

    this.reactions.set(reaction.id, reaction)
  }

  registerMany(reactions: AnyAutomationReactionDefinition[]) {
    reactions.forEach((reaction) => this.register(reaction))
  }

  findById(id: string) {
    return this.reactions.get(id) || null
  }

  listAll() {
    return Array.from(this.reactions.values())
  }

  listByService(serviceId: string) {
    return this.listAll().filter((reaction) => reaction.serviceId === serviceId)
  }
}

export const automationReactionRegistry = new AutomationReactionRegistry()
