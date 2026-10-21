import { Link } from '@tanstack/react-router';
import { money, priceOf, productImage, productKey, type Product } from '@/lib/marketplace';
import { useMarket } from './market-provider';
import { MarketImage } from './market-image';
import { MarketButton } from './market-button';

export function ProductGrid({ products }: { products: Product[] }) {
  const { add } = useMarket();
  if (!products.length) return <p className="market-empty">No products found. Try another search.</p>;
  return <div className="menu__container container grid market-product-grid">{products.map(product => <article className="menu__item market-product-item" key={product.id}>
    <Link to="/products/$slug" params={{ slug: productKey(product) }} className="menu__img-wrapper"><MarketImage src={productImage(product)} alt={product.name} className="menu__img" slot="grid" /></Link>
    <p className="market-vendor-name">{product.vendor?.shop_name || 'Independent seller'}</p>
    <Link to="/products/$slug" params={{ slug: productKey(product) }}><h3 className="menu__title">{product.name}</h3></Link>
    <span className="menu__price">{money(priceOf(product))}</span>
    {priceOf(product) < Number(product.price) && <del>{money(product.price)}</del>}
    <p className="market-stock">{product.stock_quantity > 0 ? 'Available now' : 'Out of stock'}</p>
    <MarketButton variant="plain" className="menu__btn" aria-label={`Add ${product.name} to cart`} title="Add to cart" disabled={product.stock_quantity <= 0} onClick={() => add(product)}><i className="ri-shopping-bag-line" /></MarketButton>
  </article>)}</div>;
}