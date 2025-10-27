import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import AutomationState from '#models/automation_state'

export default class Automation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare actionId: string

  @column()
  declare actionServiceId: string

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
  declare actionConfig: Record<string, unknown> | null

  @column()
  declare reactionId: string

  @column()
  declare reactionServiceId: string

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
  declare reactionConfig: Record<string, unknown> | null

  @column()
  declare enabled: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasOne(() => AutomationState)
  declare state: HasOne<typeof AutomationState>
}
