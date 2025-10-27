import { test } from '@japa/runner'
import User from '#models/user'
import Automation from '#models/automation'
import { automationActionRegistry, automationReactionRegistry, ensureDefaultAutomationCatalogRegistered } from '#services/automation/index'

test.group('Automations | store', (group) => {
  group.each.setup(() => {
    ensureDefaultAutomationCatalogRegistered()
  })

  test('creates an automation for the authenticated user', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'Area',
      lastName: 'User',
      email: 'area-user@example.com',
      password: 'password',
      marketingConsent: false,
      role: 'user',
    })

    const action = automationActionRegistry.listAll()[0]
    const reaction = automationReactionRegistry.listAll()[0]

    const response = await client
      .post('/api/auth/automations')
      .json({
        name: 'Sauvegarder mes titres',
        action: {
          id: action.id,
          config: {},
        },
        reaction: {
          id: reaction.id,
          config: {},
        },
      })
      .loginAs(user)

    response.assertStatus(201)
    const body = response.body()

    assert.exists(body.automation)
    assert.equal(body.automation.name, 'Sauvegarder mes titres')
    assert.equal(body.automation.action.id, action.id)
    assert.equal(body.automation.reaction.id, reaction.id)

    const storedAutomation = await Automation.query().where('id', body.automation.id).preload('state').firstOrFail()
    assert.exists(storedAutomation.state)
  })

  test('returns validation error when registering an unknown action', async ({ client, assert }) => {
    const user = await User.create({
      firstName: 'Area',
      lastName: 'Guest',
      email: 'area-guest@example.com',
      password: 'password',
      marketingConsent: false,
      role: 'user',
    })

    const reaction = automationReactionRegistry.listAll()[0]

    const response = await client
      .post('/api/auth/automations')
      .json({
        name: 'Automation invalide',
        action: {
          id: 'unknown:action',
          config: {},
        },
        reaction: {
          id: reaction.id,
          config: {},
        },
      })
      .loginAs(user)

    response.assertStatus(400)
    assert.equal(response.body().message, 'Action inconnue.')
  })
})
