import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User, Sparkles, Shield } from "lucide-react";
import { useUserAuth } from "../context/UserAuthContext";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const navigate = useNavigate();
  const { register: registerStudent } = useUserAuth();
  const { register: registerAdmin, logout: logoutAdmin } = useAuth();

  const [role, setRole] = useState("student"); // "student" or "admin"
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (role === "admin") {
        await registerAdmin(form.name, form.email, form.password, "admin");
        // Requirement: signup should always go to login, not auto-enter admin panel.
        logoutAdmin();
      } else {
        await registerStudent(form.name, form.email, form.password);
        // Requirement: signup should always go to login, not stay authenticated.
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
      }

      navigate(`/login?role=${role}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Signup failed. Please try again.");
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
              <Sparkles size={13} /> New Account
            </div>
            <h1 className="font-display text-3xl font-bold text-gray-900 tracking-tight leading-tight">
              Join Grab &amp; Go
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-2">Create your campus food account</p>
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

          {/* Role Selection Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => { setRole("student"); setError(""); }}
              className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                role === "student"
                  ? "bg-primary text-white shadow-lg shadow-orange-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <UserPlus size={16} /> Student
            </button>
            <button
              type="button"
              onClick={() => { setRole("admin"); setError(""); }}
              className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                role === "admin"
                  ? "bg-primary text-white shadow-lg shadow-orange-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Shield size={16} /> Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Your full name" required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                />
              </div>
            </div>

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
                  placeholder="Min. 6 characters" required minLength={6}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                  placeholder="Re-enter your password" required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-500 disabled:opacity-60 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all mt-2"
            >
              {loading ? "Creating account..." : role === "admin" ? <><Shield size={16} /> Create admin account</> : <><UserPlus size={16} /> Create account</>}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500 font-medium mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-black hover:underline">Sign in</Link>
          </p>

          {role === "student" && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-2">Are you an admin?</p>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className="text-primary font-black text-sm hover:underline"
              >
                Switch to admin signup →
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;