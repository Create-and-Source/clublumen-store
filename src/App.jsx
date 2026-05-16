import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Menu, X, ArrowRight, Minus, Plus, ChevronRight, Coffee, Music, Users } from 'lucide-react';
import { products, collections } from './data/products';

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const CartContext = createContext();

function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (product, color, size) => {
    const key = `${product.id}-${color}-${size}`;
    setCart(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { key, product, color, size, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (key, delta) => {
    setCart(prev => prev.map(i => i.key === key ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, cartOpen, setCartOpen, addToCart, updateQty, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() { return useContext(CartContext); }

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setCartOpen, cartCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          <Link to="/" className="header-logo">
            <img src="/products/lumen-logo-v2.png" alt="Club Lumen" className="header-logo-img" />
          </Link>
          <nav className="header-nav">
            <Link to="/shop">Shop</Link>
            <Link to="/collections">Collections</Link>
            <Link to="/about">About</Link>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button className="header-cart" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <button className="mobile-nav-close" onClick={() => setMobileOpen(false)}>
          <X size={28} />
        </button>
        <Link to="/shop" onClick={() => setMobileOpen(false)}>Shop</Link>
        <Link to="/collections" onClick={() => setMobileOpen(false)}>Collections</Link>
        <Link to="/about" onClick={() => setMobileOpen(false)}>About</Link>
      </div>
    </>
  );
}

function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQty, cartTotal } = useCart();

  return (
    <>
      <div className={`cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />
      <div className={`cart-drawer ${cartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <span className="cart-title">Cart ({cart.length})</span>
          <button onClick={() => setCartOpen(false)}><X size={20} /></button>
        </div>
        {cart.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={32} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.key} className="cart-item">
                  <img src={item.product.images[0]} alt="" className="cart-item-img" />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.product.name}</div>
                    <div className="cart-item-variant">{item.color} / {item.size}</div>
                    <div className="cart-item-price">${item.product.price}</div>
                    <div className="cart-qty">
                      <button onClick={() => updateQty(item.key, -1)}><Minus size={12} /></button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.key, 1)}><Plus size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-total"><span>Total</span><span>${cartTotal}</span></div>
              <button className="checkout-btn">Checkout <ArrowRight size={14} /></button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <img src="/products/lumen-logo-v2.png" alt="Club Lumen" style={{ width: 100, marginBottom: 16 }} />
          <p className="footer-brand-desc">
            Coffee + Music + Community.<br />
            The sober-curious morning rave.<br />
            Phoenix, AZ.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
            <a href="https://www.instagram.com/clublumen.az/" target="_blank" rel="noopener noreferrer" className="social-link">
              <InstagramIcon size={18} />
            </a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/shop">All Products</Link>
          <Link to="/shop">Tees</Link>
          <Link to="/shop">Hoodies</Link>
          <Link to="/shop">Crops & Tanks</Link>
          <Link to="/shop">Accessories</Link>
        </div>
        <div className="footer-col">
          <h4>Club Lumen</h4>
          <Link to="/about">About</Link>
          <Link to="/collections">Collections</Link>
          <a href="https://theclublumen.com/" target="_blank" rel="noopener noreferrer">Events</a>
          <a href="https://www.instagram.com/clublumen.az/" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
        <div className="footer-col">
          <h4>Info</h4>
          <a href="#">Shipping</a>
          <a href="#">Returns</a>
          <a href="#">Size Guide</a>
          <a href="#">Contact</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} Club Lumen. All rights reserved.</span>
        <span>The Morning Rave&trade;</span>
      </div>
    </footer>
  );
}

function ProductCard({ product, index }) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="product-card-img-wrap">
        <img src={product.images[0]} alt={product.name} className="product-card-img" loading="lazy" />
      </div>
      {product.badge && (
        <div className={`product-badge ${product.badge === 'Limited' ? 'badge-limited' : product.badge === 'New' ? 'badge-new' : 'badge-best'}`}>
          {product.badge}
        </div>
      )}
      <div className="product-card-info">
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-price">
          {product.comparePrice && (
            <span style={{ textDecoration: 'line-through', opacity: 0.4, marginRight: 8 }}>${product.comparePrice}</span>
          )}
          ${product.price}
        </div>
      </div>
    </motion.div>
  );
}

function HomePage() {
  const featured = products.filter(p => p.featured);

  return (
    <>
      <section className="hero">
        <div className="hero-bg-img" style={{ backgroundImage: 'url(/products/good-energy-hoodie-lifestyle.png)' }} />
        <div className="hero-overlay" />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <img src="/products/lumen-logo-v2.png" alt="Club Lumen" className="hero-logo-img" />
          <div className="hero-tagline">The Morning Rave&trade; &mdash; Phoenix, AZ</div>
          <div className="hero-slogans">Energy Is The New Currency</div>
          <Link to="/shop" className="hero-cta">
            Shop the Drop <ArrowRight size={14} />
          </Link>
        </motion.div>
      </section>

      <div className="marquee">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="marquee-item">
              <span>Coffee</span><span className="marquee-dot">+</span>
              <span>Music</span><span className="marquee-dot">+</span>
              <span>Community</span><span className="marquee-dot">/</span>
              <span>Dance Before Noon</span><span className="marquee-dot">/</span>
              <span>Good Energy Club</span><span className="marquee-dot">/</span>
              <span>Energy Is The New Currency</span><span className="marquee-dot">/</span>
              <span>You Are So Welcomed</span><span className="marquee-dot">/</span>
              <span>Coffee</span><span className="marquee-dot">+</span>
              <span>Music</span><span className="marquee-dot">+</span>
              <span>Community</span><span className="marquee-dot">/</span>
            </div>
          ))}
        </div>
      </div>

      <section className="section section-warm">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="section-label">New Arrivals</div>
            <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>The Drop</h2>
              <Link to="/shop" className="view-all-link">View All <ArrowRight size={14} /></Link>
            </div>
          </motion.div>
          <div className="products-grid">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="lifestyle-banner">
        <img src="/products/extra-lifestyle.png" alt="Club Lumen lifestyle" className="lifestyle-banner-img" />
        <div className="lifestyle-banner-overlay" />
        <div className="lifestyle-banner-content">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2>Dance Before Noon</h2>
            <p>Energy Is The New Currency</p>
            <Link to="/shop" className="hero-cta" style={{ marginTop: 32 }}>Shop Hoodies <ArrowRight size={14} /></Link>
          </motion.div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="section-label">The Vibe</div>
            <h2 className="section-title">What is Club Lumen?</h2>
            <p className="section-subtitle">A sober-curious morning rave. Real DJs. Real coffee. Real community. No alcohol necessary.</p>
          </motion.div>
          <div className="values-grid">
            {[
              { icon: <Coffee size={28} />, title: 'Coffee', desc: 'Local roasters serving up the good stuff. Espresso, cold brew, matcha. The only buzz you need to dance.' },
              { icon: <Music size={28} />, title: 'Music', desc: 'Real DJs spinning real sets. House, disco, funk, feel-good energy. The kind of music that moves your body and your soul.' },
              { icon: <Users size={28} />, title: 'Community', desc: 'Strangers become friends on the dance floor. A safe space to be yourself, move freely, and connect.' },
            ].map((v, i) => (
              <motion.div key={v.title} className="value-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}>
                <div className="value-icon">{v.icon}</div>
                <div className="value-title">{v.title}</div>
                <div className="value-desc">{v.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="lifestyle-banner">
        <img src="/products/move-body-tee-lifestyle.png" alt="Move Your Body" className="lifestyle-banner-img" />
        <div className="lifestyle-banner-overlay" />
        <div className="lifestyle-banner-content">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2>Move Your Body</h2>
            <p>Morning Rave &mdash; AZ</p>
          </motion.div>
        </div>
      </section>

      <section className="newsletter">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <div className="newsletter-title">Join the Movement</div>
          <p className="newsletter-sub">First access to merch drops, event tickets, and exclusive colorways.</p>
          <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Your email" />
            <button type="submit">Subscribe</button>
          </form>
        </motion.div>
      </section>
    </>
  );
}

function ShopPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const filtered = collections.find(c => c.id === activeFilter)?.filter
    ? products.filter(collections.find(c => c.id === activeFilter).filter)
    : products;

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <section className="section section-warm" style={{ paddingBottom: 40 }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="section-title">Shop All</h1>
          </motion.div>
          <div className="filter-row">
            {collections.map(c => (
              <button key={c.id} onClick={() => setActiveFilter(c.id)} className={`filter-btn ${activeFilter === c.id ? 'active' : ''}`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section style={{ padding: '0 40px 120px' }}>
        <div className="container">
          <div className="products-grid">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductPage() {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [mainImage, setMainImage] = useState(0);
  const { addToCart } = useCart();

  if (!product) return <div style={{ padding: '200px 40px', textAlign: 'center' }}>Product not found</div>;

  const handleAdd = () => {
    if (!selectedSize) return;
    addToCart(product, product.colors[selectedColor].name, selectedSize);
  };

  return (
    <div className="product-page">
      <div className="product-layout">
        <div className="product-gallery">
          <div className="product-gallery-main">
            <img src={product.images[mainImage]} alt={product.name} />
          </div>
          {product.images.length > 1 && (
            <div className="product-gallery-thumbs">
              {product.images.map((img, i) => (
                <button key={i} className={`thumb ${mainImage === i ? 'active' : ''}`} onClick={() => setMainImage(i)}>
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <motion.div className="product-info" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="product-breadcrumb">
            <Link to="/shop">Shop</Link> <ChevronRight size={10} style={{ margin: '0 6px' }} /> {product.category}
          </div>

          {product.badge && (
            <div className={`product-badge-inline ${product.badge === 'Limited' ? 'badge-limited' : product.badge === 'New' ? 'badge-new' : 'badge-best'}`}>
              {product.badge}
            </div>
          )}

          <h1 className="product-name">{product.name}</h1>
          <div className="product-price">
            {product.comparePrice && <span style={{ textDecoration: 'line-through', color: '#999', marginRight: 12 }}>${product.comparePrice}</span>}
            ${product.price}
          </div>
          <p className="product-desc">{product.description}</p>

          {product.colors.length > 1 && (
            <>
              <div className="option-label">Color — {product.colors[selectedColor].name}</div>
              <div className="color-options">
                {product.colors.map((c, i) => (
                  <button key={c.name} className={`color-swatch ${selectedColor === i ? 'active' : ''}`} style={{ background: c.hex === '#FFFFFF' ? '#f0f0f0' : c.hex }} onClick={() => setSelectedColor(i)} />
                ))}
              </div>
            </>
          )}

          <div className="option-label">Size</div>
          <div className="size-options">
            {product.sizes.map(s => (
              <button key={s} className={`size-btn ${selectedSize === s ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
            ))}
          </div>

          <button className="add-to-cart" onClick={handleAdd} disabled={!selectedSize} style={{ opacity: selectedSize ? 1 : 0.5 }}>
            {selectedSize ? 'Add to Cart' : 'Select a Size'} <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function CollectionsPage() {
  const drops = [
    { title: 'The Morning Rave', sub: 'Core Collection', img: '/products/morning-rave-hoodie-lifestyle.png', gradient: 'rgba(26,63,199,0.7)' },
    { title: 'Good Energy Club', sub: 'Hoodies & Crews', img: '/products/good-energy-hoodie-lifestyle.png', gradient: 'rgba(240,182,200,0.6)' },
    { title: 'Desert Disco', sub: 'Crops & Tanks', img: '/products/welcomed-crop-lifestyle.png', gradient: 'rgba(197,160,88,0.5)' },
    { title: 'Dance Before Noon', sub: 'Festival Season', img: '/products/extra-lifestyle.png', gradient: 'rgba(245,214,198,0.5)' },
  ];

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <section className="section section-warm">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="section-title">Collections</h1>
            <p className="section-subtitle">Curated drops for every vibe.</p>
          </motion.div>
        </div>
      </section>
      <div className="collections-grid">
        {drops.map((d, i) => (
          <Link key={i} to="/shop" className="collection-card">
            <img src={d.img} alt={d.title} />
            <div className="collection-card-overlay" style={{ background: `linear-gradient(to top, ${d.gradient}, transparent)` }} />
            <div className="collection-card-content">
              <div className="collection-card-sub">{d.sub}</div>
              <div className="collection-card-title">{d.title}</div>
            </div>
          </Link>
        ))}
      </div>
      <section className="newsletter" style={{ marginTop: 0 }}>
        <div className="newsletter-title">Get Notified</div>
        <p className="newsletter-sub">Be the first to know when new collections drop.</p>
        <form className="newsletter-form" onSubmit={e => e.preventDefault()}>
          <input type="email" placeholder="Your email" />
          <button type="submit">Notify Me</button>
        </form>
      </section>
    </div>
  );
}

function AboutPage() {
  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <section className="section section-warm">
        <div className="container" style={{ maxWidth: 700 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="section-label">The Story</div>
            <h1 className="section-title">Coffee + Music + Community</h1>
            <div style={{ fontSize: 16, lineHeight: 2, color: '#555' }}>
              <p style={{ marginBottom: 24 }}>
                Club Lumen started with a simple idea: what if we could capture the energy of a night out and bring it into the morning? No alcohol, no hangovers, no regrets. Just great music, great coffee, and great people.
              </p>
              <p style={{ marginBottom: 24 }}>
                Founded in Phoenix, Arizona, The Morning Rave&trade; is a sober-curious dance experience that proves you don't need a drink in your hand to have the time of your life. We partner with local DJs, local coffee roasters, and local communities to create something genuinely special.
              </p>
              <p style={{ marginBottom: 24 }}>
                From pool raves to yoga raves, hiking raves to cycle raves — we bring the energy wherever the community gathers. Every event is inclusive, welcoming, and built around one thing: connection through movement.
              </p>
              <p>
                This merch is an extension of that energy. Pieces designed for the dance floor, the poolside, and everything in between. Made for people who move. You are so welcomed.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      <div className="about-image-grid">
        <img src="/products/extra-lifestyle.png" alt="Club Lumen" />
        <img src="/products/move-body-tee-lifestyle.png" alt="Club Lumen" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />
        <Header />
        <CartDrawer />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
        <Footer />
      </CartProvider>
    </BrowserRouter>
  );
}
