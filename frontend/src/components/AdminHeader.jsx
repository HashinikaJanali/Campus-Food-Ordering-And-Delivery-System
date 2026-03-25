import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import logoImage from '../assets/logo.png';

const AdminHeader = ({ className = "" }) => {
    const [logoError, setLogoError] = useState(false);
    const location = useLocation();

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`sticky top-0 w-full bg-white border-b-2 border-gray-200 px-4 py-4 z-50 shadow-md ${className}`}
        >
            <div className="w-full px-4 sm:px-8 flex justify-between items-center">

                {/* Left Section (Logo + Title) */}
                <div className="flex items-center gap-4 text-decoration-none transition-transform hover:scale-105 active:scale-95">
                    <a href="/admin/management" className="flex items-center gap-3 no-underline">
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

                {/* Center Section (Admin Navigation) */}
                <div className="hidden lg:flex flex-1 items-center justify-center px-12 gap-10">
                    <AdminNavLink href="/admin/management" label="Dashboard" active={location.pathname === '/admin/management'} />
                    <AdminNavLink href="/admin/dashboard" label="Inventory" active={location.pathname.startsWith('/admin') && location.pathname !== '/admin/management' && location.pathname !== '/admin/login'} />
                    <AdminNavLink href="/orders" label="Orders" active={location.pathname === '/orders'} />
                </div>

                {/* Right Section (Auth + Profile) */}
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Admin Auth Buttons */}
                    <div className="hidden sm:flex items-center gap-3 mr-2">
                        <Link
                            to="/admin/login?mode=login"
                            className="text-xs font-black text-gray-400 hover:text-orange-600 px-4 py-2 transition-colors uppercase tracking-widest"
                        >
                            Log In
                        </Link>
                        <Link
                            to="/admin/login?mode=register"
                            className="text-xs font-black bg-orange-600 text-white px-6 py-2.5 rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 uppercase tracking-widest"
                        >
                            Sign Up
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <motion.a
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            href="#" className="p-2.5 text-gray-500 hover:text-orange-600 bg-gray-50 rounded-xl transition-all"
                        >
                            <User className="w-6 h-6" />
                        </motion.a>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

// Admin Nav Link Helper
const AdminNavLink = ({ href, label, active }) => (
    <Link
        to={href}
        className={`text-xs font-black tracking-widest uppercase transition-all relative group ${active ? 'text-orange-600' : 'text-gray-400 hover:text-orange-600'}`}
    >
        {label}
        {active && (
            <motion.div layoutId="headerTab" className="absolute -bottom-1 lg:-bottom-2 left-0 w-full h-1 bg-orange-500 rounded-full shadow-sm" />
        )}
    </Link>
);

export default AdminHeader;
