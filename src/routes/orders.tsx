import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AccessGate } from '@/components/market-auth';
import { PrivateData } from '@/components/private-data';
import { OrderList } from '@/components/order-list';
import { PageSection } from '@/components/market-shell';
import { MarketButton } from '@/components/market-button';
import { pageHead, pageRows, type Page, type Order } from '@/lib/marketplace';
export const Route = createFileRoute('/orders')({ head: () => pageHead('Your Orders', 'View your order history and payment status at Kings Marketplace.'), component: Orders });
function Orders() {
  const [page, setPage] = useState(1);
  return <AccessGate roles={['customer']}><PageSection title="Your Orders" subtitle="Your Finds, Past And Present"><PrivateData<Page<Order>> key={page} path={`/orders?page=${page}`}>{data => <><OrderList orders={pageRows(data)} /><div className="market-pagination"><MarketButton disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</MarketButton><span>Page {page}</span><MarketButton disabled={!data.links?.next} onClick={() => setPage(page + 1)}>Next</MarketButton></div></>}</PrivateData></PageSection></AccessGate>;
}