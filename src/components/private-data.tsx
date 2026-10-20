import { Suspense, type ReactNode } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMarket } from './market-provider';
import { MarketButton } from './market-button';
import { ErrorBoundary } from 'react-error-boundary';

export function PrivateData<T>({ path, children }: { path: string; children: (data: T) => ReactNode }) {
  return <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => <div><p className="market-error" role="alert">{error instanceof Error ? error.message : 'Could not load this information.'}</p><MarketButton onClick={resetErrorBoundary}>Try Again</MarketButton></div>}><Suspense fallback={<p>Loading…</p>}><PrivateResult<T> path={path}>{children}</PrivateResult></Suspense></ErrorBoundary>;
}
function PrivateResult<T>({ path, children }: { path: string; children: (data: T) => ReactNode }) {
  const { request, user } = useMarket();
  const { data } = useSuspenseQuery({ queryKey: ['private', user?.id, path], queryFn: () => request<T>(path), retry: false });
  return <>{children(data)}</>;
}