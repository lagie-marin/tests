import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'social_accounts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()

      table.string('provider', 50).notNullable()
      table.string('provider_account_id', 255).notNullable()
      table.string('username', 255).nullable()
      table.string('display_name', 255).nullable()
      table.string('email', 254).nullable()
      table.string('avatar_url', 512).nullable()
      table.string('profile_url', 512).nullable()

      table.string('access_token', 512).nullable()
      table.string('refresh_token', 512).nullable()
      table.string('token_type', 50).nullable()
      table.timestamp('token_expires_at').nullable()
      table.json('scopes').nullable()
      table.json('metadata').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['provider', 'provider_account_id'], {
        indexName: 'social_accounts_provider_account_unique',
      })
      table.unique(['user_id', 'provider'], {
        indexName: 'social_accounts_user_provider_unique',
      })
      table.index(['user_id'], 'social_accounts_user_id_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
