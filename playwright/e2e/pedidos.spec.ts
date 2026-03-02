import { test, expect } from '@playwright/test';

test('deve consultar um pedido aprovado', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  //Checkpoint
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
  //Ação de clicar no link de consulta de pedido
  await page.getByRole('link', { name: 'Consultar Pedido' }).click();
  //Checkpoint
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido');
  // Ação de preencher o campo de busca com o número do pedido
  await page.getByTestId('search-order-id').fill('VLO-RLJARM');
  await page.getByTestId('search-order-button').click();
  //Checkpoint
  await expect(page.getByTestId('order-result-id')).toBeVisible();
  await expect(page.getByTestId('order-result-id')).toContainText('VLO-RLJARM');

  await expect(page.getByTestId('order-result-status')).toBeVisible();
  await expect(page.getByTestId('order-result-status')).toContainText('APROVADO');
});