import { describe, expect, it } from 'vitest';
import { canCheckout, canManageProducts, paymentMethods, money, type User } from '@/lib/marketplace';
import { createDemoStore, demoRequest, demoSession, restoreDemoRole, usePreviewData } from '@/lib/marketplace-demo';
describe('Marketplace API rules', () => {
  it('uses mock data only when the backend URL is empty', () => {
    expect(usePreviewData('')).toBe(true);
    expect(usePreviewData('  ')).toBe(true);
    expect(usePreviewData('https://shop.example/api')).toBe(false);
  });
  it('provides separate customer, vendor and admin mock profiles', () => {
    expect(restoreDemoRole(null)).toBe('customer');
    expect(demoSession('customer').user.username).toBe('Ayesha Khan');
    expect(demoSession('vendor').user.vendor?.shop_name).toBe('Sound Studio');
    expect(demoSession('admin').user.role).toBe('admin');
  });
  it('populates customer orders, seller earnings and admin stats', () => {
    const store = createDemoStore([]);
    expect(demoRequest(store, demoSession('customer').user, '/orders')).toMatchObject({ meta: { total: 3 } });
    expect(demoRequest(store, demoSession('vendor').user, '/vendor/profile')).toMatchObject({ total_earnings: 52920 });
    expect(demoRequest(store, demoSession('admin').user, '/admin/stats')).toMatchObject({ total_orders: 3, pending_vendor_approvals: 1 });
  });
  it('isolates sample admin and seller operations by role', () => {
    const store = createDemoStore([]);
    expect(() => demoRequest(store, demoSession('customer').user, '/admin/stats')).toThrow();
    expect(() => demoRequest(store, demoSession('admin').user, '/vendor/profile')).toThrow();
  });
  it('updates sample seller approvals without modifying the original fixtures', () => {
    const store = createDemoStore([]);
    demoRequest(store, demoSession('admin').user, '/admin/vendors/-2/approve', { method: 'PATCH' });
    expect(store.vendors.find(v => v.id === -2)?.is_approved).toBe(true);
    expect(createDemoStore([]).vendors.find(v => v.id === -2)?.is_approved).toBe(false);
  });
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