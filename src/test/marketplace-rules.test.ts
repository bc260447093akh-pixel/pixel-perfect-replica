import { describe, expect, it } from 'vitest';
import { canCheckout, canManageProducts, paymentMethods, money, type User } from '@/lib/marketplace';
describe('Marketplace API rules', () => {
  it('allows customers and admins, not vendors, to checkout', () => {
    expect(canCheckout('customer')).toBe(true);
    expect(canCheckout('admin')).toBe(true);
    expect(canCheckout('vendor')).toBe(false);
  });
  it('requires vendor approval to manage products', () => {
    const user: User = { id: 1, email: '', username: '', role: 'vendor', vendor: { id: 1, shop_name: '', is_approved: false } };
    expect(canManageProducts(user)).toBe(false);
    expect(canManageProducts({ ...user, vendor: { id: 1, shop_name: '', is_approved: true } })).toBe(true);
    expect(canManageProducts({ ...user, role: 'customer' })).toBe(false);
  });
  it('supports the three documented payment methods', () => {
    expect(paymentMethods).toEqual(['jazzcash', 'easypaisa', 'cod']);
  });
  it('formats prices in Pakistani rupees', () => {
    expect(money(250)).toContain('PKR');
    expect(money(250)).toContain('250');
  });
});