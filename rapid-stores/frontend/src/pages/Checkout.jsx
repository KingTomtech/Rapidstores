import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
const Checkout = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  if (cart.items.length === 0) return <div className="text-center py-12">Cart is empty</div>;
  return (
    <div className="max-w-2xl mx-auto card">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <p className="mb-4">Total: ZMW {cart.total.toFixed(2)}</p>
      <button onClick={() => navigate('/')} className="btn-primary">Place Order (Demo)</button>
    </div>
  );
};
export default Checkout;
