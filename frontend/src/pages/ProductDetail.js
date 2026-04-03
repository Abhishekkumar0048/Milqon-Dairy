import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';

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

const PRODUCT_LOGO = { milk:'🥛', paneer:'🧀', curd:'🍶', ghee:'🧈', butter:'🧈', makhan:'🫙', lassi:'🥤', chach:'🥛', peda:'🍮' };

let toastTimer;
function showToast(msg) {
  let t = document.getElementById('milqon-toast');
  if (!t) { t = document.createElement('div'); t.id = 'milqon-toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.style.display = 'none'; }, 2500);
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => { setProduct(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: '#888', fontSize: 16 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🥛</div>
      Loading...
    </div>
  );

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: 48 }}>😕</div>
      <p>Product not found</p>
      <button className="btn btn-primary" onClick={() => navigate('/products')}>← Back to Products</button>
    </div>
  );

  const img = PRODUCT_IMAGE[product.name];
  const mrp = Math.round(product.price * 1.15);
  const discount = Math.round(((mrp - product.price) / mrp) * 100);

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <div className="container" style={{ maxWidth: 700, paddingTop: 24, paddingBottom: 40 }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#2e7d32', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 16 }}>
        ← Back
      </button>

      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {/* Product Image */}
        <div style={{ background: '#f1f8e9', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
          {img
            ? <img src={img} alt={product.name} style={{ height: '100%', width: '100%', objectFit: 'contain', padding: 16 }} />
            : <span style={{ fontSize: 100 }}>{PRODUCT_LOGO[product.category] || '🥛'}</span>
          }
        </div>

        {/* Product Info */}
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>{product.name}</div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>{product.unit}</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ color: '#f9a825', fontSize: 16 }}>★★★★★</span>
            <span style={{ fontSize: 13, color: '#888' }}>(128 reviews)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: '#1b5e20' }}>₹{product.price}</span>
            <span style={{ fontSize: 18, color: '#aaa', textDecoration: 'line-through' }}>₹{mrp}</span>
            <span style={{ background: '#e8f5e9', color: '#2e7d32', fontWeight: 700, fontSize: 13, padding: '3px 10px', borderRadius: 20 }}>{discount}% off</span>
          </div>

          {product.description && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#555', marginBottom: 6 }}>About this product</div>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, margin: 0 }}>{product.description}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#888' }}>Category</div>
              <div style={{ fontWeight: 700, fontSize: 14, textTransform: 'capitalize' }}>{product.category}</div>
            </div>
            <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#888' }}>Availability</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: product.inStock ? '#2e7d32' : '#e53935' }}>
                {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
              </div>
            </div>
            <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#888' }}>Delivery</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#2e7d32' }}>🚚 Same Day</div>
            </div>
          </div>

          {!product.inStock && (
            <div style={{ background: '#ffebee', color: '#e53935', borderRadius: 10, padding: '10px 16px', textAlign: 'center', fontWeight: 700, marginBottom: 16 }}>
              Out of Stock
            </div>
          )}

          {product.inStock && (
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: 700 }}
                onClick={() => { addToCart(product); showToast(`✅ ${product.name} added to cart!`); }}
              >
                🛒 Add to Cart
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: 700 }}
                onClick={handleBuyNow}
              >
                ⚡ Buy Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
