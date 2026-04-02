import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Sparkles, GraduationCap, ShieldCheck, Briefcase } from "lucide-react";
import { useUserAuth } from "../context/UserAuthContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: studentLogin } = useUserAuth();
  const { login: adminLogin } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(searchParams.get('role') || "student");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (!form.email.trim() || !form.password.trim()) {
        setError("Please enter both email and password.");
        setLoading(false);
        return;
      }

      if (role === "admin") {
        await adminLogin(form.email, form.password);
        navigate('/admin/management');
      } else if (role === "staff") {
        const res = await api.post('/users/login', { email: form.email, password: form.password });
        const userData = res.data.data;

        if (userData.role !== 'staff') {
          setError("Invalid credentials for staff account.");
          setLoading(false);
          return;
        }

        localStorage.setItem('user_token', userData.token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        navigate('/delivery-staff');
      } else {
        const userData = await studentLogin(form.email, form.password);

        if (userData.role && userData.role !== 'student') {
          setError("Invalid credentials for student account.");
          setLoading(false);
          return;
        }

        const redirectPath = localStorage.getItem('login_redirect_path') || localStorage.getItem('login_redirect');
        localStorage.removeItem('login_redirect_path');
        localStorage.removeItem('login_redirect');

        if (redirectPath) {
          navigate(redirectPath);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.message || "Invalid email or password.");
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

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            {[
              { id: "student", label: "Student", icon: GraduationCap, color: "blue" },
              { id: "admin", label: "Admin", icon: ShieldCheck, color: "orange" },
              { id: "staff", label: "Staff", icon: Briefcase, color: "green" }
            ].map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <motion.button
                  key={r.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setRole(r.id);
                    setError("");
                  }}
                  type="button"
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border-2 ${
                    isSelected
                      ? `border-${r.color}-400 bg-${r.color}-50`
                      : `border-gray-200 bg-gray-50 hover:border-gray-300`
                  }`}
                >
                  <Icon size={20} className={isSelected ? `text-${r.color}-600` : "text-gray-400"} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    isSelected ? `text-${r.color}-600` : "text-gray-500"
                  }`}>
                    {r.label}
                  </span>
                </motion.button>
              );
            })}
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