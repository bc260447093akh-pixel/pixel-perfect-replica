import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { productOptions, productImage, priceOf, money, pageHead, configured } from '@/lib/marketplace';
import { PageSection, MarketError, MarketNotFound } from '@/components/market-shell';
import { MarketImage } from '@/components/market-image';
import { MarketButton } from '@/components/market-button';
import { useMarket } from '@/components/market-provider';

export const Route = createFileRoute('/products/$slug')({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productOptions(params.slug)),
  head: ({ loaderData }) => {
    const head = pageHead(loaderData?.name || 'Product', loaderData?.description || 'Explore this product on Kings Marketplace.');
    const image = loaderData?.image;
    return image?.startsWith('https://') ? { meta: [...head.meta, { property: 'og:image', content: image }, { name: 'twitter:image', content: image }] } : head;
  },
  errorComponent: MarketError, notFoundComponent: MarketNotFound,
  component: ProductDetail,
});
function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productOptions(slug));
  const { add } = useMarket();
  const [quantity, setQuantity] = useState(1);
  return <PageSection title={product.name} subtitle="A Closer Look"><Link to="/products" search={{ page: 1, search: '', vendor_id: '' }} className="market-back"><i className="ri-arrow-left-line" /> Back to shop</Link><div className="market-detail grid"><div className="market-detail-image"><MarketImage src={productImage(product)} alt={product.name} slot="detail" /></div><div className="market-detail-data"><span className="section__subtitle">{product.vendor?.shop_name || 'Independent seller'}</span><h2>{product.name}</h2><span className="menu__price">{money(priceOf(product))}</span>{priceOf(product) < Number(product.price) && <del>{money(product.price)}</del>}<p>{product.description || 'Contact the seller for more product information.'}</p><p>{product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Out of stock'}</p>{!configured && <p className="market-demo-label">Sample product · preview price</p>}<label className="market-field">Quantity<input className="market-input" type="number" min={1} max={product.stock_quantity} value={quantity} onChange={event => setQuantity(Math.max(1, Math.min(product.stock_quantity, Math.floor(Number(event.target.value) || 1))))} /></label><div className="market-actions"><MarketButton disabled={product.stock_quantity <= 0} onClick={() => add(product, quantity)}><i className="ri-shopping-bag-line" /> Add To Cart</MarketButton><MarketButton asChild><Link to="/cart">View Cart</Link></MarketButton></div>{product.vendor && <Link to="/products" search={{ page: 1, search: '', vendor_id: String(product.vendor.id) }}>More from {product.vendor.shop_name} <i className="ri-arrow-right-line" /></Link>}</div></div></PageSection>;
}