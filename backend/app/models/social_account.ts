import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class SocialAccount extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare provider: string

  @column()
  declare providerAccountId: string

  @column()
  declare username: string | null

  @column()
  declare displayName: string | null

  @column()
  declare email: string | null

  @column()
  declare avatarUrl: string | null

  @column()
  declare profileUrl: string | null

  @column({ serializeAs: null })
  declare accessToken: string | null

  @column({ serializeAs: null })
  declare refreshToken: string | null

  @column({ serializeAs: null })
  declare tokenType: string | null

  @column.dateTime({ serializeAs: null })
  declare tokenExpiresAt: DateTime | null

  @column({
    prepare: (value: string[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: unknown) => {
      if (!value) {
        return null
      }
      if (typeof value === 'string') {
        return JSON.parse(value) as string[]
      }
      return value as string[]
    },
  })
  declare scopes: string[] | null

  @column({
    prepare: (value: Record<string, any> | null) => (value ? JSON.stringify(value) : null),
    consume: (value: unknown) => {
      if (!value) {
        return null
      }
      if (typeof value === 'string') {
        return JSON.parse(value) as Record<string, any>
      }
      return value as Record<string, any>
    },
    serializeAs: null,
  })
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
