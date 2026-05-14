import { Page, expect } from '@playwright/test'

export function createConfiguratorActions(page: Page) {
  return {
    async open() {
      await page.goto('/configure')
    },

    async selectColor(name: string) {
      await page.getByRole('button', { name }).click()
    },

    async selectWheels(name: string | RegExp) {
      await page.getByRole('button', { name }).click()
    },

    async expectPrice(price: string) {
      const priceElement = page.getByTestId('total-price')
      await expect(priceElement).toBeVisible()
      await expect(priceElement).toHaveText(price)
    },

    async expectCarImage(expectedSrc: string) {
      const carImage = page.locator('img[alt^="Velô Sprint"]')
      await expect(carImage).toBeVisible()
      await expect(carImage).toHaveAttribute('src', expectedSrc)
    },

    async checkOption(name: string | RegExp) {
      await page.getByRole('checkbox', { name }).check()
    },
    async uncheckOption(name: string | RegExp) {
      await page.getByRole('checkbox', { name }).uncheck()
    },

    async goToCheckout() {
      await page.getByRole('button', { name: 'Monte o Seu' }).click()
      await expect(page).toHaveURL(/\/order$/)
    }
  }
}
