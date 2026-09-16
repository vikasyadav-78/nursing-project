import { useEffect, useMemo, useRef, useState } from 'react';
import { pageInfo } from '../pages/index.jsx';
import { abroadMenu, megaMenus } from '../navMenus.js';


const labels = {
  home: 'Home',
  logo: 'Logo Page',
  medical: 'Medical',
  engineering: 'Engineering',
  commerce: 'Commerce',
  science: 'Science',
  management: 'Management',
  computer: 'Computer Application',
  pharmacy: 'Pharmacy',
  architecture: 'Architecture',
  arts: 'Arts',
  dental: 'Dental',
  design: 'Design',
  education: 'Education',
  hospitality: 'Hospitality',
  law: 'Law',
  paramedical: 'Paramedical',
  veterinary: 'Veterinary Science',
  vocational: 'Vocational Courses',
};

const localMenuOrder = ['home', 'engineering', 'management', 'medical', 'science', 'commerce', 'pharmacy'];

const morePageOrder = [
  'paramedical',
  'architecture',
  'design',
  'hospitality',
  'law',
  'veterinary',
  'vocational',
  'arts',
  'computer',
  'dental',
  'education',
  'logo',
];

function getPage(slug) {
  return pageInfo[slug] ? { ...pageInfo[slug], label: labels[slug] || pageInfo[slug].name } : null;
}

// Navbar destinations always stay in this application's shared layout.
function navUrl(path) {
  if (!path) return '/home';
  const url = new URL(path, 'https://site.invalid');
  return `${url.pathname}${url.search}${url.hash}`;
}

function MenuLink({ item, category, className = '' }) {
  const [label, href] = item;
  return (
    <a className={className} href={`${navUrl(href)}?category=${category}`}>
      {label}
    </a>
  );
}

function MegaColumns({ menu, category }) {
  if (!menu?.columns?.length) return null;

  return (
    <div className="site-nav__mega-grid">
      {menu.columns.map((column) => (
        <div className="site-nav__mega-column" key={column.title}>
          <h3>{column.title}</h3>
          <ul>
            {column.items.map((item) => (
              <li key={`${column.title}-${item[0]}`}>
                <MenuLink item={item} category={category} />
              </li>
            ))}
          </ul>
          {column.secondTitle ? (
            <div className="site-nav__mega-secondary">
              <h3>{column.secondTitle}</h3>
              <ul>
                {column.secondItems.map((item) => (
                  <li key={`${column.secondTitle}-${item[0]}`}>
                    <MenuLink item={item} category={category} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PageNavLink({ page, activeSlug, onNavigate, withCaret = false }) {
  const isActive = activeSlug === page.slug;

  return (
    <a
      className={isActive ? 'active' : ''}
      href={`/${page.slug}`}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        onNavigate(`/${page.slug}`);
      }}
    >
      {page.label}
      {withCaret ? <span className="site-nav__caret">⌄</span> : null}
    </a>
  );
}

function DropdownNavItem({ page, activeSlug, onNavigate }) {
  const menu = megaMenus[page.slug];
  const [touchOpen, setTouchOpen] = useState(false);

  return (
    <div className={`site-nav__item${touchOpen ? " touch-open" : ""}`}>
      <PageNavLink page={page} activeSlug={activeSlug} onNavigate={onNavigate} withCaret={Boolean(menu)} />
      {menu ? <button type="button" className="nav-expand" aria-label={`Toggle ${page.label} menu`} aria-expanded={touchOpen} onClick={() => setTouchOpen(open => !open)}>⌄</button> : null}
      {menu ? (
        <div className="site-nav__mega" role="menu">
          <MegaColumns menu={menu} category={page.slug} />
        </div>
      ) : null}
    </div>
  );
}

export default function Navbar({ activeSlug, onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [abroadOpen, setAbroadOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeMoreSlug, setActiveMoreSlug] = useState(() => (
    morePageOrder.includes(activeSlug) ? activeSlug : morePageOrder[0]
  ));
  const moreRef = useRef(null);
  const visiblePages = useMemo(() => localMenuOrder.map(getPage).filter(Boolean), []);
  const morePages = useMemo(() => morePageOrder.map(getPage).filter(Boolean), []);
  const moreIsActive = morePages.some((page) => page.slug === activeSlug);
  const moreMenu = megaMenus[activeMoreSlug] || megaMenus[morePageOrder[0]];

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!moreRef.current?.contains(event.target)) setMoreOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') { setMoreOpen(false); setMobileOpen(false); setDismissed(true); }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setMoreOpen(false);
    if (morePageOrder.includes(activeSlug)) {
      setActiveMoreSlug(activeSlug);
    }
  }, [activeSlug]);

  return (
    <header
      className={`site-nav${dismissed ? ' menus-dismissed' : ''}${mobileOpen ? ' mobile-menu-open' : ''}`}
      onPointerOver={(event) => {
        const item = event.target.closest('.site-nav__item');
        if (item && !item.contains(event.relatedTarget)) setDismissed(false);
      }}
      onClickCapture={(event) => {
        if (event.target.closest('.nav-expand, .site-nav__item--more > button')) {
          setDismissed(false);
          return;
        }
        if (event.target.closest('a, .site-nav__more-list button')) {
          setDismissed(true);
          setMoreOpen(false);
          setMobileOpen(false);
          document.activeElement?.blur();
        }
      }}
    >
      <div className="site-nav__inner">
        <a
          className="site-nav__brand"
          href="/home"
          aria-label="citsAdmission.com home"
          onClick={(event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            onNavigate('/home');
          }}
        >
          <img src="/brand-logo.svg" alt="citsAdmission.com" style={{ height: '42px', width: 'auto', display: 'block' }} />
        </a>

        <button type="button" className="mobile-nav-toggle" aria-controls="main-navigation" aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => { setMobileOpen(open => !open); setDismissed(false); }}>
          <span aria-hidden="true">{mobileOpen ? '✕' : '☰'}</span> Menu
        </button>
        <nav
          id="main-navigation"
          className="site-nav__links"
          aria-label="Main pages"
          onClick={(event) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const link = event.target.closest('a[href]');
            if (!link || !event.currentTarget.contains(link)) return;
            event.preventDefault();
            onNavigate(link.getAttribute('href'));
            setMoreOpen(false);
          }}
        >
          {visiblePages.map((page) => (
            <DropdownNavItem key={page.slug} page={page} activeSlug={activeSlug} onNavigate={onNavigate} />
          ))}

          <div className={`site-nav__item${abroadOpen ? " touch-open" : ""}`}>
            <a href={navUrl('/study-abroad')}>
              Go Abroad
              <span className="site-nav__caret">⌄</span>
            </a>
            <button type="button" className="nav-expand" aria-label="Toggle Go Abroad menu" aria-expanded={abroadOpen} onClick={() => setAbroadOpen(open => !open)}>⌄</button>
            <div className="site-nav__mega site-nav__mega--abroad" role="menu">
              <MegaColumns menu={abroadMenu} category="logo" />
            </div>
          </div>

          <div className="site-nav__item site-nav__item--more" ref={moreRef}>
            <button
              type="button"
              className={moreIsActive ? 'active' : ''}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              onClick={() => setMoreOpen((open) => !open)}
            >
              More
              <span className="site-nav__caret">⌄</span>
            </button>
            <div className={`site-nav__mega site-nav__mega--more${moreOpen ? ' open' : ''}`} role="menu">
              <aside className="site-nav__more-list" aria-label="More pages">
                {morePages.map((page) => (
                  <button
                    type="button"
                    key={page.slug}
                    className={activeMoreSlug === page.slug ? 'active' : ''}
                    onMouseEnter={() => setActiveMoreSlug(page.slug)}
                    onFocus={() => setActiveMoreSlug(page.slug)}
                    onClick={() => {
                      setMoreOpen(false);
                      onNavigate(`/${page.slug}`);
                    }}
                  >
                    {page.label}
                  </button>
                ))}
              </aside>
              <MegaColumns menu={moreMenu} category={activeMoreSlug} />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
