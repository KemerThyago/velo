import { test as base } from '@playwright/test'
import { createOrderLockupActions } from './actions/orderLockupActions'
import { createConfiguratorActions } from './actions/configuratorActions'
import { createCheckoutActions } from './actions/checkoutActions'
import { createMockActions } from './actions/mockActions'

type App = {
  orderLockup: ReturnType<typeof createOrderLockupActions>
  configurator: ReturnType<typeof createConfiguratorActions>
  checkout: ReturnType<typeof createCheckoutActions>
  mock: ReturnType<typeof createMockActions>
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      orderLockup: createOrderLockupActions(page),
      configurator: createConfiguratorActions(page),
      checkout: createCheckoutActions(page),
      mock: createMockActions(page),
    }

    await use(app)
  },
})

export { expect } from '@playwright/test'

