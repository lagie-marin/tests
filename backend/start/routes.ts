/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')
const SocialAuthController = () => import('#controllers/social_auth_controller')
const SocialAccountsController = () => import('#controllers/social_accounts_controller')
const AutomationActionsController = () => import('#controllers/automation_actions_controller')
const AutomationReactionsController = () => import('#controllers/automation_reactions_controller')
const AutomationsController = () => import('#controllers/automations_controller')
import { middleware } from '#start/kernel'

router.get('/', async () => {
  return {
    message: 'API is running',
  }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('/register', [AuthController, 'register'])
        router.post('/login', [AuthController, 'login'])
        router.get('/me', [AuthController, 'me']).use(middleware.auth())
        router.post('/logout', [AuthController, 'logout']).use(middleware.auth())

        router.get('/social/:provider/redirect', [SocialAuthController, 'redirect'])
        router.get('/social/:provider/callback', [SocialAuthController, 'callback'])

        router.get('/social/providers', [SocialAccountsController, 'index']).use(middleware.auth())
        router.delete('/social/:provider', [SocialAccountsController, 'destroy']).use(middleware.auth())
        router
          .get('/automation/actions', [AutomationActionsController, 'index'])
          .use(middleware.auth())
        router
          .get('/automation/reactions', [AutomationReactionsController, 'index'])
          .use(middleware.auth())
        router.get('/automations', [AutomationsController, 'index']).use(middleware.auth())
        router.post('/automations', [AutomationsController, 'store']).use(middleware.auth())
      })
      .prefix('/auth')
  })
  .prefix('/api')
