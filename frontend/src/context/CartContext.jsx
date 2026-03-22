import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = async (product) => {
        try {
            const response = await api.post(`/inventory/${product._id}/reserve`, { quantity: 1 });
            if (response.data.success) {
                setCart(prevCart => {
                    const existingItem = prevCart.find(item => item._id === product._id);
                    if (existingItem) {
                        return prevCart.map(item =>
                            item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                        );
                    }
                    return [...prevCart, { ...product, quantity: 1 }];
                });
                toast.success(`Added ${product.name} to cart!`);
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
            return false;
        }
    };

    const removeFromCart = async (productId, name) => {
        try {
            const item = cart.find(i => i._id === productId);
            if (!item) return;

            await api.post(`/inventory/${productId}/release`, { quantity: item.quantity });
            setCart(prevCart => prevCart.filter(item => item._id !== productId));
            toast.success(`Removed ${name} from cart and released stock.`);
        } catch (error) {
            toast.error('Failed to update inventory while removing item');
        }
    };

    const clearCart = async () => {
        // Release all stock in cart before clearing
        for (const item of cart) {
            try {
                await api.post(`/inventory/${item._id}/release`, { quantity: item.quantity });
            } catch (error) {
                console.error(`Failed to release stock for ${item.name}`);
            }
        }
        setCart([]);
        toast.success('Cart cleared and stock released.');
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
