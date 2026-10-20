import { queryOptions } from '@tanstack/react-query';
import headphones from '@/assets/market-headphones.webp';
import sneakers from '@/assets/market-sneakers.webp';
import style from '@/assets/market-style.webp';
import tech from '@/assets/market-tech.webp';
import { usePreviewData } from './marketplace-demo';

export type Role = 'customer' | 'vendor' | 'admin';
export type Vendor = { id: number; shop_name: string; shop_description?: string; is_approved?: boolean; products_count?: number };
export type User = { id: number; username: string; email: string; role: Role; vendor: Vendor | null };
export type Product = { id: number; vendor_id?: number; name: string; slug: string; description?: string; image?: string; price: number; stock_quantity: number; total_sold?: number; is_active?: boolean; flat_discount?: number | null; percentage_discount?: number | null; vendor?: Vendor };
export type Page<T> = { data: T[]; links?: { next?: string | null; prev?: string | null }; meta?: { current_page: number; per_page: number; total: number } };
export type Order = { id: number; order_number: string; total_amount: number; status: string; payment_status?: string; payment_method?: string; shipping_amount?: number; items?: { id: number; quantity: number; price: number; subtotal: number; product?: { name: string; slug: string } }[] };
export type Ledger = { order_amount: number; commission_fee: number; vendor_earning: number; created_at: string };
export type AuthResponse = { user: User; access_token: string; expires_in?: number };
export const apiBase = (import.meta.env['VITE_API_BASE_URL'] || '').trim().replace(/\/+$/, '');
export const configured = !usePreviewData(apiBase);
export const paymentMethods = ['jazzcash', 'easypaisa', 'cod'] as const;
export function canCheckout(role: Role) { return role === 'customer' || role === 'admin'; }
export function canManageProducts(user: User) { return user.role === 'vendor' && user.vendor?.is_approved === true; }
export function priceOf(p: Product) {
  const base = Number(p.price);
  // Flat discount takes precedence when both fields are provided. Backend totals are authoritative.
  return Math.max(0, p.flat_discount != null ? base - Number(p.flat_discount) : base * (1 - Number(p.percentage_discount || 0) / 100));
}
export function money(value: number) { return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', currencyDisplay: 'code', maximumFractionDigits: 2 }).format(Number(value) || 0); }
export class ApiError extends Error {
  constructor(message: string, public code = '', public details: Record<string, unknown> = {}, public status = 0) { super(message); }
}
export async function api<T>(path: string, options: { method?: string; body?: unknown; token?: string; signal?: AbortSignal } = {}): Promise<T> {
  if (!configured) throw new ApiError('The shop is not connected yet. Please try again once the shop connection is ready.', 'API_NOT_CONFIGURED');
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      method: options.method || 'GET', ...(options.signal ? { signal: options.signal } : {}),
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new ApiError('We could not reach the shop. Please check your connection and try again.', 'NETWORK_ERROR');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') window.dispatchEvent(new Event('market-unauthorized'));
    throw new ApiError(data.message || `Request failed (${response.status}).`, data.code, data.details, response.status);
  }
  return data as T;
}
export const demoProducts: Product[] = [
  { id: -1, name: 'Wireless Headphones', slug: 'wireless-headphones', description: 'Your everyday soundtrack, without the wires. A comfortable over-ear fit with a clean, modern finish.', image: headphones, price: 12900, stock_quantity: 20, vendor: { id: -1, shop_name: 'Sound Studio' } },
  { id: -2, name: 'Everyday Sneakers', slug: 'everyday-sneakers', description: 'A fresh pair for every day. Clean white sneakers with contrasting details and an easy-going silhouette.', image: sneakers, price: 6500, stock_quantity: 15, vendor: { id: -2, shop_name: 'Everyday Edit' } },
  { id: -3, name: 'City Tote & Accessories', slug: 'city-tote', description: 'A bright new addition to your daily rotation. A structured tote and matching everyday essentials.', image: style, price: 8900, stock_quantity: 10, vendor: { id: -3, shop_name: 'Style House' } },
  { id: -4, name: 'Connected Essentials', slug: 'connected-essentials', description: 'A closer look at the latest tech essentials. A placeholder collection for your future product range.', image: tech, price: 45900, stock_quantity: 5, vendor: { id: -1, shop_name: 'Sound Studio' } },
];
export function productImage(p: Product) {
  // Previously saved preview carts may still contain the old PNG URL.
  const sample = p.id < 0 ? demoProducts.find(item => item.id === p.id) : undefined;
  return sample?.image || p.image || headphones;
}
export type CatalogFilters = { page: number; search: string; vendor_id: string };
export const catalogOptions = (filters: CatalogFilters) => queryOptions({
  queryKey: ['products', filters],
  queryFn: async ({ signal }) => {
    if (!configured) {
      const data = demoProducts.filter(p => (!filters.search || p.name.toLowerCase().includes(filters.search.toLowerCase())) && (!filters.vendor_id || String(p.vendor?.id) === filters.vendor_id));
      return { data, meta: { current_page: 1, per_page: 15, total: data.length } } satisfies Page<Product>;
    }
    const search = new URLSearchParams({ page: String(filters.page), per_page: '15' });
    if (filters.search) search.set('search', filters.search);
    if (filters.vendor_id) search.set('vendor_id', filters.vendor_id);
    return api<Page<Product>>(`/products?${search}`, { signal });
  },
  staleTime: 30_000,
});
export const productOptions = (slug: string) => queryOptions({
  queryKey: ['product', slug],
  queryFn: async ({ signal }) => {
    if (!configured) {
      const data = demoProducts.find(p => p.slug === slug);
      if (!data) throw new ApiError('This product is not available.', 'NOT_FOUND', {}, 404);
      return data;
    }
    return (await api<{ data: Product }>(`/products/${encodeURIComponent(slug)}`, { signal })).data;
  },
});
export function pageRows<T>(value: Page<T> | T[]): T[] { return Array.isArray(value) ? value : value.data || []; }
export function pageHead(title: string, description: string) {
  return { meta: [{ title: `${title} — Kings Marketplace` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} — Kings Marketplace` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
}