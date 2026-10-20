import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useMarket } from '@/components/market-provider';
import { AccessGate } from '@/components/market-auth';
import { MarketButton } from '@/components/market-button';
import { PageSection } from '@/components/market-shell';
import { ApiError, configured, money, priceOf, paymentMethods, pageHead, type Order } from '@/lib/marketplace';
export const Route = createFileRoute('/checkout')({ head: () => pageHead('Checkout', 'Complete your Kings Marketplace order with JazzCash, Easypaisa or cash on delivery.'), component: Checkout });
function Checkout() { return <AccessGate roles={['customer', 'admin']}><CheckoutForm /></AccessGate>; }
function CheckoutForm() {
  const { cart, request, clearCart, updateStock, quantity } = useMarket();
  const [payment, setPayment] = useState<typeof paymentMethods[number]>('cod');
  const [shipping, setShipping] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [stockError, setStockError] = useState<{ id: number; available: number } | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  if (order) return <PageSection title="Thank You For Your Order" subtitle="Your Next Favourite Is On Its Way"><h3>{order.order_number}</h3><p>Status: {order.status} · Payment: {order.payment_status}</p><span className="menu__price">{money(order.total_amount)}</span><MarketButton asChild><Link to="/orders">View My Orders</Link></MarketButton></PageSection>;
  if (!cart.length) return <PageSection title="Your Bag Is Empty"><MarketButton asChild><Link to="/products" search={{ page: 1, search: '', vendor_id: '' }}>Continue Shopping</Link></MarketButton></PageSection>;
  const preview = cart.some(row => row.product.id < 0);
  return <PageSection title="Make It Official" subtitle="Checkout"><form className="market-checkout grid" onSubmit={async event => {
    event.preventDefault(); setBusy(true); setError(''); setStockError(null);
    try { const result = await request<{ order: Order }>('/checkout', { method: 'POST', body: { items: cart.map(row => ({ product_id: row.product.id, quantity: row.quantity })), payment_method: payment, shipping_amount: shipping } }); setOrder(result.order); clearCart(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Your order could not be placed.'); if (e instanceof ApiError && e.code === 'INSUFFICIENT_STOCK') { const id = Number(e.details.product_id); const available = Number(e.details.available_stock); if (Number.isFinite(id) && Number.isFinite(available)) { setStockError({ id, available }); updateStock(id, available); } } }
    finally { setBusy(false); }
  }}><div><h3>Your Payment</h3><fieldset className="market-payment-options"><legend>Payment method</legend>{paymentMethods.map(method => <label key={method}><input type="radio" name="payment" value={method} checked={payment === method} onChange={() => setPayment(method)} />{method === 'cod' ? 'Cash on delivery' : method === 'jazzcash' ? 'JazzCash' : 'Easypaisa'}</label>)}</fieldset><label className="market-field">Shipping amount (PKR)<input className="market-input" type="number" min={0} step="0.01" value={shipping} onChange={event => setShipping(Math.max(0, Number(event.target.value) || 0))} /></label><p className="market-muted">Final pricing and payment status are confirmed by the shop.</p></div><div><h3>Order Summary</h3>{cart.map(row => <div className="market-summary-row" key={row.product.id}><p>{row.product.name} × {row.quantity}</p><strong>{money(priceOf(row.product) * row.quantity)}</strong>{stockError?.id === row.product.id && <p className="market-error" role="alert">{stockError.available} available. <MarketButton variant="plain" onClick={() => { quantity(row.product.id, stockError.available); setStockError(null); }}>{stockError.available ? 'Adjust quantity' : 'Remove item'}</MarketButton></p>}</div>)}<p>Shipping: {money(shipping)}</p><span className="menu__price">Estimated total: {money(cart.reduce((n, row) => n + priceOf(row.product) * row.quantity, shipping))}</span>{(!configured || preview) && <p className="market-warning">Connect the shop and replace preview items with live products before ordering.</p>}{error && <p className="market-error" role="alert">{error}</p>}<MarketButton type="submit" disabled={busy || !configured || preview || stockError !== null}>{busy ? 'Placing Order…' : 'Place Order'}</MarketButton></div></form></PageSection>;
}