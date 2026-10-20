import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AccessGate } from '@/components/market-auth';
import { PrivateData } from '@/components/private-data';
import { useMarket } from '@/components/market-provider';
import { MarketButton } from '@/components/market-button';
import { PageSection } from '@/components/market-shell';
import { LedgerTable, PortalPagination } from '@/components/vendor-portal';
import { pageHead, money, pageRows, type Page, type Vendor, type Ledger } from '@/lib/marketplace';
type Stats = { total_commission_collected: number; total_vendor_payouts: number; total_orders: number; total_products: number; total_vendors: number; pending_vendor_approvals: number };
export const Route = createFileRoute('/admin')({ head: () => pageHead('Marketplace Administration', 'Review sellers and platform commission analytics at Kings Marketplace.'), component: Admin });
function Admin() { return <AccessGate roles={['admin']}><AdminPortal /></AccessGate>; }
function AdminPortal() {
  const [tab, setTab] = useState('overview');
  const [pending, setPending] = useState(true);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const { request } = useMarket();
  const query = useQueryClient();
  async function moderation(vendor: Vendor, approve: boolean) {
    if (!approve && !window.confirm(`Reject or revoke approval for ${vendor.shop_name}?`)) return;
    setBusy(true); setMessage('');
    try { await request(`/admin/vendors/${vendor.id}/${approve ? 'approve' : 'reject'}`, { method: 'PATCH' }); setMessage(approve ? 'Seller approved.' : 'Seller approval revoked.'); await query.invalidateQueries({ queryKey: ['private'] }); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Could not update seller.'); }
    finally { setBusy(false); }
  }
  return <PageSection title="Marketplace Overview" subtitle="Administration"><div className="market-portal-nav">{['overview', 'vendors', 'earnings'].map(value => <MarketButton key={value} aria-pressed={tab === value} onClick={() => { setTab(value); setPage(1); }}>{value.charAt(0).toUpperCase() + value.slice(1)}</MarketButton>)}</div>
    {tab === 'overview' && <PrivateData<Stats> path="/admin/stats">{stats => <div className="market-stat-grid">{[{ name: 'Commission collected', value: money(stats.total_commission_collected) }, { name: 'Vendor payouts', value: money(stats.total_vendor_payouts) }, { name: 'Orders', value: stats.total_orders }, { name: 'Products', value: stats.total_products }, { name: 'Vendors', value: stats.total_vendors }, { name: 'Pending approvals', value: stats.pending_vendor_approvals }].map(stat => <div key={stat.name}><strong>{stat.value}</strong>{stat.name}</div>)}</div>}</PrivateData>}
    {tab === 'vendors' && <><label><input type="checkbox" checked={pending} onChange={e => { setPending(e.target.checked); setPage(1); }} /> Pending approvals only</label>{message && <p role="status">{message}</p>}<PrivateData<Page<Vendor>> key={`${pending}-${page}`} path={`/admin/vendors?page=${page}${pending ? '&is_approved=false' : ''}`}>{data => <><div className="market-table-wrap"><table className="market-table"><thead><tr><th>Shop</th><th>Status</th><th>Actions</th></tr></thead><tbody>{pageRows(data).map(vendor => <tr key={vendor.id}><td>{vendor.shop_name}</td><td>{vendor.is_approved ? 'Approved' : 'Pending'}</td><td><div className="market-actions"><MarketButton variant="icon" title="Approve seller" aria-label={`Approve ${vendor.shop_name}`} disabled={busy || vendor.is_approved} onClick={() => void moderation(vendor, true)}><i className="ri-check-line" /></MarketButton><MarketButton variant="icon" title="Reject or revoke approval" aria-label={`Reject ${vendor.shop_name}`} disabled={busy} onClick={() => void moderation(vendor, false)}><i className="ri-close-line" /></MarketButton></div></td></tr>)}</tbody></table>{!pageRows(data).length && <p>No sellers to review.</p>}</div><PortalPagination page={page} next={Boolean(data.links?.next)} setPage={setPage} /></>}</PrivateData></>}
    {tab === 'earnings' && <PrivateData<Page<Ledger>> key={page} path={`/admin/earnings?page=${page}`}>{data => <><LedgerTable rows={pageRows(data)} /><PortalPagination page={page} next={Boolean(data.links?.next)} setPage={setPage} /></>}</PrivateData>}
  </PageSection>;
}