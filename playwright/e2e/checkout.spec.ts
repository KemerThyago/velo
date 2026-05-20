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


    test('deve criar pedido com pagamento à vista com sucesso', async ({ app }) => {
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


      await app.configurator.startFromHome()

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

    test('deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento.', async ({ app }) => {
      const customer = {
        name: 'Ana',
        lastname: 'Carvalho',
        email: 'ana.silva@exemplo.com',
        phone: '11987654321',
        document: '06074140065',
        store: 'Velô Paulista',
        total_price: 'R$ 40.000,00',
        paymentMethod: 'Financiamento',
      }
      await deleteOrderByEmail(customer.email)

      await app.mock.creditAnalysis(710)


      await app.configurator.startFromHome()

      // 2. Configurador -> Checkout
      await app.configurator.expectPrice(customer.total_price)
      await app.configurator.finishConfigurator()

      // 3. Checkout
      await app.checkout.expectLoaded()
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(customer.store)

      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      // await app.checkout.expectSummaryTotal(customer.total_price)

      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // 4. Confirmação
      await app.checkout.expectResult('Pedido Aprovado!')
    })

    test('deve registrar o pedido com status EM_ANALISE quando o score do CPF for médio (entre 501 e 700) no financiamento.', async ({ app }) => {
      const customer = {
        name: 'Bruno',
        lastname: 'Lima',
        email: 'bruno.lima@exemplo.com',
        phone: '11987654321',
        document: '529.982.247-25',
        store: 'Velô Paulista',
        total_price: 'R$ 40.000,00',
        paymentMethod: 'Financiamento',
      }
      await deleteOrderByEmail(customer.email)

      await app.mock.creditAnalysis(600)

      await app.configurator.startFromHome()

      // 2. Configurador -> Checkout
      await app.configurator.expectPrice(customer.total_price)
      await app.configurator.finishConfigurator()

      // 3. Checkout
      await app.checkout.expectLoaded()
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(customer.store)

      await app.checkout.selectPaymentMethod(customer.paymentMethod)

      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // 4. Confirmação (Redirecionamento)
      await app.checkout.expectResult('Pedido em Análise')

      // Capturar o ID do pedido gerado na tela de sucesso
      const orderId = await app.checkout.getOrderId()
      expect(orderId).not.toBeNull()
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento.', async ({ app }) => {
      const customer = {
        name: 'Marcos',
        lastname: 'Pereira',
        email: 'marcos.pereira@exemplo.com',
        phone: '11987654321',
        document: '78721372080',
        store: 'Velô Paulista',
        total_price: 'R$ 40.000,00',
        paymentMethod: 'Financiamento',
      }

      await deleteOrderByEmail(customer.email)

      // Mock da API de análise de crédito — Score baixo (<= 500)
      await app.mock.creditAnalysis(480)

      // 1. Home -> Configurador
      await app.configurator.startFromHome()


      // 2. Configurador -> Checkout
      await app.configurator.expectPrice(customer.total_price)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      // 3. Checkout
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(customer.store)

      await app.checkout.selectPaymentMethod(customer.paymentMethod)

      // Entrada menor que 50% (pré-condição do CT)
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // 4. Confirmação
      await app.checkout.expectResult('Crédito Reprovado')
    })

    test('deve reprovar o crédito quando o score for <= 500 no financiamento com entrada menor que 50%.', async ({ app }) => {
      const customer = {
        name: 'Renata',
        lastname: 'Souza',
        email: 'renata.souza@exemplo.com',
        phone: '11987654321',
        document: '060.741.400-65', // CPF válido
        store: 'Velô Paulista',
        total_price: 'R$ 40.000,00',
        paymentMethod: 'Financiamento',
        downPayment: '10000',
      }

      await deleteOrderByEmail(customer.email)

      await app.mock.creditAnalysis(500)

      await app.configurator.startFromHome()

      await app.configurator.expectPrice(customer.total_price)
      await app.configurator.finishConfigurator()

      await app.checkout.expectLoaded()
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(customer.store)

      await app.checkout.selectPaymentMethod(customer.paymentMethod)

      // Entrada < 50%
      await app.checkout.fillDownPayment(customer.downPayment)

      await app.checkout.acceptTerms()
      await app.checkout.submit()

      await app.checkout.expectResult('Crédito Reprovado')
    })

    test('deve reprovar o crédito quando o score do cpf for menor ou igual a 500 no financiamento com entrada igual a 50%.', async ({ app }) => {
      const customer = {
        name: 'Bruno',
        lastname: 'Lima',
        email: 'bruno.lima@exemplo.com',
        phone: '11966965830',
        document: '22932789058', // CPF válido
        store: 'Velô Paulista',
        total_price: 'R$ 40.000,00',
        paymentMethod: 'Financiamento',
        downPayment: '20000',
      }

      await deleteOrderByEmail(customer.email)

      await app.mock.creditAnalysis(450)

      await app.configurator.startFromHome()

      await app.configurator.expectPrice(customer.total_price)
      await app.configurator.finishConfigurator()

      await app.checkout.expectLoaded()
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(customer.store)

      await app.checkout.selectPaymentMethod(customer.paymentMethod)

      // Entrada < 50%
      await app.checkout.fillDownPayment(customer.downPayment)

      await app.checkout.acceptTerms()
      await app.checkout.submit()

      await app.checkout.expectResult('Pedido Aprovado!')
    })

    test('deve reprovar o crédito quando o score do cpf for menor ou igual a 500 no financiamento com entrada maior que 50%.', async ({ app }) => {
      const customer = {
        name: 'Maria',
        lastname: 'Silva',
        email: 'maria.silva@exemplo.com',
        phone: '11999999999',
        document: '13016581035', // CPF válido
        store: 'Velô Paulista',
        total_price: 'R$ 40.000,00',
        paymentMethod: 'Financiamento',
        downPayment: '30000',
      }

      await deleteOrderByEmail(customer.email)

      await app.mock.creditAnalysis(300)

      await app.configurator.startFromHome()

      await app.configurator.expectPrice(customer.total_price)
      await app.configurator.finishConfigurator()

      await app.checkout.expectLoaded()
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(customer.store)

      await app.checkout.selectPaymentMethod(customer.paymentMethod)

      // Entrada < 50%
      await app.checkout.fillDownPayment(customer.downPayment)

      await app.checkout.acceptTerms()
      await app.checkout.submit()

      await app.checkout.expectResult('Pedido Aprovado!')
    })
  })
})
