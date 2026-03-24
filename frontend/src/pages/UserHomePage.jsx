import {
    Search, ChevronRight, Star, Clock, Flame,
    Zap, Trophy, TrendingUp, Sparkles, Gift,
    MessageCircle, ShieldCheck, Truck, Headphones,
    Smartphone, ArrowRight, MapPin, CheckCircle2,
    Store
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const UserHomePage = () => {
    const [popularItems, setPopularItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/food-items/public');
                const allItems = response.data.data || [];
                setPopularItems(allItems.slice(0, 3));
            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-[#FFF9F5] overflow-x-hidden font-body">

            {/* 1. HERO BANNER */}
            <section className="relative w-full py-8 px-0">
                <div className="max-w-7xl mx-auto">
                    <div className="relative bg-gradient-to-br from-orange-500 to-rose-600 rounded-[3.5rem] p-8 sm:p-16 text-white overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center gap-12 mx-4 sm:mx-0">
                        {/* Visual Decorations */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/20 rounded-full -ml-20 -mb-20 blur-2xl" />

                        {/* Text Content */}
                        <div className="flex-1 space-y-8 text-center lg:text-left relative z-10">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full border border-white/20 text-[10px] font-black tracking-widest uppercase"
                            >
                                <Sparkles size={14} className="text-yellow-300" /> Discover Campus Flavors
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-5xl sm:text-7xl font-black font-display leading-[1.1] tracking-tight"
                            >
                                The Canteen,<br />
                                <span className="text-yellow-300 italic underline decoration-white/20 underline-offset-8">Simplified.</span>
                            </motion.h1>
                            <p className="text-lg opacity-90 max-w-xl font-medium leading-relaxed">
                                Browse menus from all campus canteens, place your order in seconds, and track it in real-time. Fast, fresh, and zero queue.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 mx-auto lg:mx-0">
                                <button
                                    onClick={() => window.location.href = '/menu'}
                                    className="w-full sm:w-auto px-10 py-5 bg-white text-orange-600 rounded-[1.5rem] font-black text-sm hover:bg-yellow-100 transition-all shadow-2xl flex items-center justify-center gap-2"
                                >
                                    <TrendingUp size={18} /> EXPLORE MENU
                                </button>
                                <button
                                    onClick={() => window.location.href = '#'}
                                    className="w-full sm:w-auto px-10 py-5 bg-gray-900/40 backdrop-blur-md text-white border border-white/20 rounded-[1.5rem] font-black text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <TrendingUp size={18} /> CREATE ACCOUNT
                                </button>
                            </div>
                        </div>

                        {/* Hero Right Image */}
                        <div className="hidden lg:flex flex-1 justify-center relative">
                            <motion.div
                                initial={{ scale: 0.8, rotate: -5 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="relative w-[450px] h-[350px] rounded-[3rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
                            >
                                <img
                                    src="https://img.freepik.com/free-photo/delicious-burgers-studio_23-2150902148.jpg?semt=ais_hybrid&w=740&q=80"
                                    alt="Delicious Burgers"
                                    className="w-full h-full object-cover shadow-inner"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-orange-950/40 to-transparent" />
                            </motion.div>

                            {/* Floating Metrics Bubble */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute -top-6 -right-6 bg-white p-5 rounded-3xl shadow-2xl border border-gray-100 flex items-center gap-3 scale-110 z-20"
                            >
                                <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-200">
                                    🔥
                                </div>
                                <div className="min-w-[100px]">
                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none mb-1">Peak Mode</p>
                                    <p className="text-base font-black text-gray-900 leading-none">50+ LIVE</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. POPULAR ITEMS */}
            <section className="py-6 max-w-7xl mx-auto px-4 sm:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-6">
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">Popular Right Now</h3>
                        <p className="text-orange-600 font-black text-[10px] uppercase tracking-[0.2em] italic px-1">Best of Grab & Go Platform</p>
                    </div>
                    <a href="/menu" className="group px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-gray-200">
                        FULL MENU <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {loading ? [1, 2, 3].map(i => <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-[3rem]" />) : (
                        popularItems.map((item, idx) => (
                            <ItemCard key={item._id || idx} item={item} color={idx === 1 ? "bg-amber-500" : idx === 2 ? "bg-orange-400" : "bg-orange-600"} />
                        ))
                    )}
                </div>
            </section>

            {/* 3. FEEDBACKS */}
            <section className="py-8 max-w-7xl mx-auto px-4 sm:px-8">
                <div className="bg-gray-900 rounded-[4rem] text-white p-10 sm:p-20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
                    <div className="text-center space-y-4 mb-12 relative z-10">
                        <Star className="text-orange-500 mx-auto fill-orange-500" size={32} />
                        <h2 className="text-4xl font-black text-white tracking-tight">Student verified experience</h2>
                        <p className="text-gray-400 font-medium max-w-md mx-auto">See why 5,000+ students across faculties use Grab & Go as their daily food hub.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        <FeedbackBox
                            name="Amali Perera"
                            faculty="Engineering"
                            text="The order tracking is a game changer. I can finish my tutorial while my food is being prepared."
                        />
                        <FeedbackBox
                            name="Dilan Silva"
                            faculty="Computing"
                            text="Love the local canteen highlights! Getting Tech Hub lunch delivered to FOC library is so convenient."
                            active={true}
                        />
                        <FeedbackBox
                            name="Nimmi Fernando"
                            faculty="Management"
                            text="Interface is so clean and easy to use. Highly recommend for anyone with short lecture breaks."
                        />
                    </div>
                </div>
            </section>

            {/* 4. SERVICES */}
            <section className="py-6 max-w-7xl mx-auto px-4 sm:px-8">
                <div className="mb-10 text-center">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">Designed for Campus Life</h3>
                    <p className="text-orange-600 font-black text-[10px] uppercase tracking-[0.2em] italic px-1">How we simplify your student experience</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <ServiceTile
                        icon={ShieldCheck}
                        title="Hygiene First"
                        text="All canteens are health-certified and hygiene-vetted."
                    />
                    <ServiceTile
                        icon={Truck}
                        title="Instant Delivery"
                        text="Average 15-min delivery across all campus locations."
                    />
                    <ServiceTile
                        icon={Smartphone}
                        title="Easy Payments"
                        text="One-click checkout with stored campus cards."
                    />
                    <ServiceTile
                        icon={Headphones}
                        title="24/7 Support"
                        text="Our dedicated student-led support is always ready."
                    />
                </div>
            </section>
        </div>
    );
};

// HELPER COMPONENTS
const ItemCard = ({ item, color }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="bg-white rounded-[3rem] overflow-hidden shadow-xl shadow-gray-200/50 border border-transparent hover:border-orange-500/10 flex flex-col h-full group transition-all"
    >
        <div className="h-64 relative bg-orange-50/50 flex items-center justify-center text-7xl select-none group-hover:scale-105 transition-transform duration-700">
            {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
                <span className="opacity-20">{item.category?.icon || '🍕'}</span>
            )}
            <div className={`absolute top-0 right-0 ${color} text-white px-6 py-2 rounded-bl-[2rem] font-black text-[10px] tracking-widest`}>
                POPULAR
            </div>
        </div>
        <div className="p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4 gap-4">
                <div className="space-y-1">
                    <h4 className="text-xl font-black text-gray-900 leading-tight group-hover:text-orange-600 transition-colors uppercase tracking-tight">{item.name}</h4>
                    <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest flex items-center gap-1.5 line-clamp-1">
                        <Store size={14} className="shrink-0" /> {item.canteen?.name || 'Main Canteen'}
                    </p>
                </div>
                <div className="text-lg font-black text-gray-900 border-2 border-orange-500 text-orange-600 px-4 py-1.5 rounded-2xl shadow-sm whitespace-nowrap">
                    Rs.{item.price}
                </div>
            </div>
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                <div className="flex items-center gap-1.5 font-black text-yellow-600 text-sm">
                    <Star size={18} fill="currentColor" /> 4.9
                </div>
                <button onClick={() => window.location.href = '/menu'} className="p-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200">
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    </motion.div>
);

const FeedbackBox = ({ name, faculty, text, active }) => (
    <div className={`p-10 rounded-[3rem] border transition-all hover:-translate-y-2 flex flex-col justify-between h-full ${active ? 'bg-orange-600 border-orange-600 shadow-2xl shadow-orange-900/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
        <p className="text-lg font-medium leading-relaxed italic mb-10 max-w-[280px]">"{text}"</p>
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${active ? 'bg-white text-orange-600 shadow-xl' : 'bg-white/10 text-white'}`}>
                {name.charAt(0)}
            </div>
            <div>
                <h4 className="font-black leading-none mb-1 uppercase tracking-tight">{name}</h4>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${active ? 'text-white opacity-80' : 'text-orange-500'}`}>{faculty} student</p>
            </div>
        </div>
    </div>
);

const ServiceTile = ({ icon: Icon, title, text }) => (
    <div className="group bg-orange-100/60 p-10 rounded-[3rem] border border-orange-200 shadow-lg shadow-orange-100/50 hover:shadow-orange-200/50 transition-all hover:-translate-y-2">
        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm">
            <Icon size={32} />
        </div>
        <h3 className="text-lg font-black text-gray-900 mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-500 text-sm font-medium leading-relaxed">{text}</p>
    </div>
);

export default UserHomePage;
