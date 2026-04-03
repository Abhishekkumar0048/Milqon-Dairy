import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const features = [
  { icon: '🌿', title: 'Farm Fresh',    desc: 'Direct from our farm to your home',      bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', shadow: 'rgba(46,125,50,0.25)'  },
  { icon: '🚚', title: 'Free Delivery', desc: 'Free on orders above ₹299',              bg: 'linear-gradient(135deg,#e3f2fd,#bbdefb)', shadow: 'rgba(21,101,192,0.25)' },
  { icon: '💰', title: 'Best Price',    desc: 'No middlemen, fair prices',              bg: 'linear-gradient(135deg,#fff8e1,#ffecb3)', shadow: 'rgba(245,124,0,0.25)'  },
  { icon: '🔄', title: 'Subscription',  desc: 'Daily milk subscription available',      bg: 'linear-gradient(135deg,#f3e5f5,#e1bee7)', shadow: 'rgba(123,31,162,0.25)' },
  { icon: '✅', title: '100% Pure',     desc: 'No adulteration, certified pure',        bg: 'linear-gradient(135deg,#e8f5e9,#a5d6a7)', shadow: 'rgba(46,125,50,0.25)'  },
  { icon: '❄️', title: 'Cold Chain',    desc: 'Maintained freshness always',            bg: 'linear-gradient(135deg,#e0f7fa,#b2ebf2)', shadow: 'rgba(0,131,143,0.25)'  },
  { icon: '📱', title: 'Easy Orders',   desc: 'Order in just 2 clicks',                bg: 'linear-gradient(135deg,#fce4ec,#f8bbd0)', shadow: 'rgba(194,24,91,0.25)'  },
  { icon: '⭐', title: 'Trusted',       desc: '10,000+ happy customers',               bg: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', shadow: 'rgba(230,81,0,0.25)'   },
];

const categories = [
  { img: '/milqon-milk.jpeg', name: 'Milk',   key: 'milk'   },
  { img: '/paneer.png',       name: 'Paneer', key: 'paneer' },
  { img: '/curd.png',         name: 'Curd',   key: 'curd'   },
  { img: '/cow-ghee.png',     name: 'Ghee',   key: 'ghee'   },
  { img: '/salted-butter.png',name: 'Butter', key: 'butter' },
  { img: '/desi-makhan.png',  name: 'Makhan', key: 'makhan' },
  { img: '/lassi.png',        name: 'Lassi',  key: 'lassi'  },
  { img: '/chach.png',        name: 'Chach',  key: 'chach'  },
  { img: '/milk-peda.png',    name: 'Peda',   key: 'peda'   },
];

const SLIDES = [
  { img: '/cow.jpeg',     title: 'Pure Desi Cow Milk',   sub: 'Straight from our farm to your home' },
  { img: '/desi2.jpeg',   title: 'Desi Dairy Goodness',  sub: 'Traditional taste, modern delivery'  },
  { img: '/gir1.jpeg',    title: 'Gir Cow A2 Milk',      sub: 'Premium A2 milk for your family'     },
  { img: '/nature2.jpeg', title: 'Farm Fresh Every Day', sub: 'Delivered fresh every morning'       },
  { img: '/nature.jpeg',  title: 'Har Ghar Ka Bharosa',  sub: 'Milqon Dairy – Pure & Natural'       },
  { img: '/images3.jpeg', title: '100% Pure Dairy',      sub: 'No adulteration, certified quality'  },
  { img: '/imagecow.jpeg',title: 'Our Happy Cows',       sub: 'Healthy cows, healthy milk'          },
];

const reviews = [
  { stars: '⭐⭐⭐⭐⭐', text: '"Bahut pure ghee hai, bilkul ghar jaisa swad!"', author: '– Priya Sharma, Jaipur' },
  { stars: '⭐⭐⭐⭐⭐', text: '"Roz subah fresh milk milti hai, family bahut khush hai."', author: '– Ramesh Verma, Delhi' },
  { stars: '⭐⭐⭐⭐⭐', text: '"Paneer itna soft tha, sabzi mein maza aa gaya!"', author: '– Sunita Devi, Agra' },
  { stars: '⭐⭐⭐⭐⭐', text: '"Subscription liya, ab tension nahi. Delivery time pe aati hai."', author: '– Anil Gupta, Lucknow' },
];

const trustItems = [
  { icon: '🏆', title: '10,000+ Customers', desc: 'Trusted by families across the city', bg: 'linear-gradient(135deg,#fff8e1,#ffe082)', border: '#f9a825', iconBg: '#fff3cd' },
  { icon: '🧪', title: 'Lab Tested', desc: 'Every batch tested for purity', bg: 'linear-gradient(135deg,#e3f2fd,#90caf9)', border: '#1565c0', iconBg: '#bbdefb' },
  { icon: '🚚', title: 'On-Time Delivery', desc: 'Fresh by 7 AM every morning', bg: 'linear-gradient(135deg,#e8f5e9,#a5d6a7)', border: '#2e7d32', iconBg: '#c8e6c9' },
  { icon: '🌿', title: 'No Chemicals', desc: 'Zero preservatives, 100% natural', bg: 'linear-gradient(135deg,#fce4ec,#f48fb1)', border: '#c62828', iconBg: '#fce4ec' },
];

function ImageSlider({ onShop, onSubscribe }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);
  const prev = () => setCurrent(p => (p - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent(p => (p + 1) % SLIDES.length);
  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden', background: 'linear-gradient(135deg,#0F0F0F 0%,#1a1400 100%)' }}>
      {SLIDES.map((s, i) => (
        <div key={i} style={{ position: i === 0 ? 'relative' : 'absolute', inset: 0, width: '100%', opacity: i === current ? 1 : 0, transition: 'opacity 0.9s ease', zIndex: i === current ? 1 : 0 }}>
          <img src={s.img} alt={s.title} style={{ width: '100%', height: 'clamp(220px,55vw,600px)', objectFit: 'cover', objectPosition: 'center', display: 'block', filter: 'brightness(0.45)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.5) 60%,rgba(0,0,0,0.1) 100%)', display: 'flex', alignItems: 'center', padding: 'clamp(16px,5vw,60px)' }}>
            <div style={{ maxWidth: 560, color: '#fff' }}>
              <div style={{ fontSize: 'clamp(10px,1.5vw,13px)', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: '#D4AF37', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/logo.jpeg" alt="logo" style={{ width: 'clamp(22px,3vw,32px)', height: 'clamp(22px,3vw,32px)', borderRadius: 8, objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }} />
                <span className="slider-brand-text">MILQON DAIRY</span>
              </div>
              <h1 style={{ fontSize: 'clamp(24px,5vw,64px)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 10px', textShadow: '0 4px 16px rgba(0,0,0,0.6)', letterSpacing: '-1px' }}>{s.title}</h1>
              <p style={{ fontSize: 'clamp(13px,1.8vw,20px)', color: '#D4AF37', marginBottom: 'clamp(12px,3vw,28px)', fontWeight: 500, letterSpacing: 1 }}>Hum Shuddhta Ka Vaada Karte Hain</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={onShop} style={{ padding: 'clamp(10px,1.5vw,14px) clamp(20px,3vw,32px)', background: '#D4AF37', color: '#0F0F0F', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 'clamp(12px,1.5vw,15px)', cursor: 'pointer', boxShadow: '0 4px 20px rgba(212,175,55,0.5)', transition: 'box-shadow 0.3s' }}>🛍️ Shop Now</button>
                <button onClick={onSubscribe} style={{ padding: 'clamp(10px,1.5vw,14px) clamp(20px,3vw,32px)', background: 'transparent', color: '#fff', border: '2px solid rgba(212,175,55,0.7)', borderRadius: 10, fontWeight: 700, fontSize: 'clamp(12px,1.5vw,15px)', cursor: 'pointer' }}>📦 Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <button onClick={prev} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
      <button onClick={next} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
      <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 7, zIndex: 10 }}>
        {SLIDES.map((_, i) => <span key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, background: i === current ? '#fff' : 'rgba(255,255,255,0.45)', cursor: 'pointer', transition: 'all 0.3s' }} />)}
      </div>
    </div>
  );
}

function FeatureCard({ f }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="feature-card feature-card-colored" style={{ background: f.bg, boxShadow: `0 4px 18px ${f.shadow}`, border: 'none' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ fontSize: 42, marginBottom: 12, display: 'inline-block', transform: hovered ? 'translateY(-12px) scale(1.25)' : 'translateY(0) scale(1)', transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>{f.icon}</div>
      <strong>{f.title}</strong>
      <p style={{ color: '#555', fontSize: 13, marginTop: 6 }}>{f.desc}</p>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div>
      <ImageSlider onShop={() => navigate('/products')} onSubscribe={() => navigate('/register')} />



      <div className="container">

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
          <div className="section-header"><div className="section-title">🔥 Today's <span>Deals</span></div></div>
          <div className="deals-grid">
            <div className="deal-card deal-green" data-emoji="🥛" onClick={() => navigate('/products?category=milk')}><h3>Fresh Milk</h3><p>Farm fresh full cream & toned milk delivered daily</p><span className="deal-tag">From ₹50/L</span></div>
            <div className="deal-card deal-blue" data-emoji="🧀" onClick={() => navigate('/products?category=paneer')}><h3>Soft Paneer</h3><p>Homemade soft paneer — perfect for cooking</p><span className="deal-tag">From ₹80/200g</span></div>
            <div className="deal-card deal-orange" data-emoji="🧈" onClick={() => navigate('/products?category=ghee')}><h3>Pure Cow Ghee</h3><p>Traditional bilona method pure desi ghee</p><span className="deal-tag">From ₹550/500ml</span></div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="section">
          <div className="section-header"><div className="section-title">Why Choose <span>Milqon Dairy?</span></div></div>
          <div className="feature-grid">{features.map(f => <FeatureCard key={f.title} f={f} />)}</div>
        </div>

        {/* About */}
        <div className="section">
          <div className="about-box">
            <div className="about-left">
              <div className="about-badge">🌿 About Us</div>
              <h2 className="about-title">Who We Are</h2>
              <p className="about-desc"><b>Milqon Dairy</b> is a modern and trusted dairy brand committed to delivering <span className="about-highlight">100% pure, fresh, and natural</span> dairy products from farm to your home.</p>
              <p className="about-desc" style={{ marginTop: 10 }}>Our mission is to provide high-quality products like fresh milk, cow ghee, paneer, curd, and butter, processed under strict hygienic conditions and advanced quality standards. Every product reflects our promise of <span className="about-highlight">purity, nutrition, and authentic taste.</span></p>
              <div className="about-stats">
                <div className="about-stat"><span className="about-stat-num">10K+</span><span className="about-stat-label">Happy Customers</span></div>
                <div className="about-stat"><span className="about-stat-num">100%</span><span className="about-stat-label">Pure & Natural</span></div>
                <div className="about-stat"><span className="about-stat-num">50+</span><span className="about-stat-label">Products</span></div>
                <div className="about-stat"><span className="about-stat-num">7AM</span><span className="about-stat-label">Daily Delivery</span></div>
              </div>
            </div>
            <div className="about-right">
              {[
                { icon: '🐄', title: 'Farm to Home',   desc: 'Directly sourced from our own farms' },
                { icon: '🧪', title: 'Quality Tested', desc: 'Every batch tested for purity' },
                { icon: '❄️', title: 'Cold Chain',     desc: 'Freshness maintained end to end' },
                { icon: '🌱', title: 'No Chemicals',   desc: 'Zero preservatives, 100% natural' },
              ].map(item => (
                <div key={item.title} className="about-feature">
                  <div className="about-feature-icon">{item.icon}</div>
                  <div><div className="about-feature-title">{item.title}</div><div className="about-feature-desc">{item.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="section fade-in">
          <div className="section-header"><div className="section-title">Kyun Karein <span>Milqon Par Bharosa?</span></div></div>
          <div className="trust-grid">
            {trustItems.map(t => (
              <div key={t.title} className="trust-card" style={{ background: t.bg, border: `2px solid ${t.border}`, borderRadius: 16 }}>
                <div className="trust-icon" style={{ background: t.iconBg, borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 12px' }}>{t.icon}</div>
                <div className="trust-title" style={{ color: '#111' }}>{t.title}</div>
                <div className="trust-desc" style={{ color: '#333' }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="section fade-in">
          <div className="section-header"><div className="section-title">Hamare <span>Khush Grahak</span></div></div>
          <div className="reviews-grid">
            {reviews.map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-stars">{r.stars}</div>
                <div className="review-text">{r.text}</div>
                <div className="review-author">{r.author}</div>
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
              <button className="btn-hero btn-hero-primary" onClick={() => navigate('/my-subscription')}>🥛 Subscribe Now</button>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top */}
      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ position: 'fixed', bottom: 20, right: 20, width: 44, height: 44, borderRadius: '50%', background: '#1b5e20', color: '#fff', border: 'none', fontSize: 20, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          ↑
        </button>
      )}

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
