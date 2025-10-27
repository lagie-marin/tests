import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateAutomationStatesTable extends BaseSchema {
  protected tableName = 'automation_states'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('automation_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('automations')
        .onDelete('CASCADE')
        .unique()

      table.jsonb('checkpoint').nullable()
      table.timestamp('last_run_at', { useTz: true }).nullable()
      table.timestamp('last_event_at', { useTz: true }).nullable()
      table.text('last_error').nullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
