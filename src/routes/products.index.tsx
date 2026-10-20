import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { catalogOptions, configured, pageHead } from '@/lib/marketplace';
import { ProductGrid } from '@/components/product-grid';
import { MarketButton } from '@/components/market-button';
import { PageSection, MarketError, MarketNotFound } from '@/components/market-shell';

export const Route = createFileRoute('/products/')({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Number(s.page) || 1), search: typeof s.search === 'string' ? s.search : '', vendor_id: typeof s.vendor_id === 'string' ? s.vendor_id : '' }),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(catalogOptions(deps)),
  head: () => pageHead('Shop All Products', 'Browse independent sellers, search products and discover your next favourite find.'),
  errorComponent: MarketError, notFoundComponent: MarketNotFound,
  component: Catalog,
});
function Catalog() {
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data } = useSuspenseQuery(catalogOptions(filters));
  return <PageSection title="Shop Your Favourites" subtitle="Discover Something New">
    <form className="market-toolbar" key={`${filters.search}-${filters.vendor_id}`} onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); void navigate({ search: { page: 1, search: String(form.get('search') || ''), vendor_id: String(form.get('vendor_id') || '') } }); }}>
      <label className="market-search"><i className="ri-search-line" /><input name="search" aria-label="Search products" placeholder="Search your next favourite..." defaultValue={filters.search} /></label>
      <input name="vendor_id" aria-label="Seller ID" placeholder="Seller ID" defaultValue={filters.vendor_id} className="market-input market-vendor-filter" />
      <MarketButton type="submit">Search</MarketButton>
      {(filters.search || filters.vendor_id) && <MarketButton variant="icon" title="Clear filters" aria-label="Clear filters" onClick={() => void navigate({ search: { page: 1, search: '', vendor_id: '' } })}><i className="ri-close-line" /></MarketButton>}
    </form>
    <p className="market-results">{data.meta?.total ?? data.data.length} products{!configured ? ' · Preview collection — sample products and prices' : ''}</p>
    <div className="menu-one"><ProductGrid products={data.data} /></div>
    <div className="market-pagination"><MarketButton asChild><Link to="/products" search={{ ...filters, page: Math.max(1, filters.page - 1) }} disabled={filters.page <= 1} aria-disabled={filters.page <= 1} className={filters.page <= 1 ? 'market-disabled' : ''}>Previous</Link></MarketButton><span>Page {data.meta?.current_page || filters.page}</span><MarketButton asChild><Link to="/products" search={{ ...filters, page: filters.page + 1 }} aria-disabled={!data.links?.next} className={!data.links?.next ? 'market-disabled' : ''}>Next</Link></MarketButton></div>
  </PageSection>;
}