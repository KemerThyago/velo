import { deleteOrderByEmail } from '../support/database/orderRepositor'
import { test, expect } from '../support/fixtures'

test.describe('Checkout', () => {


  test.describe('validações de campos obrigatórios', () => {

    let alerts: any

    test.beforeEach(async ({ page, app }) => {
      await page.goto('/order')
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
      alerts = app.checkout.elements.alerts
    })

    test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {

      await app.checkout.submit()
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toHaveText('Email inválido')
      await expect(alerts.phone).toHaveText('Telefone inválido')
      await expect(alerts.document).toHaveText('CPF inválido')
      await expect(alerts.store).toHaveText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })

    test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {
      const customer = {
        name: 'A',
        lastname: 'B',
        email: 'email@gmail.com',
        phone: '11999999999',
        document: '529.982.247-25',
      }


      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()
      await app.checkout.submit()


      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {
      const customer = {
        name: 'Thyago',
        lastname: 'Kemer',
        email: 'email@.com',
        phone: '11999999999',
        document: '529.982.247-25',
      }


      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()
      await app.checkout.submit()


      await expect(alerts.email).toHaveText('Email inválido')
    })

    test('deve exibir erro para CPF inválido', async ({ app }) => {
      const customer = {
        name: 'Thyago',
        lastname: 'Kemer',
        email: 'email@gmail.com',
        phone: '11999999999',
        document: '12345',
      }


      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()
      await app.checkout.submit()


      await expect(alerts.document).toHaveText('CPF inválido')
    })

    test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {
      const customer = {
        name: 'Thyago',
        lastname: 'Kemer',
        email: 'email@gmail.com',
        phone: '11999999999',
        document: '529.982.247-25',
      }

      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await expect(app.checkout.elements.terms).not.toBeChecked()

      await app.checkout.submit()

      await expect(alerts.terms).toHaveText('Aceite os termos')
    })
  })
  test.describe('Pagamento e Confirmação', () => {


    test('CT05 - deve criar pedido com pagamento à vista com sucesso', async ({ page, app }) => {
      const customer = {
        name: 'Carlos',
        lastname: 'Silva',
        email: 'carlos.silva@exemplo.com',
        phone: '11987654321',
        document: '529.982.247-25',
        store: 'Velô Paulista',
        total_price: 'R$ 40.000,00',
        paymentMethod: 'À Vista',
      }
      await deleteOrderByEmail(customer.email)


      await page.goto('/')
      await page.getByRole('link', { name: 'Configure o Seu' }).click()
      await expect(page).toHaveURL(/\/configure/)

      // 2. Configurador -> Checkout
      await app.configurator.expectPrice(customer.total_price)
      await app.configurator.finishConfigurator()

      // 3. Checkout
      await app.checkout.expectLoaded()
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(customer.store)

      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.expectSummaryTotal(customer.total_price)

      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // 4. Confirmação
      await app.checkout.expectResult('Pedido Aprovado!')
    })

  })
})
