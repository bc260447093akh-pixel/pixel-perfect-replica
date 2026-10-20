import { useNavigate } from '@tanstack/react-router';
import { configured, type Role } from '@/lib/marketplace';
import { useMarket } from './market-provider';
import { MarketButton } from './market-button';

export function DemoAccounts() {
  const { user, previewAs } = useMarket();
  const navigate = useNavigate();
  if (configured) return null;
  return <div className="market-demo-accounts"><span className="market-muted">Sample accounts</span><div className="market-actions">{([
    { role: 'customer', label: 'Customer Profile', icon: 'ri-user-line', to: '/account' },
    { role: 'vendor', label: 'Seller Profile', icon: 'ri-store-2-line', to: '/vendor' },
    { role: 'admin', label: 'Admin Panel', icon: 'ri-shield-user-line', to: '/admin' },
  ] as const).map(item => <MarketButton key={item.role} aria-pressed={user?.role === item.role} onClick={() => { previewAs(item.role as Role); void navigate({ to: item.to }); }}><i className={item.icon} /> {item.label}</MarketButton>)}</div></div>;
}