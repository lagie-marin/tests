import { AnyAutomationActionDefinition } from '#services/automation/types'

export class AutomationActionRegistry {
  private readonly actions = new Map<string, AnyAutomationActionDefinition>()

  register(action: AnyAutomationActionDefinition) {
    if (this.actions.has(action.id)) {
      throw new Error(`Automation action "${action.id}" is already registered`)
    }

    this.actions.set(action.id, action)
  }

  registerMany(actions: AnyAutomationActionDefinition[]) {
    actions.forEach((action) => this.register(action))
  }

  findById(id: string) {
    return this.actions.get(id) || null
  }

  listAll() {
    return Array.from(this.actions.values())
  }

  listByService(serviceId: string) {
    return this.listAll().filter((action) => action.serviceId === serviceId)
  }
}

export const automationActionRegistry = new AutomationActionRegistry()
