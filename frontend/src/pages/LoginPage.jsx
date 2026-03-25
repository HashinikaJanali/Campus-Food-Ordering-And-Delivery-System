import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Sparkles } from "lucide-react";
import { useUserAuth } from "../context/UserAuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useUserAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F5] font-body flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[3rem] shadow-xl shadow-orange-100/60 border border-orange-100 p-10"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
              <Sparkles size={13} /> Welcome Back
            </div>
            <h1 className="font-display text-3xl font-bold text-gray-900 tracking-tight leading-tight">
              Sign in to<br />
              <span className="text-primary italic">Grab &amp; Go</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-2">Your campus food, one tap away</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-2xl px-4 py-3 mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@university.edu" required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password" name="password" value={form.password} onChange={handleChange}
                  placeholder="Your password" required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-500 disabled:opacity-60 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all mt-2"
            >
              {loading ? "Signing in..." : <><LogIn size={16} /> Sign in</>}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500 font-medium mt-6">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-primary font-black hover:underline">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;