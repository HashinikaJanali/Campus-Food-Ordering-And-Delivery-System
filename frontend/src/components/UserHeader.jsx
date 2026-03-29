import { User, ShoppingCart, Search, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo.png';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';

const UserHeader = () => {
    const [logoError, setLogoError] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const { user, logout, isAuthenticated } = useUserAuth();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                    <NavLink href="/about" label="About" active={location.pathname === '/about'} />
                    <NavLink href="/feedback" label="Feedback" active={location.pathname === '/feedback'} />
                </div>

                {/* Right Section (Cart + Auth + Profile) */}
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Cart Icon (Always Visible) */}
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

                    {/* Auth Buttons */}
                    {!isAuthenticated ? (
                        <div className="hidden sm:flex items-center gap-3">
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
                    ) : (
                        <div className="hidden sm:flex items-center gap-4 relative" ref={profileRef}>
                            {/* Profile Button */}
                            <motion.button
                                onClick={() => setProfileOpen(!profileOpen)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-orange-600 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest hidden md:block max-w-[100px] truncate">
                                    {user?.name}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                            </motion.button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {profileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                                    >
                                        {/* Profile Header */}
                                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-50">
                                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Account</p>
                                            <p className="text-sm font-bold text-gray-900 mt-1">{user?.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                                        </div>

                                        {/* View Profile Button */}
                                        <motion.a
                                            href="/profile"
                                            onClick={() => setProfileOpen(false)}
                                            whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.05)' }}
                                            className="w-full px-4 py-3 text-left text-sm font-black text-primary hover:bg-orange-50 transition-colors flex items-center gap-2 uppercase tracking-widest"
                                        >
                                            <User className="w-4 h-4" />
                                            View Profile
                                        </motion.a>

                                        {/* Logout Button */}
                                        <motion.button
                                            onClick={() => {
                                                logout();
                                                setProfileOpen(false);
                                                navigate('/');
                                            }}
                                            whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
                                            className="w-full px-4 py-3 text-left text-sm font-black text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 uppercase tracking-widest"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
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
