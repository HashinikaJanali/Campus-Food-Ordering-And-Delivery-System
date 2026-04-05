import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useUserAuth } from './UserAuthContext';

const CartContext = createContext();

const EMPTY_CART = { items: [], totalAmount: 0 };

const normalizeCart = (cartData) => {
    if (!cartData) return EMPTY_CART;

    // Handle legacy/local payloads stored directly as an array.
    if (Array.isArray(cartData)) {
        const totalAmount = cartData.reduce((total, item) => total + ((item?.price || 0) * (item?.quantity || 0)), 0);
        return { items: cartData, totalAmount };
    }

    // Handle API payloads wrapped in `cart`.
    const raw = cartData.cart && typeof cartData.cart === 'object' ? cartData.cart : cartData;
    const items = Array.isArray(raw.items) ? raw.items : [];
    const totalAmount = typeof raw.totalAmount === 'number'
        ? raw.totalAmount
        : items.reduce((total, item) => total + ((item?.price || 0) * (item?.quantity || 0)), 0);

    return { ...raw, items, totalAmount };
};

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        // Initialize from localStorage for guests
        try {
            const savedCart = localStorage.getItem('guestCart');
            return savedCart ? normalizeCart(JSON.parse(savedCart)) : EMPTY_CART;
        } catch {
            return EMPTY_CART;
        }
    });
    const [loading, setLoading] = useState(false);
    const { user } = useUserAuth();

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('guestCart', JSON.stringify(cart));
    }, [cart]);

    // Load cart when user logs in
    useEffect(() => {
        const isAdminPath = window.location.pathname.startsWith('/admin');
        if (user && !isAdminPath) {
            loadCart();
        }
    }, [user]);

    const loadCart = async () => {
        try {
            const response = await api.get('/cart');
            setCart(normalizeCart(response.data));
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    const addToCart = async (product) => {
        // For authenticated users, send to backend
        if (user) {
            setLoading(true);
            try {
                const response = await api.post('/cart/add', {
                    foodItemId: product._id,
                    quantity: 1
                });
                setCart(normalizeCart(response.data));
                toast.success(`Added ${product.name} to cart!`);
                return true;
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to add to cart');
                return false;
            } finally {
                setLoading(false);
            }
        } else {
            // For guest users, store in localStorage
            setCart(prevCart => {
                const existingItem = prevCart.items?.find(item => item.foodItem?._id === product._id);
                let updatedItems;

                if (existingItem) {
                    updatedItems = prevCart.items.map(item =>
                        item.foodItem?._id === product._id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {
                    updatedItems = [...(prevCart.items || []), {
                        foodItem: { _id: product._id, ...product },
                        quantity: 1,
                        price: product.price,
                        name: product.name,
                        image: product.image,
                        canteen: product.canteen || { name: "Main Canteen" }
                    }];
                }

                const totalAmount = updatedItems.reduce((total, item) =>
                    total + (item.price * item.quantity), 0
                );

                return { items: updatedItems, totalAmount };
            });

            toast.success(`Added ${product.name} to cart!`);
            return true;
        }
    };

    const updateQuantity = (foodItemId, newQuantity) => {
        if (user) {
            // For authenticated users, update on backend
            (async () => {
                try {
                    const response = await api.put('/cart/update', {
                        foodItemId,
                        quantity: newQuantity
                    });
                    setCart(normalizeCart(response.data));
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to update quantity');
                }
            })();
        } else {
            // For guest users, update in localStorage
            if (newQuantity <= 0) {
                removeFromCart(foodItemId);
                return;
            }

            setCart(prevCart => {
                const updatedItems = prevCart.items.map(item =>
                    item.foodItem?._id === foodItemId
                        ? { ...item, quantity: newQuantity }
                        : item
                );

                const totalAmount = updatedItems.reduce((total, item) =>
                    total + (item.price * item.quantity), 0
                );

                return { items: updatedItems, totalAmount };
            });
        }
    };

    const removeFromCart = (foodItemId) => {
        if (user) {
            // For authenticated users, remove from backend
            (async () => {
                try {
                    const response = await api.delete(`/cart/remove/${foodItemId}`);
                    setCart(normalizeCart(response.data));
                    toast.success('Item removed from cart');
                } catch (error) {
                    toast.error('Failed to remove item from cart');
                }
            })();
        } else {
            // For guest users, remove from localStorage
            setCart(prevCart => {
                const updatedItems = prevCart.items.filter(item =>
                    item.foodItem?._id !== foodItemId
                );

                const totalAmount = updatedItems.reduce((total, item) =>
                    total + (item.price * item.quantity), 0
                );

                return { items: updatedItems, totalAmount };
            });

            toast.success('Item removed from cart');
        }
    };

    const clearCart = async (options = {}) => {
        if (user) {
            // For authenticated users, clear on backend
            try {
                const queryParams = options.preserveStock ? '?preserveStock=true' : '';
                await api.delete(`/cart/clear${queryParams}`);
                setCart(EMPTY_CART);
                toast.success('Cart cleared');
            } catch (error) {
                toast.error('Failed to clear cart');
            }
        } else {
            // For guest users, clear localStorage
            setCart(EMPTY_CART);
            toast.success('Cart cleared');
        }
    };

    const cartCount = cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    const cartTotal = cart.totalAmount || 0;

    return (
        <CartContext.Provider value={{
            cart: cart.items || [],
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal,
            loading
        }}>
            {children}
        </CartContext.Provider>
    );
};