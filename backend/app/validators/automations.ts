import vine from '@vinejs/vine'

const automationConfigSchema = vine.record(vine.any()).optional()

export const storeAutomationValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().maxLength(2000).optional(),
    action: vine.object({
      id: vine.string().trim().minLength(1),
      config: automationConfigSchema,
    }),
    reaction: vine.object({
      id: vine.string().trim().minLength(1),
      config: automationConfigSchema,
    }),
    enabled: vine.boolean().optional(),
  })
)
