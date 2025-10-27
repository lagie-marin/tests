import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateAutomationsTable extends BaseSchema {
  protected tableName = 'automations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.string('name', 255).notNullable()
      table.text('description').nullable()

      table.string('action_id', 191).notNullable()
      table.string('action_service_id', 191).notNullable()
      table.jsonb('action_config').nullable()

      table.string('reaction_id', 191).notNullable()
      table.string('reaction_service_id', 191).notNullable()
      table.jsonb('reaction_config').nullable()

      table.boolean('enabled').notNullable().defaultTo(true)

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
