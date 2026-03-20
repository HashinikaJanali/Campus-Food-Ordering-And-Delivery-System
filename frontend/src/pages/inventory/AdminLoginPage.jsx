import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChefHat, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created!');
      }
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 -left-20 w-64 h-64 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full"></div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <ChefHat size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-xl">Campus Bites</h1>
              <p className="text-primary-200 text-sm">Food & Inventory Management</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-display font-bold text-white text-4xl leading-tight">
              Manage Your<br />Campus Menu<br />
              <span className="text-primary-200">Effortlessly</span>
            </h2>
            <p className="text-primary-100 text-lg leading-relaxed max-w-sm">
              Real-time inventory tracking, smart stock alerts, and seamless menu management — all in one place.
            </p>
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-4">
          {[
            { label: 'Real-time Tracking', icon: '📊' },
            { label: 'Smart Alerts', icon: '🔔' },
            { label: 'Image Uploads', icon: '📸' },
            { label: 'Menu Control', icon: '📋' },
          ].map(item => (
            <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-white font-display font-medium text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-orange">
              <ChefHat size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-gray-900">Campus Bites</h1>
              <p className="text-xs text-gray-400">Food & Inventory Management</p>
            </div>
          </div>

          <div className="animate-fade-in">
            <h2 className="font-display font-bold text-gray-900 text-3xl mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-gray-500 mb-8">
              {mode === 'login' ? 'Sign in to your admin panel' : 'Set up your admin account'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-display">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    className="input-field"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-display">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="admin@campus.edu"
                    className="input-field pl-10"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 font-display">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2 py-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-primary-600 font-semibold hover:underline font-display"
              >
                {mode === 'login' ? 'Register here' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
