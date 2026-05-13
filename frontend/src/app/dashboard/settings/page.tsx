"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, User, Bell, Shield, Key, Mail, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "api", label: "API Keys", icon: Key },
];

export default function SettingsPage() {
  const { user, token, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setTitle(user.target_role || "");
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user]);
  
  // Notification preferences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [aiAlerts, setAiAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  
  // Privacy
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          target_role: title,
          avatar_url: avatarUrl
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch(e) {}
    setIsSaving(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="text-primary w-8 h-8" />
          Settings
        </h1>
        <p className="text-secondary-foreground mt-1">
          Manage your account, preferences, and integrations.
        </p>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {saved && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-2xl"
          >
            <Check className="w-5 h-5" /> Changes saved successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Tab Navigation */}
        <div className="space-y-2">
          {TABS.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id ? 'bg-white/10 text-white shadow-lg' : 'text-secondary-foreground hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-3 space-y-6"
        >
          {/* ─── PROFILE TAB ─── */}
          {activeTab === "profile" && (
            <div className="glass-panel p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-6">Profile Information</h3>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent p-1 cursor-pointer hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-black rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (firstName?.[0] || "") + (lastName?.[0] || "")
                    )}
                  </div>
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Enter Avatar Image URL..."
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors mb-2"
                  />
                  <p className="text-xs text-secondary-foreground">JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary-foreground">First Name</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary-foreground">Last Name</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-foreground" />
                    <input type="email" value={user?.email || ""} disabled className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-secondary-foreground cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary-foreground">Current Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={handleSaveProfile} disabled={isSaving} className="px-6 py-3 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold transition-colors flex items-center gap-2">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : null} Save Changes
                </button>
              </div>
            </div>
          )}

          {/* ─── NOTIFICATIONS TAB ─── */}
          {activeTab === "notifications" && (
            <div className="glass-panel p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-bold mb-2">Notification Preferences</h3>
              <p className="text-secondary-foreground text-sm mb-6">Choose how you want to be notified about updates and AI recommendations.</p>
              
              {[
                { label: "Email Notifications", desc: "Receive updates via email", state: emailNotifs, setter: setEmailNotifs },
                { label: "Push Notifications", desc: "Browser push notifications", state: pushNotifs, setter: setPushNotifs },
                { label: "AI Recommendation Alerts", desc: "Get notified about new AI insights", state: aiAlerts, setter: setAiAlerts },
                { label: "Weekly Digest", desc: "Summary of your weekly progress", state: weeklyDigest, setter: setWeeklyDigest },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-xs text-secondary-foreground">{item.desc}</p>
                  </div>
                  <button onClick={() => item.setter(!item.state)} className={`w-12 h-7 rounded-full transition-colors relative ${item.state ? 'bg-primary' : 'bg-white/20'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${item.state ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              ))}
              
              <div className="flex justify-end">
                <button onClick={handleSave} className="px-6 py-3 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold transition-colors">Save Preferences</button>
              </div>
            </div>
          )}

          {/* ─── PRIVACY TAB ─── */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div className="glass-panel p-8 rounded-2xl space-y-6">
                <h3 className="text-xl font-bold">Change Password</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary-foreground">Current Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-primary transition-colors" placeholder="••••••••" />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-foreground hover:text-white">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary-foreground">New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="••••••••" />
                  </div>
                  <button onClick={handleSave} className="px-6 py-3 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold transition-colors">Update Password</button>
                </div>
              </div>
              <div className="glass-panel p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h3>
                <p className="text-secondary-foreground text-sm mb-4">Once you delete your account, there is no going back.</p>
                <button className="px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-bold transition-colors border border-red-500/20">Delete Account</button>
              </div>
            </div>
          )}

          {/* ─── API KEYS TAB ─── */}
          {activeTab === "api" && (
            <div className="glass-panel p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-bold">API Keys</h3>
              <p className="text-secondary-foreground text-sm">Manage your API keys for external integrations.</p>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                <div>
                  <p className="font-medium text-white font-mono text-sm">sk-mentor-••••••••7f3d</p>
                  <p className="text-xs text-secondary-foreground mt-1">Created May 1, 2026 • Last used 2h ago</p>
                </div>
                <button className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors">Revoke</button>
              </div>
              
              <button className="px-6 py-3 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold transition-colors">Generate New Key</button>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
