import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { AccessGate } from '@/components/market-auth';
import { useMarket } from '@/components/market-provider';
import { MarketButton } from '@/components/market-button';
import { PageSection } from '@/components/market-shell';
import { PrivateData } from '@/components/private-data';
import { OrderList } from '@/components/order-list';
import { pageHead, money, priceOf, pageRows, type Page, type Order } from '@/lib/marketplace';
export const Route = createFileRoute('/account')({ head: () => pageHead('Your Account', 'Manage your Kings Marketplace account and access your orders or seller portal.'), component: Account });
function Account() { return <AccessGate><AccountProfile /></AccessGate>; }
function AccountProfile() {
  const { user, cart, logout, refresh } = useMarket();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  const act = async (action: () => Promise<void>, message = '') => { setBusy(true); setError(''); setSuccess(''); try { await action(); setSuccess(message); } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); } finally { setBusy(false); } };
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  return <PageSection title={`Hello, ${user.username}`} subtitle="Your Account">
    <div className="market-account-layout">
      <aside className="market-profile-section" aria-label="Profile details">
        <div className="market-profile-heading"><span className="market-profile-avatar" aria-hidden="true">{user.username.slice(0, 1).toUpperCase()}</span><div><h2>My Profile</h2><p className="market-profile-role">{user.role} account</p></div></div>
        <dl className="market-account-data"><dt>Username</dt><dd>{user.username}</dd><dt>Email</dt><dd>{user.email}</dd>{user.vendor && <><dt>Shop</dt><dd>{user.vendor.shop_name}</dd><dt>Approval</dt><dd>{user.vendor.is_approved ? 'Approved' : 'Pending approval'}</dd></>}</dl>
        <div className="market-profile-actions"><MarketButton variant="icon" title="Refresh account" aria-label="Refresh account" disabled={busy} onClick={() => void act(refresh, 'Account refreshed.')}><i className={`ri-refresh-line ${busy ? 'market-refreshing' : ''}`} /></MarketButton><MarketButton variant="plain" disabled={busy} onClick={() => void act(logout)}>Sign Out <i className="ri-logout-box-line" /></MarketButton></div>
        {error && <p role="alert" className="market-error">{error}</p>}{success && <p role="status">{success}</p>}
      </aside>
      <div className="market-account-main">
        <nav className="market-account-shortcuts" aria-label="Account shortcuts">
          <Link to={user.role === 'vendor' ? '/vendor' : user.role === 'admin' ? '/admin' : '/orders'}><i className="ri-file-list-3-line" aria-hidden="true" /><span><strong>{user.role === 'customer' ? 'My Orders' : 'My Portal'}</strong><small>{user.role === 'customer' ? 'Order history & payment status' : 'Manage your marketplace'}</small></span><i className="ri-arrow-right-line" aria-hidden="true" /></Link>
          <Link to="/cart"><i className="ri-shopping-bag-line" aria-hidden="true" /><span><strong>My Cart</strong><small>{cartCount} {cartCount === 1 ? 'item' : 'items'} · {money(cart.reduce((sum, item) => sum + priceOf(item.product) * item.quantity, 0))} subtotal</small></span><i className="ri-arrow-right-line" aria-hidden="true" /></Link>
          <Link to="/products" search={{ page: 1, search: '', vendor_id: '' }}><i className="ri-store-2-line" aria-hidden="true" /><span><strong>Continue Shopping</strong><small>Explore all products</small></span><i className="ri-arrow-right-line" aria-hidden="true" /></Link>
        </nav>
        {user.role === 'customer' && <section className="market-recent-orders" aria-label="Recent orders"><PrivateData<Page<Order>> path="/orders?page=1">{data => { const orders = pageRows(data); return <><div className="market-section-heading"><h2>Recent Orders</h2><Link to="/orders">View all <i className="ri-arrow-right-line" aria-hidden="true" /></Link></div><p className="market-muted">{data.meta?.total ?? orders.length} orders in your history</p>{orders.length ? <OrderList orders={orders.slice(0, 3)} /> : <div className="market-account-empty"><i className="ri-shopping-bag-3-line" aria-hidden="true" /><h3>Your first find is waiting</h3><p>No orders yet.</p><MarketButton asChild><Link to="/products" search={{ page: 1, search: '', vendor_id: '' }}>Browse Products</Link></MarketButton></div>}</>; }}</PrivateData></section>}
      </div>
    </div>
  </PageSection>;
}