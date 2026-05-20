import { Page, expect } from '@playwright/test'



export function createCheckoutActions(page: Page) {

  const terms = page.getByTestId('checkout-terms')

  const inputs = {
    name: page.getByTestId('checkout-name'),
    lastname: page.getByTestId('checkout-lastname'),
    email: page.getByTestId('checkout-email'),
    phone: page.getByTestId('checkout-phone'),
    document: page.getByTestId('checkout-document'),
  }


  const alerts = {
    name: page.getByTestId('error-name'),
    lastname: page.getByTestId('error-lastname'),
    email: page.getByTestId('error-email'),
    phone: page.getByTestId('error-phone'),
    document: page.getByTestId('error-document'),
    store: page.getByTestId('error-store'),
    terms: page.getByTestId('error-terms')
  }

  return {

    elements: {
      terms,
      alerts,
      inputs
    },

    async expectLoaded() {
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },

    async expectSummaryTotal(price: string) {
      await expect(page.getByTestId('summary-total-price')).toHaveText(price)
    },

    async selectStore(storeName: string) {
      await page.getByTestId('checkout-store').click()
      await page.getByRole('option', { name: storeName }).click()
    },

    async selectPaymentMethod(method: string) {
      await page.getByRole('button', { name: new RegExp(method, 'i') }).click()
    },

    async fillDownPayment(value: string) {
      await page.getByTestId('input-entry-value').fill(value)
    },

    async acceptTerms() {
      await terms.check()
    },

    async fillCustomerlData(customer: { name: string; lastname: string; email: string; phone: string; document: string }) {
      await inputs.name.fill(customer.name)
      await inputs.lastname.fill(customer.lastname)
      await inputs.email.fill(customer.email)
      await inputs.phone.fill(customer.phone)
      await inputs.document.fill(customer.document)
    },

    async submit() {
      await page.getByTestId('checkout-submit').click()
    },

    async expectResult(status: string) {
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByTestId('success-status')).toHaveText(status)
    },

    async getOrderId() {
      const orderId = await page.getByTestId('order-id').innerText()
      expect(orderId).not.toBeNull()
      return orderId
    },

  }
}