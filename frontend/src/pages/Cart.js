import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, updateQty, total } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) return (
    <div className="empty-state">
      <div className="icon">🛒</div>
      <p style={{ fontSize: 18, marginBottom: 16 }}>Your cart is empty</p>
      <button className="btn btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div className="section-title">Your Cart</div>
      {cart.map(item => (
        <div key={item._id} className="cart-item">
          <div>
            <strong>{item.name}</strong>
            <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
              ₹{item.price} × {item.qty} = ₹{item.price * item.qty}
            </div>
          </div>
          <div className="qty-controls">
            <button className="qty-btn" onClick={() => updateQty(item._id, item.qty - 1)}>−</button>
            <span style={{ fontWeight: 'bold', minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
            <button className="qty-btn" onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
            <button className="qty-btn remove" onClick={() => removeFromCart(item._id)}>✕</button>
          </div>
        </div>
      ))}
      <div className="cart-footer">
        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Total: ₹{total}</div>
        <button className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 16 }} onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
