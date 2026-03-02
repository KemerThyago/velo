import { test, expect } from '@playwright/test'

//AAA - Arrange, Act, Assert

test('deve consultar um pedido aprovado', async ({ page }) => {
  //Arrange
  await page.goto('http://localhost:5173/')
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
  await page.getByRole('link', { name: 'Consultar Pedido' }).click()  
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
  
  //Act
//   await page.getByTestId('search-order-id').fill()
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-RLJARM')
  await page.getByTestId('search-order-button').click()

  //Assert
 
//   await expect(page.getByTestId('order-result-id')).toBeVisible({timeout: 30_000})
//   await expect(page.getByTestId('order-result-id')).toContainText('VLO-RLJARM')
  await expect(page.getByText('Pedido', { exact: true })).toBeVisible()
  await expect(page.getByText('VLO-RLJARM')).toContainText('VLO-RLJARM')
  
//   await expect(page.getByTestId('order-result-status')).toBeVisible()
//   await expect(page.getByTestId('order-result-status')).toContainText('APROVADO')
//  await expect(page.getByText('APROVADO')).toBeVisible()

 await expect(page.locator('.bg-green-100').filter({ hasText: 'APROVADO' })).toBeVisible()
 await expect(page.getByText('APROVADO')).toContainText('APROVADO')
})  