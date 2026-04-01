import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const features = [
  { icon: '🌿', title: 'Farm Fresh', desc: 'Direct from our farm to your home' },
  { icon: '🚚', title: 'Free Delivery', desc: 'Free on orders above ₹299' },
  { icon: '💰', title: 'Best Price', desc: 'No middlemen, fair prices' },
  { icon: '🔄', title: 'Subscription', desc: 'Daily milk subscription available' },
  { icon: '✅', title: '100% Pure', desc: 'No adulteration, certified pure' },
  { icon: '❄️', title: 'Cold Chain', desc: 'Maintained freshness always' },
  { icon: '📱', title: 'Easy Orders', desc: 'Order in just 2 clicks' },
  { icon: '⭐', title: 'Trusted', desc: '10,000+ happy customers' },
];

const categories = [
  { img: '/milqon-milk.jpeg', name: 'Milk', key: 'milk' },
  { img: '/paneer.png', name: 'Paneer', key: 'paneer' },
  { img: '/curd.png', name: 'Curd', key: 'curd' },
  { img: '/cow-ghee.png', name: 'Ghee', key: 'ghee' },
  { img: '/salted-butter.png', name: 'Butter', key: 'butter' },
  { img: '/desi-makhan.png', name: 'Makhan', key: 'makhan' },
  { img: '/lassi.png', name: 'Lassi', key: 'lassi' },
  { img: '/chach.png', name: 'Chach', key: 'chach' },
  { img: '/milk-peda.png', name: 'Peda', key: 'peda' },
];

const SLIDES = [
  { img: '/milk1.jpg' },
  { img: '/milk2.jpg' },
  { img: '/milk3.jpg' },
  { img: '/milk4.jpg' },
];

function ImageSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(p => (p + 1) % SLIDES.length), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="slider-wrapper">
      {SLIDES.map((s, i) => (
        <img key={i} src={s.img} alt={`slide-${i}`} className={`slide-img${i === current ? ' active' : ''}`} />
      ))}
      <div className="slider-dots">
        {SLIDES.map((_, i) => (
          <span key={i} className={`dot${i === current ? ' active' : ''}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
      <button className="slide-arrow left" onClick={() => setCurrent(p => (p - 1 + SLIDES.length) % SLIDES.length)}>‹</button>
      <button className="slide-arrow right" onClick={() => setCurrent(p => (p + 1) % SLIDES.length)}>›</button>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Image Slider */}
      <ImageSlider />

      {/* Hero Banner */}
      <div className="container">
        <div className="hero-banner">
          <img src="/nature.jpeg" alt="hero" className="hero-bg-img" />
          <div className="hero-overlay">
            <div className="hero-content">
              <div className="hero-badge">🌟 INDIA'S TRUSTED DAIRY</div>
              <h1>Pure Dairy,<br /><span>Delivered Fresh</span></h1>
              <p>Har Ghar Ka Bharosa – Milqon Dairy. Fresh dairy products delivered to your door.</p>
              <div className="hero-btns">
                <button className="btn-hero btn-hero-primary" onClick={() => navigate('/products')}>🛍️ Shop Now</button>
                <button className="btn-hero btn-hero-outline" onClick={() => navigate('/register')}>📦 Subscribe Daily</button>
              </div>
            </div>
          </div>
        </div>

        {/* Offer Strip */}
        <div className="offer-strip">
          <div className="offer-card"><span className="offer-icon">🚚</span><div><div className="offer-title">Free Delivery</div><div className="offer-desc">On orders above ₹299</div></div></div>
          <div className="offer-card"><span className="offer-icon">🌿</span><div><div className="offer-title">100% Pure</div><div className="offer-desc">No adulteration guaranteed</div></div></div>
          <div className="offer-card"><span className="offer-icon">⏰</span><div><div className="offer-title">Morning Fresh</div><div className="offer-desc">Delivered by 7 AM daily</div></div></div>
          <div className="offer-card"><span className="offer-icon">💳</span><div><div className="offer-title">Easy Payment</div><div className="offer-desc">COD & UPI accepted</div></div></div>
        </div>

        {/* Categories */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">Shop by <span>Category</span></div>
            <span className="see-all" onClick={() => navigate('/products')}>See All →</span>
          </div>
          <div className="category-grid">
            {categories.map(c => (
              <div key={c.key} className="category-item" onClick={() => navigate(`/products?category=${c.key}`)}>
                <img src={c.img} alt={c.name} className="cat-img" />
                <div className="cat-name">{c.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Deal Banners */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">🔥 Today's <span>Deals</span></div>
          </div>
          <div className="deals-grid">
            <div className="deal-card deal-green" data-emoji="🥛" onClick={() => navigate('/products?category=milk')}>
              <h3>Fresh Milk</h3>
              <p>Farm fresh full cream & toned milk delivered daily</p>
              <span className="deal-tag">From ₹50/L</span>
            </div>
            <div className="deal-card deal-blue" data-emoji="🧀" onClick={() => navigate('/products?category=paneer')}>
              <h3>Soft Paneer</h3>
              <p>Homemade soft paneer — perfect for cooking</p>
              <span className="deal-tag">From ₹80/200g</span>
            </div>
            <div className="deal-card deal-orange" data-emoji="🧈" onClick={() => navigate('/products?category=ghee')}>
              <h3>Pure Cow Ghee</h3>
              <p>Traditional bilona method pure desi ghee</p>
              <span className="deal-tag">From ₹550/500ml</span>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="section">
          <div className="section-header">
            <div className="section-title">Why Choose <span>Milqon Dairy?</span></div>
          </div>
          <div className="feature-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className="icon">{f.icon}</div>
                <strong>{f.title}</strong>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="section">
          <div className="subscription-banner">
            <img src="/subscription.jpeg" alt="Daily Milk Subscription" className="subscription-img" />
            <div className="subscription-overlay">
              <h2>Start Your Daily Milk Subscription</h2>
              <p>Never run out of fresh milk. Subscribe and get it delivered every morning.</p>
              <button className="btn-hero btn-hero-primary" onClick={() => navigate('/products')}>🛒 Subscribe Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
