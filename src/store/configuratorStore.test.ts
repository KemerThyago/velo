import { describe, it, expect } from 'vitest';
import {
  calculateTotalPrice,
  calculateInstallment,
  formatPrice,
  CarConfiguration,
  useConfiguratorStore,
} from './configuratorStore';

describe('configuratorStore pure functions', () => {
  describe('calculateTotalPrice', () => {
    it('should calculate base price with aero wheels and no optionals', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: [],
      };
      expect(calculateTotalPrice(config)).toBe(40000);
    });

    it('should add sport wheels price correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: [],
      };
      expect(calculateTotalPrice(config)).toBe(42000);
    });

    it('should add optionals price correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: ['precision-park', 'flux-capacitor'],
      };
      expect(calculateTotalPrice(config)).toBe(40000 + 5500 + 5000); // Base + Precision Park + Flux Capacitor
    });
  });

  describe('calculateInstallment', () => {
    it('should calculate 12x installment with 2% monthly interest correctly', () => {
      // 40000 total -> 12x at 2% monthly
      const total = 40000;
      const installment = calculateInstallment(total);
      // Math.round(((40000 * 0.02 * Math.pow(1.02, 12)) / (Math.pow(1.02, 12) - 1)) * 100) / 100 => 3782.38
      expect(installment).toBe(3782.38);
    });
  });

  describe('formatPrice', () => {
    it('should format numbers to BRL currency string', () => {
      const formatted = formatPrice(40000);
      // To avoid issues with normal space vs non-breaking space (unicode \u00A0) in Intl.NumberFormat:
      const normalized = formatted.replace(/\s/g, ' ');
      expect(normalized).toContain('R$');
      expect(normalized).toContain('40.000,00');
    });
  });
});

describe('configuratorStore actions', () => {
  it('should toggle an optional feature correctly', () => {
    // Reset state before test
    useConfiguratorStore.getState().resetConfiguration();

    // Initial state has no optionals
    expect(useConfiguratorStore.getState().configuration.optionals).toEqual([]);

    // Toggle a feature (should add it)
    useConfiguratorStore.getState().toggleOptional('precision-park');
    expect(useConfiguratorStore.getState().configuration.optionals).toContain('precision-park');

    // Toggle the same feature (should remove it)
    useConfiguratorStore.getState().toggleOptional('precision-park');
    expect(useConfiguratorStore.getState().configuration.optionals).not.toContain('precision-park');
  });

  it('should handle login logic depending on previous orders', () => {
    useConfiguratorStore.setState({ orders: [] });
    useConfiguratorStore.getState().logout();

    // Login fails if there are no orders for the email
    const loginResult1 = useConfiguratorStore.getState().login('test@example.com');
    expect(loginResult1).toBe(false);
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull();

    // Add a mock order
    useConfiguratorStore.setState({
      orders: [
        {
          id: '1',
          configuration: { exteriorColor: 'glacier-blue', interiorColor: 'carbon-black', wheelType: 'aero', optionals: [] },
          totalPrice: 40000,
          customer: { name: 'Test', surname: 'User', email: 'test@example.com', phone: '', cpf: '', store: '' },
          paymentMethod: 'avista',
          status: 'APROVADO',
          createdAt: new Date().toISOString(),
        },
      ],
    });

    // Login succeeds now
    const loginResult2 = useConfiguratorStore.getState().login('test@example.com');
    expect(loginResult2).toBe(true);
    expect(useConfiguratorStore.getState().currentUserEmail).toBe('test@example.com');
  });

  it('should add a new order correctly', () => {
    useConfiguratorStore.setState({ orders: [] });

    const newOrder = {
      id: 'VLO-123456',
      configuration: {
        exteriorColor: 'midnight-black' as const,
        interiorColor: 'carbon-black' as const,
        wheelType: 'sport' as const,
        optionals: ['precision-park' as const],
      },
      totalPrice: 47500,
      customer: {
        name: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        phone: '11987654321',
        cpf: '12345678901',
        store: 'SP-Market',
      },
      paymentMethod: 'financiamento' as const,
      status: 'EM_ANALISE' as const,
      createdAt: new Date().toISOString(),
    };

    useConfiguratorStore.getState().addOrder(newOrder);

    const orders = useConfiguratorStore.getState().orders;
    expect(orders).toHaveLength(1);
    expect(orders[0]).toEqual(newOrder);
  });

  it('should manage getUserOrders correctly with privacy and filtering', () => {
    // Reset state and logout
    useConfiguratorStore.setState({ orders: [], currentUserEmail: null });

    // Empty orders returned when no user is logged in
    expect(useConfiguratorStore.getState().getUserOrders()).toEqual([]);

    const orderUserA = {
      id: 'A1',
      configuration: { exteriorColor: 'glacier-blue' as const, interiorColor: 'carbon-black' as const, wheelType: 'aero' as const, optionals: [] },
      totalPrice: 40000,
      customer: { name: 'Alice', surname: 'Smith', email: 'alice@example.com', phone: '', cpf: '', store: '' },
      paymentMethod: 'avista' as const,
      status: 'APROVADO' as const,
      createdAt: new Date().toISOString(),
    };

    const orderUserB = {
      id: 'B1',
      configuration: { exteriorColor: 'midnight-black' as const, interiorColor: 'carbon-black' as const, wheelType: 'sport' as const, optionals: [] },
      totalPrice: 42000,
      customer: { name: 'Bob', surname: 'Jones', email: 'bob@example.com', phone: '', cpf: '', store: '' },
      paymentMethod: 'financiamento' as const,
      status: 'EM_ANALISE' as const,
      createdAt: new Date().toISOString(),
    };

    useConfiguratorStore.setState({ orders: [orderUserA, orderUserB] });

    // Login Alice
    useConfiguratorStore.setState({ currentUserEmail: 'alice@example.com' });
    const aliceOrders = useConfiguratorStore.getState().getUserOrders();
    expect(aliceOrders).toHaveLength(1);
    expect(aliceOrders[0].customer.email).toBe('alice@example.com');
    expect(aliceOrders[0].id).toBe('A1');

    // Login Bob
    useConfiguratorStore.setState({ currentUserEmail: 'bob@example.com' });
    const bobOrders = useConfiguratorStore.getState().getUserOrders();
    expect(bobOrders).toHaveLength(1);
    expect(bobOrders[0].customer.email).toBe('bob@example.com');
    expect(bobOrders[0].id).toBe('B1');

    // Non-existent user
    useConfiguratorStore.setState({ currentUserEmail: 'unknown@example.com' });
    expect(useConfiguratorStore.getState().getUserOrders()).toEqual([]);
  });

  it('should reset car configuration to default values', () => {
    useConfiguratorStore.getState().resetConfiguration();

    // Modify configuration
    useConfiguratorStore.getState().setExteriorColor('midnight-black');
    useConfiguratorStore.getState().setInteriorColor('deep-blue');
    useConfiguratorStore.getState().setWheelType('sport');
    useConfiguratorStore.getState().toggleOptional('precision-park');

    expect(useConfiguratorStore.getState().configuration.exteriorColor).toBe('midnight-black');
    expect(useConfiguratorStore.getState().configuration.interiorColor).toBe('deep-blue');
    expect(useConfiguratorStore.getState().configuration.wheelType).toBe('sport');
    expect(useConfiguratorStore.getState().configuration.optionals).toContain('precision-park');

    // Reset
    useConfiguratorStore.getState().resetConfiguration();

    // Verify defaults
    const defaultConfig = useConfiguratorStore.getState().configuration;
    expect(defaultConfig.exteriorColor).toBe('glacier-blue');
    expect(defaultConfig.interiorColor).toBe('carbon-black');
    expect(defaultConfig.wheelType).toBe('aero');
    expect(defaultConfig.optionals).toEqual([]);
  });
});
