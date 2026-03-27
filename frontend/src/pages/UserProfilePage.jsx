import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Lock, ShieldCheck, GraduationCap,
  Pencil, Check, X, KeyRound, Sparkles, Eye, EyeOff
} from "lucide-react";
import { useUserAuth } from "../context/UserAuthContext";
import UserSidebar from '../components/UserSidebar';
import api from "../utils/api";

const Field = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
      <Icon size={16} className="text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

const InputField = ({ label, name, type = "text", value, onChange, icon: Icon, placeholder, extra }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={isPassword && show ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none transition-all"
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {extra && <p className="text-[10px] text-gray-400 font-medium mt-1 px-1">{extra}</p>}
    </div>
  );
};

const UserProfilePage = () => {
  const { user, updateProfile } = useUserAuth();

  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    setProfileError("");
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileError("Name and email are required.");
      return;
    }
    setProfileLoading(true);
    try {
      await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
      });
      setEditMode(false);
      showToast("Profile updated successfully.");
    } catch (err) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileCancel = () => {
    setProfileForm({ name: user?.name || "", email: user?.email || "" });
    setProfileError("");
    setEditMode(false);
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordError("");
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put('/users/profile', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password changed successfully.");
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FFF9F5] font-body py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-8">
          <UserSidebar />

          <main className="flex-1 lg:pl-[304px]">
            <div className="max-w-4xl mr-auto space-y-6">

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-6 right-6 z-50 px-6 py-3.5 rounded-2xl shadow-xl font-black text-sm text-white
                ${toast.type === "error" ? "bg-danger" : "bg-success"}`}
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-orange-500 to-rose-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 border-2 border-white/30 rounded-[1.5rem] flex items-center justify-center font-black text-3xl text-white flex-shrink-0 backdrop-blur-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 border border-white/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-2">
                <Sparkles size={11} /> My Account
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">{user.name}</h1>
              <p className="opacity-80 text-sm font-medium mt-0.5">{user.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Info / Edit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[3rem] shadow-xl shadow-orange-100/40 border border-orange-50 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">Profile Information</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Your personal account details</p>
            </div>
            {!editMode && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-primary border border-orange-200 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
              >
                <Pencil size={13} /> Edit
              </motion.button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!editMode ? (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Field label="Full name" value={user.name} icon={User} />
                <Field label="Email address" value={user.email} icon={Mail} />
                <div className="flex items-center gap-4 py-4">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                    {user.role === "admin"
                      ? <ShieldCheck size={16} className="text-primary" />
                      : <GraduationCap size={16} className="text-primary" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account type</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest
                      ${user.role === "admin"
                        ? "bg-orange-100 text-primary border border-orange-200"
                        : "bg-blue-50 text-blue-600 border border-blue-200"}`}>
                      {user.role === "admin" ? <ShieldCheck size={11} /> : <GraduationCap size={11} />}
                      {user.role}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.form key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleProfileSave} className="space-y-4">
                <InputField label="Full name" name="name" value={profileForm.name}
                  onChange={handleProfileChange} icon={User} placeholder="Your full name" />
                <InputField label="Email address" name="email" type="email" value={profileForm.email}
                  onChange={handleProfileChange} icon={Mail} placeholder="you@university.edu" />

                {profileError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-2xl px-4 py-3">
                    {profileError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={handleProfileCancel}
                    className="flex items-center gap-2 px-5 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-black text-sm rounded-2xl transition-all">
                    <X size={14} /> Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={profileLoading}
                    className="flex-1 py-3 bg-primary hover:bg-primary-500 disabled:opacity-60 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all"
                  >
                    {profileLoading ? "Saving..." : <><Check size={14} /> Save changes</>}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[3rem] shadow-xl shadow-orange-100/40 border border-orange-50 p-8"
        >
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-gray-900">Change Password</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Keep your account secure</p>
          </div>

          <form onSubmit={handlePasswordSave} className="space-y-4">
            <InputField label="Current password" name="currentPassword" type="password"
              value={passwordForm.currentPassword} onChange={handlePasswordChange}
              icon={Lock} placeholder="Your current password" />
            <InputField label="New password" name="newPassword" type="password"
              value={passwordForm.newPassword} onChange={handlePasswordChange}
              icon={KeyRound} placeholder="Min. 6 characters" extra="Must be at least 6 characters" />
            <InputField label="Confirm new password" name="confirmPassword" type="password"
              value={passwordForm.confirmPassword} onChange={handlePasswordChange}
              icon={KeyRound} placeholder="Re-enter new password" />

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-2xl px-4 py-3">
                {passwordError}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={passwordLoading}
              className="w-full py-4 bg-primary hover:bg-primary-500 disabled:opacity-60 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all mt-2"
            >
              {passwordLoading ? "Updating..." : <><KeyRound size={15} /> Update password</>}
            </motion.button>
          </form>
        </motion.div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;