import { motion } from 'framer-motion';
import { Sparkles, Target, Heart, Zap, ShieldCheck, Users } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#FFF9F5] overflow-x-hidden font-body">

            {/* HERO SECTION */}
            <section className="relative w-full pt-16 pb-12 px-4 sm:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-orange-100/80 text-orange-600 font-bold tracking-widest uppercase text-xs sm:text-sm border border-orange-200/50"
                        >
                            <Sparkles size={16} /> Our Unique Story
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight"
                        >
                            Redefining <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                                Campus Dining.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-base sm:text-lg text-gray-600 font-medium max-w-2xl leading-relaxed"
                        >
                            We are on a mission to bring convenience, speed, and flavor to every student's daily life. No more waiting in long lines — just good food, fast.
                        </motion.p>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-400/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
            </section>

            {/* MISSION & VISION */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-8">
                <div className="mb-12 text-center">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">What Drives Us</h3>
                    <p className="text-orange-600 font-black text-[10px] uppercase tracking-[0.2em] italic px-1">Our Core Values</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ValueCard
                        icon={Target}
                        title="Our Mission"
                        text="To seamlessly connect students with campus canteens, ensuring warm, delicious meals are always just a tap away, maximizing convenience and saving time."
                    />
                    <ValueCard
                        icon={Heart}
                        title="Our Passion"
                        text="We believe that good food fuels great minds. We are dedicated to providing an accessible, affordable, and high-quality dining experience."
                    />
                    <ValueCard
                        icon={Zap}
                        title="Our Innovation"
                        text="Leveraging modern technology to eliminate queues and streamline orders, creating a smarter, more efficient campus lifestyle for everyone."
                    />
                </div>
            </section>

            {/* WHY CHOOSE US */}
            <section className="py-12 pb-24 max-w-7xl mx-auto px-4 sm:px-8">
                <div className="bg-gray-900 rounded-[4rem] text-white p-10 sm:p-20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
                    <div className="text-center space-y-4 mb-16 relative z-10">
                        <Users className="text-orange-500 mx-auto" size={40} />
                        <h2 className="text-4xl font-black text-white tracking-tight">Built by Students, For Students</h2>
                        <p className="text-gray-400 font-medium max-w-2xl mx-auto">
                            We understand the campus hustle. That's why we've designed a platform that fits perfectly into your busy schedule between lectures and study sessions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] hover:bg-white/10 transition-colors flex items-start gap-6">
                            <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                                <ShieldCheck size={32} className="text-white" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white mb-2">Trusted & Secure</h4>
                                <p className="text-gray-400 leading-relaxed text-sm">
                                    We partner exclusively with verified campus canteens to ensure the highest standards of food quality and hygiene.
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] hover:bg-white/10 transition-colors flex items-start gap-6">
                            <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shrink-0">
                                <Zap size={32} className="text-white" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white mb-2">Lightning Fast</h4>
                                <p className="text-gray-400 leading-relaxed text-sm">
                                    Real-time tracking and optimized routing mean your food gets to you hot and fresh, right when you want it.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const ValueCard = ({ icon: Icon, title, text }) => (
    <div className="group bg-orange-50/50 p-10 rounded-[3rem] border-2 border-orange-500 shadow-xl shadow-orange-100/50 hover:shadow-orange-200/50 transition-all hover:-translate-y-2 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-white text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-md border border-orange-100">
            <Icon size={32} />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight uppercase">{title}</h3>
        <p className="text-gray-500 text-sm font-medium leading-relaxed">{text}</p>
    </div>
);

export default AboutPage;
