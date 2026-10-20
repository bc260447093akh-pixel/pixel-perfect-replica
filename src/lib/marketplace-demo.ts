import type { AuthResponse, Ledger, Order, Page, Product, Role, User, Vendor } from './marketplace';

export const demoUsers: Record<Role, User> = {
  customer: { id: -101, username: 'Ayesha Khan', email: 'ayesha@example.com', role: 'customer', vendor: null },
  vendor: { id: -102, username: 'Hamza Ali', email: 'hamza@example.com', role: 'vendor', vendor: { id: -1, shop_name: 'Sound Studio', shop_description: 'Headphones and connected essentials for everyday life.', is_approved: true, products_count: 2 } },
  admin: { id: -103, username: 'Kings Admin', email: 'admin@example.com', role: 'admin', vendor: null },
};
export function demoSession(role: Role): AuthResponse {
  return { user: structuredClone(demoUsers[role]), access_token: `preview-${role}` };
}
export function restoreDemoRole(value: string | null): Role {
  return value === 'vendor' || value === 'admin' ? value : 'customer';
}
export function usePreviewData(baseUrl: string) { return baseUrl.trim().length === 0; }
export function createDemoStore(products: Product[]) {
  const orders: Order[] = [
    { id: -201, order_number: 'DEMO-1001', total_amount: 12900, status: 'delivered', payment_status: 'paid', payment_method: 'jazzcash', shipping_amount: 0, items: [{ id: -301, quantity: 1, price: 12900, subtotal: 12900, product: { name: 'Wireless Headphones', slug: 'wireless-headphones' } }] },
    { id: -202, order_number: 'DEMO-1002', total_amount: 6500, status: 'processing', payment_status: 'pending', payment_method: 'cod', shipping_amount: 0, items: [{ id: -302, quantity: 1, price: 6500, subtotal: 6500, product: { name: 'Everyday Sneakers', slug: 'everyday-sneakers' } }] },
    { id: -203, order_number: 'DEMO-1003', total_amount: 45900, status: 'shipped', payment_status: 'paid', payment_method: 'easypaisa', shipping_amount: 0, items: [{ id: -303, quantity: 1, price: 45900, subtotal: 45900, product: { name: 'Connected Essentials', slug: 'connected-essentials' } }] },
  ];
  const ledgers: Ledger[] = [
    { order_amount: 12900, commission_fee: 1290, vendor_earning: 11610, created_at: '2026-10-12T10:00:00Z' },
    { order_amount: 45900, commission_fee: 4590, vendor_earning: 41310, created_at: '2026-10-18T10:00:00Z' },
  ];
  return { products: structuredClone(products), orders, ledgers, vendors: [structuredClone(demoUsers.vendor.vendor) as Vendor, { id: -2, shop_name: 'Everyday Edit', shop_description: 'Fresh styles for every day.', is_approved: false, products_count: 1 }, { id: -3, shop_name: 'Style House', is_approved: true, products_count: 1 }] };
}
export type DemoStore = ReturnType<typeof createDemoStore>;
function paginate<T>(rows: T[], params: URLSearchParams): Page<T> {
  const page = Math.max(1, Number(params.get('page')) || 1);
  const perPage = 15;
  return { data: rows.slice((page - 1) * perPage, page * perPage), meta: { current_page: page, per_page: perPage, total: rows.length }, links: { next: page * perPage < rows.length ? `?page=${page + 1}` : null, prev: page > 1 ? `?page=${page - 1}` : null } };
}
// Browser-only, in-memory fixtures. No mock operation reaches the live API.
export function demoRequest(store: DemoStore, user: User, path: string, options: { method?: string; body?: unknown } = {}): unknown {
  const url = new URL(path, 'https://preview.invalid');
  const route = url.pathname;
  const method = options.method || 'GET';
  const body = (options.body || {}) as Record<string, unknown>;
  if (route.startsWith('/admin/') && user.role !== 'admin') throw new Error('This page is for administrators.');
  if (route.startsWith('/vendor/') && user.role !== 'vendor') throw new Error('This page is for sellers.');
  if (route === '/orders') {
    if (user.role !== 'customer') throw new Error('This page is for customers.');
    return paginate(store.orders, url.searchParams);
  }
  if (route === '/auth/me') return { user };
  if (route === '/auth/refresh') return { access_token: `preview-${user.role}` };
  if (route === '/vendor/profile') {
    const vendor = store.vendors.find(v => v.id === user.vendor?.id);
    if (!vendor) throw new Error('Sample shop not found.');
    if (method === 'PUT') { vendor.shop_name = String(body['shop_name'] || vendor.shop_name); vendor.shop_description = String(body['shop_description'] || ''); }
    vendor.products_count = store.products.filter(p => (p.vendor_id ?? p.vendor?.id) === vendor.id).length;
    return { vendor, total_earnings: store.ledgers.reduce((sum, row) => sum + row.vendor_earning, 0) };
  }
  if (route === '/products') return paginate(store.products.filter(p => !url.searchParams.get('vendor_id') || String(p.vendor_id ?? p.vendor?.id) === url.searchParams.get('vendor_id')), url.searchParams);
  if (route === '/vendor/orders') return paginate(store.orders.filter(order => order.id !== -202), url.searchParams);
  if (route === '/vendor/earnings' || route === '/admin/earnings') return paginate(store.ledgers, url.searchParams);
  if (route === '/admin/stats') return { total_commission_collected: store.ledgers.reduce((sum, row) => sum + row.commission_fee, 0), total_vendor_payouts: store.ledgers.reduce((sum, row) => sum + row.vendor_earning, 0), total_orders: store.orders.length, total_products: store.products.length, total_vendors: store.vendors.length, pending_vendor_approvals: store.vendors.filter(v => !v.is_approved).length };
  if (route === '/admin/vendors') return paginate(store.vendors.filter(v => url.searchParams.get('is_approved') !== 'false' || !v.is_approved), url.searchParams);
  const moderation = route.match(/^\/admin\/vendors\/(-?\d+)\/(approve|reject)$/);
  if (moderation && method === 'PATCH') {
    const vendor = store.vendors.find(v => v.id === Number(moderation[1]));
    if (!vendor) throw new Error('Sample seller not found.');
    vendor.is_approved = moderation[2] === 'approve';
    return { vendor };
  }
  if (route.startsWith('/vendor/products') && method !== 'GET') {
    const vendor = store.vendors.find(v => v.id === user.vendor?.id);
    if (!vendor?.is_approved) throw new Error('Your shop must be approved first.');
    const id = Number(route.split('/').pop());
    const index = store.products.findIndex(p => p.id === id && (p.vendor_id ?? p.vendor?.id) === vendor.id);
    if (method === 'DELETE') { if (index < 0) throw new Error('Sample product not found.'); store.products.splice(index, 1); return { message: 'Sample product deleted.' }; }
    if (method !== 'POST' && index < 0) throw new Error('Sample product not found.');
    const product: Product = { ...(index >= 0 ? store.products[index] : {}), id: index >= 0 ? id : Math.min(-4, ...store.products.map(p => p.id)) - 1, name: String(body['name'] || ''), slug: String(body['name'] || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'), description: String(body['description'] || ''), image: String(body['image'] || ''), price: Number(body['price']), stock_quantity: Number(body['stock_quantity']), flat_discount: body['flat_discount'] == null ? null : Number(body['flat_discount']), percentage_discount: body['percentage_discount'] == null ? null : Number(body['percentage_discount']), is_active: Boolean(body['is_active']), vendor_id: vendor.id, vendor };
    if (index >= 0) store.products[index] = product; else store.products.push(product);
    return { data: product };
  }
  throw new Error('This action needs a connected shop.');
}