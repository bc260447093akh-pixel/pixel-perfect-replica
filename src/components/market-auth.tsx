import { Link, useNavigate } from '@tanstack/react-router';
import { useState, type ReactNode } from 'react';
import { api, configured, canCheckout, type AuthResponse, type Role } from '@/lib/marketplace';
import { useMarket } from './market-provider';
import { MarketButton } from './market-button';
import { PageSection } from './market-shell';

export function AccessGate({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { ready, user } = useMarket();
  if (!ready) return <PageSection title="Your Account"><p>Loading your account…</p></PageSection>;
  if (!user) return <PageSection title="Welcome Back"><p>Sign in to view your account.</p><MarketButton asChild><Link to="/login">Sign In</Link></MarketButton></PageSection>;
  if (roles && (roles.length === 2 && roles.includes('customer') && roles.includes('admin') ? !canCheckout(user.role) : !roles.includes(user.role))) return <PageSection title="Access Unavailable"><p>This page is not available for your account.</p><MarketButton asChild><Link to="/account">My Account</Link></MarketButton></PageSection>;
  return <>{children}</>;
}
export function AuthForm({ register = false }: { register?: boolean }) {
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user } = useMarket();
  const navigate = useNavigate();
  if (!configured) return <PageSection title={user ? `Hello, ${user.username}` : 'Sample Accounts'} subtitle="Marketplace Preview"><p className="market-warning">Sample data only · No real orders or payments.</p>{user && <MarketButton asChild><Link to={user.role === 'vendor' ? '/vendor' : user.role === 'admin' ? '/admin' : '/account'}>Open My Profile <i className="ri-arrow-right-line" /></Link></MarketButton>}</PageSection>;
  return <PageSection title={register ? 'Join The Marketplace' : 'Welcome Back'} subtitle={register ? 'Your Next Chapter Starts Here' : 'Your Favourites Are Waiting'}>
    {user ? <div><p>Signed in as {user.username}.</p><MarketButton asChild><Link to="/account">My Account</Link></MarketButton></div> : <form className="market-form" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setError(''); const form = new FormData(event.currentTarget);
      const body = register ? { username: form.get('username'), email: form.get('email'), password: form.get('password'), role, ...(role === 'vendor' ? { shop_name: form.get('shop_name'), shop_description: form.get('shop_description') } : {}) } : { email: form.get('email'), password: form.get('password') };
      try { const result = await api<AuthResponse>(register ? '/auth/register' : '/auth/login', { method: 'POST', body }); signIn(result); await navigate({ to: result.user.role === 'vendor' ? '/vendor' : result.user.role === 'admin' ? '/admin' : '/account' }); }
      catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); } finally { setBusy(false); }
    }}>
      {register && <><fieldset className="market-segments"><legend>Account type</legend><label><input type="radio" name="role" checked={role === 'customer'} onChange={() => setRole('customer')} /> Customer</label><label><input type="radio" name="role" checked={role === 'vendor'} onChange={() => setRole('vendor')} /> Seller</label></fieldset><label className="market-field">Username<input className="market-input" name="username" autoComplete="username" required /></label></>}
      <label className="market-field">Email<input className="market-input" name="email" type="email" autoComplete="email" required /></label>
      <label className="market-field">Password<input className="market-input" name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required /></label>
      {register && role === 'vendor' && <><label className="market-field">Shop name<input className="market-input" name="shop_name" required /></label><label className="market-field">Shop description<textarea className="market-input" name="shop_description" required rows={3} /></label></>}
      {!configured && <p className="market-warning">Sign-in and registration will be available when the shop is connected.</p>}
      {error && <p className="market-error" role="alert">{error}</p>}
      <MarketButton type="submit" disabled={busy || !configured}>{busy ? 'Please Wait…' : register ? 'Create Account' : 'Sign In'}</MarketButton>
      <p>{register ? 'Already have an account?' : 'New to the marketplace?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'} <i className="ri-arrow-right-line" /></Link></p>
    </form>}
  </PageSection>;
}