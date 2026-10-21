import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMarket } from './market-provider';
import { PrivateData } from './private-data';
import { MarketButton } from './market-button';
import { PageSection } from './market-shell';
import { OrderList } from './order-list';
import { productKey, money, pageRows, canManageProducts, type Vendor, type Product, type Order, type Ledger, type Page } from '@/lib/marketplace';

export function LedgerTable({ rows }: { rows: Ledger[] }) { return <div className="market-table-wrap"><table className="market-table"><thead><tr><th>Order amount</th><th>Commission</th><th>Seller earning</th><th>Date</th></tr></thead><tbody>{rows.map((row, i) => <tr key={i}><td>{money(row.order_amount)}</td><td>{money(row.commission_fee)}</td><td>{money(row.vendor_earning)}</td><td>{new Date(row.created_at).toLocaleDateString('en-PK', { timeZone: 'UTC' })}</td></tr>)}</tbody></table>{!rows.length && <p>No earnings yet.</p>}</div>; }
export function VendorPortal() {
  const [tab, setTab] = useState('profile');
  const [page, setPage] = useState(1);
  return <PageSection title="Your Seller Studio" subtitle="Your Shop. Your Story."><div className="market-portal-nav">{['profile', 'products', 'orders', 'earnings'].map(value => <MarketButton key={value} onClick={() => { setTab(value); setPage(1); }} aria-pressed={tab === value}>{value.charAt(0).toUpperCase() + value.slice(1)}</MarketButton>)}</div><PrivateData<{ vendor: Vendor; total_earnings: number }> path="/vendor/profile">{profile => <>
    {!profile.vendor.is_approved && <p className="market-warning" role="status">Your shop is pending approval. Product management is available after approval.</p>}
    {tab === 'profile' && <><div className="market-stat-grid"><div><strong>{money(profile.total_earnings)}</strong>Total earnings</div><div><strong>{profile.vendor.products_count || 0}</strong>Products</div><div><strong>{profile.vendor.is_approved ? 'Approved' : 'Pending'}</strong>Shop status</div></div><ShopForm vendor={profile.vendor} /></>}
    {tab === 'products' && <VendorProducts vendor={profile.vendor} />}
    {tab === 'orders' && <PrivateData<Page<Order>> key={`orders-${page}`} path={`/vendor/orders?page=${page}`}>{data => <><OrderList orders={pageRows(data)} /><PortalPagination page={page} next={Boolean(data.links?.next)} setPage={setPage} /></>}</PrivateData>}
    {tab === 'earnings' && <PrivateData<Page<Ledger>> key={`earnings-${page}`} path={`/vendor/earnings?page=${page}`}>{data => <><LedgerTable rows={pageRows(data)} /><PortalPagination page={page} next={Boolean(data.links?.next)} setPage={setPage} /></>}</PrivateData>}
  </>}</PrivateData></PageSection>;
}
export function PortalPagination({ page, next, setPage }: { page: number; next: boolean; setPage: (page: number) => void }) { return <div className="market-pagination"><MarketButton disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</MarketButton><span>Page {page}</span><MarketButton disabled={!next} onClick={() => setPage(page + 1)}>Next</MarketButton></div>; }
function ShopForm({ vendor }: { vendor: Vendor }) {
  const { request } = useMarket();
  const query = useQueryClient();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  return <form className="market-form" onSubmit={async event => { event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true); setMessage(''); try { await request('/vendor/profile', { method: 'PUT', body: { shop_name: data.get('shop_name'), shop_description: data.get('shop_description') } }); setMessage('Your shop has been updated.'); await query.invalidateQueries({ queryKey: ['private'] }); } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not update shop.'); } finally { setBusy(false); } }}><label className="market-field">Shop name<input className="market-input" name="shop_name" required defaultValue={vendor.shop_name} /></label><label className="market-field">Shop description<textarea className="market-input" name="shop_description" rows={4} defaultValue={vendor.shop_description} /></label><MarketButton disabled={busy} type="submit">{busy ? 'Saving…' : 'Save Shop'}</MarketButton>{message && <p role="status">{message}</p>}</form>;
}
function VendorProducts({ vendor }: { vendor: Vendor }) {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const { request, user } = useMarket();
  const query = useQueryClient();
  const allowed = user ? canManageProducts({ ...user, vendor }) : false;
  return <><div className="market-actions"><MarketButton disabled={!allowed} onClick={() => setEditing('new')}><i className="ri-add-line" /> New Product</MarketButton></div>
    {editing && vendor.is_approved && <ProductEditor key={editing === 'new' ? 'new' : editing.id} product={editing === 'new' ? undefined : editing} close={() => setEditing(null)} />}
    {message && <p className="market-error" role="status">{message}</p>}
    <PrivateData<Page<Product>> key={page} path={`/products?vendor_id=${vendor.id}&page=${page}&per_page=15`}>{data => <><div className="market-table-wrap"><table className="market-table"><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>{pageRows(data).map(product => <tr key={product.id}><td><Link to="/products/$slug" params={{ slug: productKey(product) }}>{product.name}</Link></td><td>{money(product.price)}</td><td>{product.stock_quantity}</td><td><div className="market-actions"><MarketButton variant="icon" title="Edit product" aria-label={`Edit ${product.name}`} disabled={!vendor.is_approved || busy} onClick={() => setEditing(product)}><i className="ri-edit-line" /></MarketButton><MarketButton variant="icon" title="Delete product" aria-label={`Delete ${product.name}`} disabled={!vendor.is_approved || busy} onClick={async () => { if (!window.confirm(`Delete ${product.name}?`)) return; setBusy(true); setMessage(''); try { await request(`/vendor/products/${product.id}`, { method: 'DELETE' }); await query.invalidateQueries({ queryKey: ['private'] }); await query.invalidateQueries({ queryKey: ['products'] }); } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not delete product.'); } finally { setBusy(false); } }}><i className="ri-delete-bin-line" /></MarketButton></div></td></tr>)}</tbody></table>{!data.data.length && <p>No public products for this shop yet.</p>}</div><PortalPagination page={page} next={Boolean(data.links?.next)} setPage={setPage} /></>}</PrivateData>
  </>;
}
function ProductEditor({ product, close }: { product?: Product | undefined; close: () => void }) {
  const { request } = useMarket();
  const query = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <form className="market-editor" onSubmit={async event => { event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true); setError(''); const body = { name: form.get('name'), description: form.get('description'), image: form.get('image'), price: Number(form.get('price')), stock_quantity: Number(form.get('stock_quantity')), is_active: form.get('is_active') === 'on', flat_discount: form.get('flat_discount') === '' ? null : Number(form.get('flat_discount')), percentage_discount: form.get('percentage_discount') === '' ? null : Number(form.get('percentage_discount')) }; try { await request(product ? `/vendor/products/${product.id}` : '/vendor/products', { method: product ? 'PUT' : 'POST', body }); await query.invalidateQueries({ queryKey: ['private'] }); await query.invalidateQueries({ queryKey: ['products'] }); await query.invalidateQueries({ queryKey: ['product'] }); close(); } catch (e) { setError(e instanceof Error ? e.message : 'Could not save product.'); } finally { setBusy(false); } }}><h3>{product ? 'Edit Product' : 'New Product'}</h3><div className="market-editor-grid grid"><label className="market-field">Product name<input className="market-input" name="name" required defaultValue={product?.name} /></label><label className="market-field">Image URL<input className="market-input" name="image" type="url" required defaultValue={product?.image} /></label><label className="market-field">Price (PKR)<input className="market-input" name="price" type="number" min={0} step="0.01" required defaultValue={product?.price} /></label><label className="market-field">Stock quantity<input className="market-input" name="stock_quantity" type="number" min={0} step={1} required defaultValue={product?.stock_quantity} /></label><label className="market-field">Flat discount (PKR)<input className="market-input" name="flat_discount" type="number" min={0} step="0.01" defaultValue={product?.flat_discount ?? ''} /></label><label className="market-field">Percentage discount<input className="market-input" name="percentage_discount" type="number" min={0} max={100} step="0.01" defaultValue={product?.percentage_discount ?? ''} /></label></div><label className="market-field">Description<textarea className="market-input" name="description" rows={4} defaultValue={product?.description} /></label><label><input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} /> Active product</label>{error && <p className="market-error" role="alert">{error}</p>}<div className="market-actions"><MarketButton type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save Product'}</MarketButton><MarketButton variant="icon" onClick={close} title="Cancel editing" aria-label="Cancel editing"><i className="ri-close-line" /></MarketButton></div></form>;
}