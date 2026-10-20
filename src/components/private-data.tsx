import { Component, Suspense, type ReactNode } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMarket } from './market-provider';
import { MarketButton } from './market-button';

class DataBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: unknown) { return { error: error instanceof Error ? error : new Error('Could not load this information.') }; }
  override render() { return this.state.error ? <div><p className="market-error" role="alert">{this.state.error.message}</p><MarketButton onClick={() => this.setState({ error: null })}>Try Again</MarketButton></div> : this.props.children; }
}

export function PrivateData<T>({ path, children }: { path: string; children: (data: T) => ReactNode }) {
  const { user } = useMarket();
  return <DataBoundary key={`${user?.id}-${path}`}><Suspense fallback={<p>Loading…</p>}><PrivateResult<T> path={path}>{children}</PrivateResult></Suspense></DataBoundary>;
}
function PrivateResult<T>({ path, children }: { path: string; children: (data: T) => ReactNode }) {
  const { request, user } = useMarket();
  const { data } = useSuspenseQuery({ queryKey: ['private', user?.id, path], queryFn: () => request<T>(path), retry: false });
  return <>{children(data)}</>;
}