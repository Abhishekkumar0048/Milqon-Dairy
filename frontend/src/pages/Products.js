import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';

const CATEGORIES = ['all', 'milk', 'paneer', 'curd', 'ghee', 'butter', 'makhan', 'lassi', 'chach', 'peda'];

const PRODUCT_LOGO = {
  milk:   '🥛',
  paneer: '🧀',
  curd:   '🍶',
  ghee:   '🧈',
  butter: '🧈',
  makhan: '🫙',
  lassi:  '🥤',
  chach:  '🥛',
  peda:   '🍮',
};

// Map product name keywords to actual images
const PRODUCT_IMAGE = {
  'Full Cream Milk':   '/milqon-milk.jpeg',
  'Toned Milk':        '/milqon-milk.jpeg',
  'Buffalo Milk':      '/milqon-milk.jpeg',
  'Cow Milk (A2)':     '/milqon-milk.jpeg',
  'Fresh Paneer':      '/paneer.png',
  'Malai Paneer':      '/malai-paneer.png',
  'Dahi (Curd)':       '/curd.png',
  'Mishti Doi':        '/mishti-doi.png',
  'Pure Cow Ghee':     '/cow-ghee.png',
  'Buffalo Ghee':      '/buffalo-ghee.png',
  'Sweet Lassi':       '/lassi.png',
  'Salted Lassi':      '/lassi.png',
  'Mango Lassi':       '/mango-lassi.png',
  'Rose Lassi':        '/rose-lassi.png',
  'Masala Chach':      '/chach.png',
  'Plain Chach':       '/plain-chach.png',
  'Salted Butter':     '/salted-butter.png',
  'White Butter':      '/salted-butter.png',
  'Milk Peda':         '/milk-peda.png',
  'Kesar Peda':        '/keshar-peda.png',
  'Chocolate Peda':    '/chocolate-peda.png',
  'Desi Makhan':       '/desi-makhan.png',
  'Malai Makhan':      '/desi-makhan.png',
};

const BADGE = {
  milk: 'Fresh',
  ghee: 'Bestseller',
  lassi: 'New',
  peda: 'New',
  chach: 'New',
  makhan: 'New',
};

const BADGE_CLASS = {
  Fresh: 'fresh',
  Bestseller: 'bestseller',
  New: '',
};

let toastTimer;
function showToast(msg) {
  let t = document.getElementById('milqon-toast');
  if (!t) { t = document.createElement('div'); t.id = 'milqon-toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.style.display = 'none'; }, 2500);
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) setCategory(cat);
  }, [location.search]);

  useEffect(() => {
    setLoading(true);
    api.get('/products' + (category !== 'all' ? `?category=${category}` : ''))
      .then(r => { setProducts(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category]);

  return (
    <div className="container">
      <div style={{ marginTop: 24, marginBottom: 8 }}>
        <div className="section-title">Our <span style={{ color: '#2e7d32' }}>Products</span></div>
        <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Fresh dairy products from Milqon Dairy — delivered to your door</p>
      </div>

      <div className="cat-filter">
        {CATEGORIES.map(c => (
          <button key={c} className={`cat-btn${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>
            {PRODUCT_LOGO[c] || '🥛'} {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontSize: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🥛</div>
          Loading fresh products...
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <h3>No products found</h3>
          <p>Try a different category</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(p => {
            const badge = BADGE[p.category];
            return (
              <div key={p._id} className="product-card" onClick={() => navigate(`/products/${p._id}`)} style={{ cursor: 'pointer' }}>
                <div className="product-img">
                  {badge && <span className={`product-badge ${BADGE_CLASS[badge] || ''}`}>{badge}</span>}
                  {PRODUCT_IMAGE[p.name]
                    ? <img src={PRODUCT_IMAGE[p.name]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 72 }}>{PRODUCT_LOGO[p.category] || '🥛'}</span>
                  }
                </div>
                <div className="product-info">
                  <div className="product-name">{p.name}</div>
                  <div className="product-unit">{p.unit}</div>
                  <div className="product-rating">
                    <span className="stars">★★★★★</span>
                    <span className="rating-count">(128)</span>
                  </div>
                  <div className="product-price-row">
                    <span className="product-price">₹{p.price}</span>
                    <span className="product-mrp">₹{Math.round(p.price * 1.15)}</span>
                    <span className="product-discount">13% off</span>
                  </div>
                  <div className="product-desc">{p.description}</div>
                  {!p.inStock && <div className="out-of-stock">Out of Stock</div>}
                </div>
                <button
                  className="add-cart-btn"
                  disabled={!p.inStock}
                  onClick={() => { addToCart(p); showToast(`✅ ${p.name} added to cart!`); }}
                >
                  {p.inStock ? '🛒 Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
