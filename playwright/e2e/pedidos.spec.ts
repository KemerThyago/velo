import { expect, test } from '../support/fixtures'
import { generateOrderCode } from '../support/helpers'
import type { OrderDetails } from '../support/actions/orderLockupActions'
import { insertOrder, deleteOrderByNumber } from '../support/database/orderRepositor'
import testdata from '../support/fixtures/orders.json' with { type: 'json' }

/// AAA - Arrange, Act, Assert

test.describe('Consulta de Pedido', () => {

  test.beforeEach(async ({ app }) => {
    await app.orderLockup.open()
  })

  test('deve consultar um pedido aprovado', async ({ app }) => {
    const order: OrderDetails = testdata.aprovado as OrderDetails

    await deleteOrderByNumber(order.number)
    await insertOrder(order)

    await app.orderLockup.searchOrder(order.number)
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })


  test('deve consultar um pedido reprovado', async ({ app }) => {
    const order: OrderDetails = testdata.reprovado as OrderDetails

    await deleteOrderByNumber(order.number)
    await insertOrder(order)

    await app.orderLockup.searchOrder(order.number)
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido em analise', async ({ app }) => {
    const order: OrderDetails = testdata.em_analise as OrderDetails

    await deleteOrderByNumber(order.number)
    await insertOrder(order)

    await app.orderLockup.searchOrder(order.number)
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })



  test('deve exibir mensagem quando o pedido não é encontrado', async ({ app }) => {
    const order = generateOrderCode()

    await app.orderLockup.searchOrder(order)
    await app.orderLockup.validateOrderNotFound()

  })

  test('deve exibir mensagem quando o pedido está fora do padrão', async ({ app }) => {
    const orderCode = 'DAKSDK123123-INVALIDO'

    await app.orderLockup.searchOrder(orderCode)
    await app.orderLockup.validateOrderNotFound()
  })

  test('deve manter o botão de busca desabilitado com o campo vazio ou apenas espaços', async ({ app, page }) => {

    const button = app.orderLockup.elements.searchButton
    await expect(button).toBeDisabled()

    await app.orderLockup.elements.orderInput.fill('   ')
    await expect(button).toBeDisabled()
  })
})