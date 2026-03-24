import { User, ShoppingCart, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import logoImage from '../assets/logo.png';
import { useCart } from '../context/CartContext';

const UserHeader = () => {
    const [logoError, setLogoError] = useState(false);
    const location = useLocation();
    const { cartCount } = useCart();

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 w-full bg-white border-b-2 border-gray-200 px-4 py-4 z-50 shadow-md"
        >
            <div className="w-full px-4 sm:px-8 flex justify-between items-center">

                {/* Left Section (Logo + Title) */}
                <div className="flex items-center gap-4 text-decoration-none transition-transform hover:scale-105 active:scale-95">
                    <a href="/" className="flex items-center gap-3 no-underline">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
                        >
                            {!logoError ? (
                                <img
                                    src={logoImage}
                                    alt="Grab & Go Logo"
                                    className="w-full h-full object-contain"
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <span className="text-2xl">🛍️</span>
                            )}
                        </motion.div>

                        <motion.h1
                            className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            Grab & Go
                        </motion.h1>
                    </a>
                </div>

                {/* Center Section (Navigation) */}
                <div className="hidden lg:flex flex-1 items-center justify-center px-12 gap-10">
                    <NavLink href="/" label="Home" active={location.pathname === '/' || location.pathname === '/home'} />
                    <NavLink href="/menu" label="Menu" active={location.pathname === '/menu'} />
                    <NavLink href="/track" label="Tracks" active={location.pathname === '/track'} />
                    <NavLink href="/feedback" label="Feedback" active={location.pathname === '/feedback'} />
                </div>

                {/* Right Section (Auth + Profile + Cart) */}
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Auth Buttons */}
                    <div className="hidden sm:flex items-center gap-3 mr-2">
                        <a
                            href="/login"
                            className="text-xs font-black text-gray-400 hover:text-orange-600 px-4 py-2 transition-colors uppercase tracking-widest"
                        >
                            Log In
                        </a>
                        <a
                            href="/signup"
                            className="text-xs font-black bg-orange-600 text-white px-6 py-2.5 rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 uppercase tracking-widest"
                        >
                            Sign Up
                        </a>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <motion.a
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            href="/cart" className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors bg-gray-50 rounded-xl hover:bg-orange-50"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {cartCount > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white"
                                >
                                    {cartCount > 99 ? '99+' : cartCount}
                                </motion.div>
                            )}
                        </motion.a>
                        <motion.a
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            href="#" className="p-2 text-gray-600 hover:text-orange-500 transition-colors bg-gray-50 rounded-xl hover:bg-orange-50"
                        >
                            <User className="w-6 h-6" />
                        </motion.a>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

// Helper for Nav Links
const NavLink = ({ href, label, active }) => (
    <a
        href={href}
        className={`text-xs font-black tracking-widest uppercase transition-all relative group ${active ? 'text-orange-600' : 'text-gray-400 hover:text-orange-600'}`}
    >
        {label}
        {active && (
            <motion.div layoutId="headerTab" className="absolute -bottom-1 lg:-bottom-2 left-0 w-full h-1 bg-orange-500 rounded-full shadow-sm" />
        )}
    </a>
);

export default UserHeader;
