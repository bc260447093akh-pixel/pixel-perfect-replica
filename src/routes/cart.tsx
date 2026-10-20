import { createFileRoute, Link } from '@tanstack/react-router';
import { useMarket } from '@/components/market-provider';
import { MarketButton } from '@/components/market-button';
import { PageSection } from '@/components/market-shell';
import { money, priceOf, productImage, pageHead, configured } from '@/lib/marketplace';
export const Route = createFileRoute('/cart')({ head: () => pageHead('Your Cart', 'Review your favourite products before checkout at Kings Marketplace.'), component: Cart });
function Cart() {
  const { cart, quantity, ready } = useMarket();
  return <PageSection title="Your Shopping Bag" subtitle="Good Finds, All Together">{!ready ? <p>Loading your cart…</p> : !cart.length ? <><p className="market-empty">Your bag is waiting for its first great find.</p><MarketButton asChild><Link to="/products" search={{ page: 1, search: '', vendor_id: '' }}>Explore The Shop</Link></MarketButton></> : <>
    {!configured && <p className="market-warning">Preview items cannot be ordered until the shop is connected.</p>}
    <div className="market-cart-list">{cart.map(row => <article className="market-cart-row" key={row.product.id}><img src={productImage(row.product)} alt={row.product.name} width={1024} height={1024} loading="lazy" /><div><Link to="/products/$slug" params={{ slug: row.product.slug }}><h3>{row.product.name}</h3></Link><p>{row.product.vendor?.shop_name}</p><span className="menu__price">{money(priceOf(row.product))}</span></div><label className="market-field">Quantity<input className="market-input" type="number" min={1} max={row.product.stock_quantity} value={row.quantity} onChange={event => quantity(row.product.id, Number(event.target.value) || 1)} /></label><strong>{money(priceOf(row.product) * row.quantity)}</strong><MarketButton variant="icon" title="Remove item" aria-label={`Remove ${row.product.name}`} onClick={() => quantity(row.product.id, 0)}><i className="ri-delete-bin-line" /></MarketButton></article>)}</div>
    <div className="market-cart-total"><h3>Subtotal <span>{money(cart.reduce((sum, row) => sum + priceOf(row.product) * row.quantity, 0))}</span></h3><p>Shipping is added at checkout.</p><MarketButton asChild><Link to="/checkout">Proceed To Checkout <i className="ri-arrow-right-line" /></Link></MarketButton></div>
  </>}</PageSection>;
}