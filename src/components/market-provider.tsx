import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { api, ApiError, configured, demoProducts, type AuthResponse, type Product, type Role, type User } from '@/lib/marketplace';
import { createDemoStore, demoRequest, demoSession, restoreDemoRole, type DemoStore } from '@/lib/marketplace-demo';

export type CartItem = { product: Product; quantity: number };
type Session = { token: string; user: User };
type MarketState = { user: User | null; token: string; ready: boolean; cart: CartItem[]; notice: string; setNotice: (s: string) => void; signIn: (s: AuthResponse) => void; previewAs: (role: Role) => void; logout: () => Promise<void>; refresh: () => Promise<void>; request: <T>(path: string, options?: { method?: string; body?: unknown }) => Promise<T>; add: (p: Product, quantity?: number) => void; quantity: (id: number, n: number) => void; updateStock: (id: number, stock: number) => void; clearCart: () => void };
const Context = createContext<MarketState | null>(null);
export function MarketProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notice, setNotice] = useState('');
  const demoStore = useRef<DemoStore | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kings-session');
      if (configured && saved) { const s = JSON.parse(saved); if (s.token && !s.token.startsWith('preview-') && s.user?.role) setSession(s); }
      if (!configured) { const result = demoSession(restoreDemoRole(sessionStorage.getItem('kings-preview-role'))); setSession({ token: result.access_token, user: result.user }); }
      const savedCart = sessionStorage.getItem('kings-cart');
      if (savedCart) { const rows = JSON.parse(savedCart); if (Array.isArray(rows)) setCart(rows.filter(row => row.product?.id && row.quantity > 0)); }
    } catch { localStorage.removeItem('kings-session'); sessionStorage.removeItem('kings-cart'); if (!configured) { const result = demoSession('customer'); setSession({ token: result.access_token, user: result.user }); } }
    setReady(true);
    const unauthorized = () => { setSession(null); localStorage.removeItem('kings-session'); queryClient.removeQueries({ queryKey: ['private'] }); void navigate({ to: '/login' }); };
    window.addEventListener('market-unauthorized', unauthorized);
    return () => window.removeEventListener('market-unauthorized', unauthorized);
  }, [navigate, queryClient]);
  useEffect(() => { if (ready) { try { sessionStorage.setItem('kings-cart', JSON.stringify(cart)); } catch { /* A cart still works when storage is unavailable. */ } } }, [cart, ready]);
  useEffect(() => {
    if (!ready || !session?.token || !configured) return;
    let cancelled = false;
    api<{ user: User }>('/auth/me', { token: session.token }).then(result => {
      if (!cancelled) setSession(current => current ? { ...current, user: result.user } : null);
    }).catch(error => { if (!cancelled && !(error instanceof ApiError && error.status === 401)) setNotice(error.message); });
    return () => { cancelled = true; };
  }, [ready, session?.token]);
  function signIn(result: AuthResponse) {
    const s = { token: result.access_token, user: result.user };
    setSession(s); setNotice(''); queryClient.removeQueries({ queryKey: ['private'] });
    try { localStorage.setItem('kings-session', JSON.stringify(s)); } catch { /* Session remains available in memory. */ }
  }
  function previewAs(role: Role) {
    if (configured) return;
    const result = demoSession(role);
    setSession({ token: result.access_token, user: result.user }); setNotice('');
    queryClient.removeQueries({ queryKey: ['private'] });
    try { sessionStorage.setItem('kings-preview-role', role); } catch { /* Preview works without storage. */ }
  }
  async function request<T>(path: string, options: { method?: string; body?: unknown } = {}) {
    if (!configured) {
      if (!session) throw new Error('Select a sample account first.');
      if (!demoStore.current) demoStore.current = createDemoStore(demoProducts);
      return structuredClone(demoRequest(demoStore.current, session.user, path, options)) as T;
    }
    return api<T>(path, { ...options, token: session?.token || '' });
  }
  async function logout() {
    try { if (session && configured) await request('/auth/logout', { method: 'POST' }); }
    finally { setSession(null); setCart([]); if (configured) localStorage.removeItem('kings-session'); else sessionStorage.removeItem('kings-preview-role'); queryClient.removeQueries({ queryKey: ['private'] }); await navigate({ to: '/login' }); }
  }
  async function refresh() {
    if (!configured) { if (session) previewAs(session.user.role); return; }
    const response = await request<{ access_token: string }>('/auth/refresh', { method: 'POST' });
    if (session) signIn({ access_token: response.access_token, user: session.user });
  }
  function add(product: Product, n = 1) {
    if (product.stock_quantity <= 0) { setNotice('This product is out of stock.'); return; }
    setCart(rows => { const existing = rows.find(row => row.product.id === product.id); return existing ? rows.map(row => row.product.id === product.id ? { product, quantity: Math.min(row.quantity + n, product.stock_quantity) } : row) : [...rows, { product, quantity: Math.min(n, product.stock_quantity) }]; });
    setNotice(`${product.name} added to your cart.`);
  }
  function quantity(id: number, n: number) { setCart(rows => rows.map(row => row.product.id === id ? { ...row, quantity: Math.min(Math.max(0, Math.floor(n)), row.product.stock_quantity) } : row).filter(row => row.quantity > 0)); }
  function updateStock(id: number, stock: number) { setCart(rows => rows.map(row => row.product.id === id ? { ...row, product: { ...row.product, stock_quantity: stock } } : row)); }
  return <Context.Provider value={{ user: session?.user || null, token: session?.token || '', ready, cart, notice, setNotice, signIn, previewAs, logout, refresh, request, add, quantity, updateStock, clearCart: () => setCart([]) }}>{children}</Context.Provider>;
}
export function useMarket() { const context = useContext(Context); if (!context) throw new Error('Marketplace context missing'); return context; }