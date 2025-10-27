import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AutomationState extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare automationId: number

  @column({
    prepare: (value: Record<string, unknown> | null) =>
      value ? JSON.stringify(value) : null,
    consume: (value: unknown) => {
      if (!value) {
        return null
      }

      if (typeof value === 'string') {
        try {
          return JSON.parse(value) as Record<string, unknown>
        } catch {
          return null
        }
      }

      return value as Record<string, unknown>
    },
  })
  declare checkpoint: Record<string, unknown> | null

  @column.dateTime()
  declare lastRunAt: DateTime | null

  @column.dateTime()
  declare lastEventAt: DateTime | null

  @column()
  declare lastError: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
