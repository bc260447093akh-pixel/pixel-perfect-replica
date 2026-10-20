import { useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import tech from '@/assets/market-tech.webp';
import sneakers from '@/assets/market-sneakers.webp';
import style from '@/assets/market-style.webp';
import { catalogOptions, configured } from '@/lib/marketplace';
import { MarketImage } from './market-image';
import { MarketButton } from './market-button';
import { ProductGrid } from './product-grid';

const banners = [
  { title: 'Everyday Finds', subtitle: 'Your Marketplace. Your Next Favourite.', description: 'Discover tech, style, and everyday essentials. Great finds from independent sellers, all in one place.', image: tech },
  { title: 'Fresh New Steps', subtitle: 'A Little Style. A Lot Of Possibility.', description: 'Find something that feels like you. Explore fresh styles and everyday favourites from our sellers.', image: sneakers },
  { title: 'Carry Your Style', subtitle: 'Small Details. Big Personality.', description: 'Make room for your next favourite accessory. Discover the little things that make every day yours.', image: style },
];
export function MarketHome() {
  const { data } = useSuspenseQuery(catalogOptions({ page: 1, search: '', vendor_id: '' }));
  useEffect(() => {
    let cancelled = false;
    let swiper: { destroy: (deleteInstance?: boolean, cleanStyles?: boolean) => void } | undefined;
    void Promise.all([import('swiper'), import('swiper/modules')]).then(([{ default: Swiper }, { Navigation, Pagination, Autoplay, A11y }]) => {
      if (cancelled) return;
      swiper = new Swiper('.home-swiper', { modules: [Navigation, Pagination, Autoplay, A11y], loop: true, spaceBetween: 30, grabCursor: true, autoplay: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }, pagination: { el: '.swiper-pagination', clickable: true }, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' } });
    });
    return () => { cancelled = true; swiper?.destroy(true, true); };
  }, []);
  return <>
    <section className="home" id="home"><div className="home-swiper swiper container"><div className="swiper-wrapper">{banners.map((banner, index) => <div className="swiper-slide home__content grid" key={banner.title}><div className="home__data"><h3 className="home__subtitle">{banner.subtitle}</h3><h1 className="home__title">{banner.title}</h1><p className="home__description">{banner.description}</p><MarketButton asChild><Link to="/products" search={{ page: 1, search: '', vendor_id: '' }}>Shop The Collection</Link></MarketButton></div><MarketImage src={banner.image} alt={index === 0 ? 'Headphones, laptop and smartphone' : banner.title} className="home__img" slot="banner" fetchPriority={index === 0 ? 'high' : 'auto'} loading={index === 0 ? 'eager' : 'lazy'} /></div>)}</div><div className="swiper-pagination" /><MarketButton variant="plain" className="swiper-button-next" aria-label="Next banner"><i className="ri-arrow-right-line" /></MarketButton><MarketButton variant="plain" className="swiper-button-prev" aria-label="Previous banner"><i className="ri-arrow-left-line" /></MarketButton></div></section>
    <section className="about section container reveal"><div className="section__container grid"><div><span className="section__subtitle">A World Of Great Finds</span><h2 className="section__title">Something For Your Everyday</h2></div><div><p className="section__description">From your next everyday essential to a fresh new favourite, explore a marketplace full of possibilities. Discover independent shops and make your next find a good one.</p><div className="section__data"><i className="ri-store-2-line market-feature-icon" /><div><h3 className="section__data-title">Independent Shops</h3><p className="section__data-description">One marketplace. So much to discover.</p></div></div></div></div><div className="about__container grid">{[{ title: 'Tech Essentials', image: tech, search: 'headphones' }, { title: 'Everyday Style', image: sneakers, search: 'sneakers' }, { title: 'Finishing Touches', image: style, search: 'tote' }].map(collection => <Link key={collection.title} to="/products" search={{ page: 1, search: collection.search, vendor_id: '' }} className="about__item market-collection"><MarketImage src={collection.image} alt={collection.title} className="about__img" slot="collection" /><div className="about__top"><h3 className="about__top-title">{collection.title}</h3></div><div className="about__hover"><div className="about__hover-data"><h3 className="about__hover-title">{collection.title}</h3><p className="about__hover-description">Find your next favourite.</p><span className="button about__btn">Explore Collection</span></div></div></Link>)}</div></section>
    <section className="menu menu-one section reveal"><h2 className="section__title title-center">Your Next Favourite Finds</h2>{!configured && <p className="market-demo-label">Preview collection · sample products and prices</p>}<ProductGrid products={data.data.slice(0, 6)} /><div className="market-center"><MarketButton asChild><Link to="/products" search={{ page: 1, search: '', vendor_id: '' }}>View All Products</Link></MarketButton></div></section>
    <section className="section container reveal"><div className="section__container grid"><div><span className="section__subtitle">Make It Yours</span><h2 className="section__title">Your Shop. A New Chapter.</h2></div><div><p className="section__description">Bring your products to a new audience. Create your shop, share your story, and join our marketplace of independent sellers.</p><MarketButton asChild><Link to="/register">Become A Seller</Link></MarketButton></div></div><div className="market-benefits grid">{[{ icon: 'ri-store-2-line', title: 'Independent Sellers', text: 'Discover products from shops with their own story.' }, { icon: 'ri-wallet-3-line', title: 'Pay Your Way', text: 'JazzCash, Easypaisa, or cash on delivery.' }, { icon: 'ri-shopping-bag-3-line', title: 'All In One Place', text: 'Keep your favourite finds together in one cart.' }].map(item => <div key={item.title}><i className={`${item.icon} market-feature-icon`} /><h3>{item.title}</h3><p>{item.text}</p></div>)}</div></section>
  </>;
}