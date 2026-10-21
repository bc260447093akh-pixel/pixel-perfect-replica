import { Link, useLocation, useRouter, type ErrorComponentProps } from '@tanstack/react-router';
import { useEffect, useState, type ReactNode } from 'react';
import { MarketButton } from './market-button';
import { useMarket } from './market-provider';
import { configured } from '@/lib/marketplace';

const logo = 'https://raw.githubusercontent.com/ViniciusJMoreira/foodio-restaurant/main/assets/img/logo.png';
const darkLogo = 'https://raw.githubusercontent.com/ViniciusJMoreira/foodio-restaurant/main/assets/img/logo-dark.png';
export function MarketShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scroll, setScroll] = useState(false);
  const { cart, user, notice, setNotice } = useMarket();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScroll(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice, setNotice]);
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); } }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(el => { el.classList.add('reveal-ready'); observer.observe(el); });
    return () => observer.disconnect();
  }, [pathname]);
  return <>
    <header className={`header ${pathname !== '/' ? 'market-inner-header' : ''}`}><nav className="nav container">
      <Link to="/" className="nav__logo" aria-label="Kings Marketplace home"><img src={logo} alt="Kings" className="nav__logo-img" /></Link>
      <div className={`nav__menu ${open ? 'show-menu' : ''}`} id="nav-menu">
        <Link to="/" className="logo__mobile"><img src={darkLogo} alt="Kings" className="logo__mobile-img" /></Link>
        <ul className="nav__list">
          <li><Link to="/" className={`nav__link ${pathname === '/' ? 'active-link' : ''}`}>Home</Link></li>
          <li><Link to="/products" search={{ page: 1, search: '', vendor_id: '' }} className={`nav__link ${pathname.startsWith('/products') ? 'active-link' : ''}`}>Shop</Link></li>
          <li><Link to="/orders" className="nav__link">Orders</Link></li>
          <li><Link to={user || !configured ? '/account' : '/login'} className="nav__link">{user || !configured ? 'My Profile' : 'Sign In'}</Link></li>
          <li><Link to={user?.role === 'vendor' ? '/vendor' : '/register'} className="nav__link">{user?.role === 'vendor' ? 'My Shop' : 'Sell With Us'}</Link></li>
          {user?.role === 'admin' && <li><Link to="/admin" className="nav__link">Admin</Link></li>}
        </ul>
        <MarketButton variant="plain" className="nav__close" aria-label="Close menu" onClick={() => setOpen(false)}><i className="ri-close-circle-line" /></MarketButton>
      </div>
      <div className="nav__btns market-nav-actions">
        <MarketButton variant="plain" className="nav__toggle" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><i className="ri-menu-line" /></MarketButton>
        <MarketButton asChild className="market-cart-button"><Link to="/cart"><i className="ri-shopping-bag-line" /> <span>Cart ({cart.reduce((n, row) => n + row.quantity, 0)})</span></Link></MarketButton>
      </div>
    </nav></header>
    <main className={`main ${pathname !== '/' ? 'market-inner-main' : ''}`}>{children}</main>
    <footer className="footer"><div className="footer__container container grid section">
      <div><Link to="/"><img src={logo} alt="Kings" className="footer__logo-img" /></Link><p className="footer__description">Your next favourite find. Shop everyday essentials, fresh styles, and tech from independent sellers.</p><MarketButton asChild><Link to="/products" search={{ page: 1, search: '', vendor_id: '' }}>Explore The Shop</Link></MarketButton></div>
      <div><h3 className="footer__title">Your Marketplace</h3><div className="market-footer-links"><Link to="/products" search={{ page: 1, search: '', vendor_id: '' }}>All Products <i className="ri-arrow-right-up-line" /></Link><Link to="/orders">My Orders <i className="ri-arrow-right-up-line" /></Link><Link to="/register">Become a Seller <i className="ri-arrow-right-up-line" /></Link><Link to="/account">My Account <i className="ri-arrow-right-up-line" /></Link></div><p className="footer__description">JazzCash · Easypaisa · Cash on delivery<br />All prices in Pakistani Rupees.</p></div>
    </div><div className="footer__copy">© 2026 <span>Kings Marketplace</span></div></footer>
    {notice && <div className="market-notice" role="status">{notice}<MarketButton variant="plain" aria-label="Dismiss notification" onClick={() => setNotice('')}><i className="ri-close-line" /></MarketButton></div>}
    <MarketButton variant="plain" className={`scrollup ${scroll ? 'show-scroll' : ''}`} title="Back to top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><i className="ri-arrow-up-line scrollup__icon" /></MarketButton>
  </>;
}
export function PageSection({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) { return <section className="section container market-page"><span className="section__subtitle">{subtitle || 'Kings Marketplace'}</span><h1 className="section__title market-page-title">{title}</h1>{children}</section>; }
export function MarketError({ error }: ErrorComponentProps) { const router = useRouter(); return <PageSection title="Something went wrong"><p role="alert">{error instanceof Error ? error.message : 'Please try again.'}</p><MarketButton onClick={() => void router.invalidate()}>Try Again</MarketButton></PageSection>; }
export function MarketNotFound() { return <PageSection title="Not found"><p>This item is no longer available.</p><MarketButton asChild><Link to="/products" search={{ page: 1, search: '', vendor_id: '' }}>Back To Shop</Link></MarketButton></PageSection>; }