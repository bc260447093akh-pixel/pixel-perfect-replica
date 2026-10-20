import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { AccessGate } from '@/components/market-auth';
import { useMarket } from '@/components/market-provider';
import { MarketButton } from '@/components/market-button';
import { PageSection } from '@/components/market-shell';
import { PrivateData } from '@/components/private-data';
import { OrderList } from '@/components/order-list';
import { pageHead, money, pageRows, type Page, type Order } from '@/lib/marketplace';
export const Route = createFileRoute('/account')({ head: () => pageHead('Your Account', 'Manage your Kings Marketplace account and access your orders or seller portal.'), component: Account });
function Account() { return <AccessGate><AccountProfile /></AccessGate>; }
function AccountProfile() {
  const { user, logout, refresh } = useMarket();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  const act = async (action: () => Promise<void>) => { setBusy(true); setError(''); try { await action(); } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); } finally { setBusy(false); } };
  return <PageSection title={`Hello, ${user.username}`} subtitle="Your Account"><dl className="market-account-data"><dt>Username</dt><dd>{user.username}</dd><dt>Email</dt><dd>{user.email}</dd><dt>Account type</dt><dd>{user.role}</dd>{user.vendor && <><dt>Shop</dt><dd>{user.vendor.shop_name}</dd><dt>Approval</dt><dd>{user.vendor.is_approved ? 'Approved' : 'Pending approval'}</dd></>}</dl><div className="market-actions"><MarketButton asChild><Link to={user.role === 'vendor' ? '/vendor' : user.role === 'admin' ? '/admin' : '/orders'}>{user.role === 'customer' ? 'My Orders' : 'Open My Portal'}</Link></MarketButton><MarketButton variant="icon" title="Refresh session" aria-label="Refresh session" disabled={busy} onClick={() => void act(refresh)}><i className="ri-refresh-line" /></MarketButton><MarketButton disabled={busy} onClick={() => void act(logout)}>Sign Out <i className="ri-logout-box-line" /></MarketButton></div>{error && <p role="alert" className="market-error">{error}</p>}{user.role === 'customer' && <PrivateData<Page<Order>> path="/orders?page=1">{data => { const orders = pageRows(data); return <><div className="market-stat-grid"><div><strong>{data.meta?.total ?? orders.length}</strong>Orders</div><div><strong>{orders.filter(order => order.status === 'delivered').length}</strong>Delivered</div><div><strong>{money(orders.reduce((sum, order) => sum + Number(order.total_amount), 0))}</strong>Recent order total</div></div><h2>Recent Orders</h2><OrderList orders={orders.slice(0, 3)} /></>; }}</PrivateData>}</PageSection>;
}