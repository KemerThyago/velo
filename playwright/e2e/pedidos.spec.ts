import { test, expect } from '@playwright/test'
import { generateOrderCode } from '../support/helpers'

//AAA - Arrange, Act, Assert

test.describe('Consulta de Pedido', ()=> {
  
  test.beforeEach(async ({page}) => {
    await page.goto('http://localhost:5173/')
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
  
    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
  })
  
 

  test('deve consultar um pedido aprovado', async ({ page }) => {

    // //Teste Data
    // const order = 'VLO-RLJARM'

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
    // await page.getByTestId('search-order-id').fill()
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number)
    await page.getByTestId('search-order-button').click()



    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
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
    // await page.getByTestId('search-order-id').fill()
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number)
    await page.getByTestId('search-order-button').click()

    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
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

  })

  test('deve exibir mensagem de erro quando o pedido não for encontrado', async ({ page }) => {

    const order = generateOrderCode()
   
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order)
    await page.getByTestId('search-order-button').click()
  
  
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



 