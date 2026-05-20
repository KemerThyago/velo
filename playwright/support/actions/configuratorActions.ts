import { Page, expect } from '@playwright/test'

export function createConfiguratorActions(page: Page) {
  const optionalCheckbox = (name: string | RegExp) =>
    page.getByRole('checkbox', { name: name })

  return {
    async open() {
      await page.goto('/configure')
    },

    async startFromHome() {
      await page.goto('/')
      await page.getByRole('link', { name: 'Configure o Seu' }).click()
      await expect(page).toHaveURL(/\/configure/)
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

    async checkOptional(name: string | RegExp) {
      await expect(optionalCheckbox(name)).toBeVisible()
      await optionalCheckbox(name).check()
    },

    async uncheckOptional(name: string | RegExp) {
      await expect(optionalCheckbox(name)).toBeVisible()
      await optionalCheckbox(name).uncheck()
    },

    async finishConfigurator() {
      await page.getByRole('button', { name: 'Monte o Seu' }).click()
      await expect(page).toHaveURL(/\/order$/)
    }
  }
}
