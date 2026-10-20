import { createFileRoute } from '@tanstack/react-router';
import { AccessGate } from '@/components/market-auth';
import { VendorPortal } from '@/components/vendor-portal';
import { pageHead } from '@/lib/marketplace';
export const Route = createFileRoute('/vendor')({ head: () => pageHead('Seller Studio', 'Manage your shop, products, orders and earnings at Kings Marketplace.'), component: Vendor });
function Vendor() { return <AccessGate roles={['vendor']}><VendorPortal /></AccessGate>; }