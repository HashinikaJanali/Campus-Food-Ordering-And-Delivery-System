import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Sparkles, Eye, EyeOff } from "lucide-react";
import { useUserAuth } from "../context/UserAuthContext";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: loginStudent, logout: logoutStudent } = useUserAuth();
  const { login: loginAdmin, logout: logoutAdmin } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors
    
    try {
      // Validate fields first
      if (!form.username.trim() || !form.password.trim()) {
        setError("Please enter both email and password.");
        setLoading(false);
        return;
      }

      // Clear existing sessions before processing a new login.
      logoutAdmin(false);
      logoutStudent(false);

      if (role === "student") {
        await loginStudent(form.username, form.password);
        localStorage.removeItem('login_redirect_path');
        localStorage.removeItem('login_redirect');
      } else {
        await loginAdmin(form.username, form.password);
      }

      navigate('/home');
      setLoading(false);
    } catch (err) {
      // Show error message - DO NOT NAVIGATE
      setError(err.message || "Invalid email or password.");
      setLoading(false);
      return;
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
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Login as</label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${role === "student" ? "bg-white text-primary shadow" : "text-gray-500"}`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${role === "admin" ? "bg-white text-primary shadow" : "text-gray-500"}`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole("staff")}
                  className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${role === "staff" ? "bg-white text-primary shadow" : "text-gray-500"}`}
                >
                  Staff
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">{role === "student" ? "Your email" : "Admin email"}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" name="username" value={form.username} onChange={handleChange}
                  placeholder={role === "student" ? "Your email" : "Enter admin email"} required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">{role === "student" ? "Password" : "Admin password"}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                  placeholder={role === "student" ? "Your password" : "Admin password"} required
                  className="w-full pl-11 pr-20 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-primary hover:border-orange-200 text-[11px] font-black uppercase tracking-wider transition-all"
                >
                  {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                  {showPassword ? "Hide" : "Show"}
                </button>
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

          {role === "student" && (
            <p className="text-center text-sm text-gray-500 font-medium mt-6">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-primary font-black hover:underline">Create one</Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;