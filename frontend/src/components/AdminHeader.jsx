import { User, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/logo.png';
import toast from 'react-hot-toast';

const AdminHeader = ({ className = "" }) => {
    const [logoError, setLogoError] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { admin, logout } = useAuth();
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        localStorage.removeItem('admin_sidebar_expanded');
        toast.success('Logged out successfully');
        window.location.replace('/');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`sticky top-0 w-full bg-white border-b-2 border-gray-200 px-4 py-4 z-50 shadow-md ${className}`}
        >
            <div className="w-full px-4 sm:px-8 flex justify-between items-center">

                {/* Left Section (Logo + Title) */}
                <div className="flex items-center gap-4 text-decoration-none transition-transform hover:scale-105 active:scale-95">
                    <Link to="/admin/management" className="flex items-center gap-3 no-underline">
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
                    </Link>
                </div>

                {/* Middle Section (Title) */}
                <div className="hidden lg:flex flex-1 justify-center">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400 bg-gray-50 px-6 py-2 rounded-full border border-gray-100 shadow-inner">
                        Admin Dashboard
                    </h2>
                </div>

                {/* Right Section (Auth + Profile) */}
                <div className="flex items-center gap-3 sm:gap-6">
                    <div className="relative" ref={menuRef}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-orange-600 transition-colors"
                        >
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-100">
                                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest hidden md:block max-w-[150px] truncate">
                                {admin?.name || 'Admin'}
                            </span>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                        </motion.button>

                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                                >
                                    {/* Profile Header */}
                                    <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-50">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Admin Account</p>
                                        <p className="text-sm font-black text-gray-900 truncate">{admin?.name}</p>
                                        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-0.5">{admin?.role || 'System Admin'}</p>
                                        <p className="text-xs text-gray-400 mt-1 truncate">{admin?.email || 'admin@grabgo.com'}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="py-1">
                                        <motion.button
                                            onClick={handleLogout}
                                            whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
                                            className="w-full px-5 py-3.5 text-left text-sm font-black text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 uppercase tracking-widest group"
                                        >
                                            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            Logout
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default AdminHeader;
