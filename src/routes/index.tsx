import { createFileRoute } from '@tanstack/react-router';
import { MarketHome } from '@/components/market-home';
import { MarketError, MarketNotFound } from '@/components/market-shell';
import { catalogOptions, pageHead } from '@/lib/marketplace';

export const Route = createFileRoute('/')({
  head: () => pageHead('Everyday Finds', 'Shop tech, style and everyday essentials from independent sellers at Kings Marketplace.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogOptions({ page: 1, search: '', vendor_id: '' })),
  errorComponent: MarketError,
  notFoundComponent: MarketNotFound,
  component: MarketHome,
});
