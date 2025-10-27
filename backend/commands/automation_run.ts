import { BaseCommand } from '@adonisjs/core/ace'
import automationEngine from '#services/automation/engine'

export default class AutomationRun extends BaseCommand {
  static commandName = 'automation:run'
  static description = 'Execute all enabled automations once'
  static settings = {
    loadApp: true,
    startApp: true,
  }

  async run() {
    if (!this.app.isBooted) {
      await this.app.boot()
    }
    if (!this.app.isReady) {
      await this.app.start(() => {})
    }

    await automationEngine.run()
    this.logger.success('Automation engine execution completed')
  }
}
