import { test, expect } from '@playwright/test'
import { generateOrderCode, searchOrder } from '../support/helpers'
import { OrderLockupPage} from '../support/pages/OrderLockupPage'

//AAA - Arrange, Act, Assert

test.describe('Consulta de Pedido', ()=> {
  
  test.beforeEach(async ({page}) => {
    await page.goto('http://localhost:5173/')
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
  
    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
  })
  
 

  test('deve consultar um pedido aprovado', async ({ page }) => {

    //Teste Data
      const order = {
      number:'VLO-RLJARM',
      status:'APROVADO',
      color:'Lunar White',
      wheels: 'aero Wheels',
      custumer: {
        name:'Thyago Kemer',
        email:'asokdoaksd@gmail.com'
      },
      payment:'À Vista'
    }
  
    //Act
    const orderLockupPage = new OrderLockupPage(page)
    await orderLockupPage.searchOrder(order.number)



    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - status:
          - img
          - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.custumer.name}
      - paragraph: Email
      - paragraph: ${order.custumer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `);

      const statusBadge = page.getByRole('status').filter({hasText: order.status})

      await expect(statusBadge).toHaveClass(/bg-green-100/)
      await expect(statusBadge).toHaveClass(/text-green-700/)

      const statusIcon= statusBadge.locator('svg')
      await expect(statusIcon).toHaveClass(/lucide-circle-check-big/)
  })  

  test('deve consultar um pedido reprovado', async ({ page }) => {

    // //Teste Data
    // const order = 'VLO-UWXLMT'
    const order = {
      number:'VLO-UWXLMT',
      status:'REPROVADO',
      color:'Midnight Black',
      wheels: 'sport Wheels',
      custumer: {
        name:'Fernando Luiz Whright',
        email:'FernandoWR@gmail.com'
      },
      payment:'À Vista'
    }


    //Act
    const orderLockupPage = new OrderLockupPage(page)
    await orderLockupPage.searchOrder(order.number)


    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - status:
         - img
         - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.custumer.name}
      - paragraph: Email
      - paragraph: ${order.custumer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `);

      const statusBadge = page.getByRole('status').filter({hasText: order.status})

      await expect(statusBadge).toHaveClass(/bg-red-100/)
      await expect(statusBadge).toHaveClass(/text-red-700/)

      const statusIcon= statusBadge.locator('svg')
      await expect(statusIcon).toHaveClass(/lucide-circle-x/)
  })

  test('deve consultar um pedido em analise', async ({ page }) => {

    // //Teste Data
    // const order = 'VLO-UWXLMT'
    const order = {
      number:'VLO-P95460',
      status:'EM_ANALISE',
      color:'Lunar White',
      wheels: 'aero Wheels',
      custumer: {
        name:'Paulo Silva',
        email:'aksodaoskd@gmail.com'
      },
      payment:'À Vista'
    }

    //Act
    const orderLockupPage = new OrderLockupPage(page)
    await orderLockupPage.searchOrder(order.number)

    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - status:
         - img
         - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.custumer.name}
      - paragraph: Email
      - paragraph: ${order.custumer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `);

      const statusBadge = page.getByRole('status').filter({hasText: order.status})

      await expect(statusBadge).toHaveClass(/bg-amber-100/)
      await expect(statusBadge).toHaveClass(/text-amber-700/)

      const statusIcon= statusBadge.locator('svg')
      await expect(statusIcon).toHaveClass(/lucide-clock12/)
  })

  test('deve exibir mensagem de erro quando o pedido não for encontrado', async ({ page }) => {

    const order = generateOrderCode()
   
   //ACT
    const orderLockupPage = new OrderLockupPage(page)
    await orderLockupPage.searchOrder(order)
  
    const title = page.getByRole('heading', { name: 'Pedido não encontrado' })
    await expect(title).toBeVisible()
  
    //Exemplo de uso do toMatchAriaSnapshot para verificar o snapshot do elemento. É o mais rapido.
    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
      `)
  })

})



 