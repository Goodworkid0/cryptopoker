'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield,
  Palette,
  Volume2,
  Globe,
  Eye,
  EyeOff,
  Camera,
  Save,
  ChevronRight,
  LogOut,
  Trash2,
  Smartphone,
  Key
} from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { useAuthStore } from '@/lib/store';
import { clsx } from 'clsx';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'preferences';

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    tournamentReminders: true,
    promotionalEmails: false,
    gameInvites: true,
    chatMessages: true,
    soundEffects: true,
    desktopNotifications: false,
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'en',
    tableColor: 'green',
    cardBack: 'classic',
    autoMuck: true,
    showHandHistory: true,
    fourColorDeck: false,
    runItTwice: true,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-poker flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsSaving(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-gradient-poker flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-display font-bold mb-2">
              <span className="text-gradient">Settings</span>
            </h1>
            <p className="text-text-secondary">
              Manage your account settings and preferences
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-64 flex-shrink-0"
            >
              <div className="card p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all',
                      activeTab === tab.id
                        ? 'bg-accent-primary text-background-primary'
                        : 'text-text-secondary hover:bg-background-hover'
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={logout}
                className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </motion.div>

            {/* Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="card">
                    <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                    
                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border-primary">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-accent flex items-center justify-center">
                          {profileForm.avatar ? (
                            <img src={profileForm.avatar} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
                          ) : (
                            <User className="w-12 h-12 text-background-primary" />
                          )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center hover:bg-accent-secondary transition-colors">
                          <Camera className="w-4 h-4 text-background-primary" />
                        </button>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Profile Photo</p>
                        <p className="text-text-muted text-sm mb-3">JPG, PNG or GIF. Max 2MB.</p>
                        <div className="flex gap-2">
                          <button className="btn-secondary btn-sm">Upload</button>
                          <button className="btn-secondary btn-sm text-red-400 hover:bg-red-500/10">Remove</button>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Username</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                          <input
                            type="text"
                            value={profileForm.username}
                            onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                            className="input pl-12"
                            placeholder="Your username"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="input pl-12"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border-primary flex justify-end">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="btn-primary flex items-center gap-2"
                      >
                        {isSaving ? (
                          <div className="w-5 h-5 border-2 border-background-primary/30 border-t-background-primary rounded-full animate-spin" />
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="card border-red-500/30">
                    <h2 className="text-xl font-bold mb-4 text-red-400">Danger Zone</h2>
                    <p className="text-text-secondary mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="btn-secondary text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="card">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-accent-primary" />
                      Change Password
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="input pl-12 pr-12"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="input pl-12 pr-12"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="input pl-12"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border-primary flex justify-end">
                      <button
                        onClick={handleChangePassword}
                        disabled={isSaving || !passwordForm.currentPassword || !passwordForm.newPassword}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Key className="w-5 h-5" />
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent-gold/20 flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-accent-gold" />
                        </div>
                        <div>
                          <h3 className="font-bold">Two-Factor Authentication</h3>
                          <p className="text-text-muted text-sm">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      <button className="btn-secondary">Enable 2FA</button>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="card">
                    <h2 className="text-xl font-bold mb-6">Active Sessions</h2>
                    <div className="space-y-3">
                      {[
                        { device: 'Chrome on Windows', location: 'Belgrade, Serbia', current: true },
                        { device: 'Safari on iPhone', location: 'Belgrade, Serbia', current: false },
                      ].map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-background-tertiary rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-background-hover flex items-center justify-center">
                              <Globe className="w-5 h-5 text-text-muted" />
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {session.device}
                                {session.current && (
                                  <span className="text-xs bg-accent-primary/10 text-accent-primary px-2 py-0.5 rounded">
                                    Current
                                  </span>
                                )}
                              </p>
                              <p className="text-text-muted text-sm">{session.location}</p>
                            </div>
                          </div>
                          {!session.current && (
                            <button className="text-red-400 text-sm hover:underline">Revoke</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="card">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-accent-primary" />
                    Notification Preferences
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-4">Email Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive important updates via email' },
                          { key: 'tournamentReminders', label: 'Tournament Reminders', description: 'Get notified before tournaments start' },
                          { key: 'promotionalEmails', label: 'Promotional Emails', description: 'Receive offers and promotions' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-background-tertiary rounded-xl">
                            <div>
                              <p className="font-medium">{item.label}</p>
                              <p className="text-text-muted text-sm">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications[item.key as keyof typeof notifications]}
                                onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-background-hover rounded-full peer peer-checked:bg-accent-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-4">In-Game Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'gameInvites', label: 'Game Invites', description: 'Get notified when friends invite you' },
                          { key: 'chatMessages', label: 'Chat Messages', description: 'Notifications for new messages' },
                          { key: 'soundEffects', label: 'Sound Effects', description: 'Play sounds for game actions' },
                          { key: 'desktopNotifications', label: 'Desktop Notifications', description: 'Show browser notifications' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-background-tertiary rounded-xl">
                            <div>
                              <p className="font-medium">{item.label}</p>
                              <p className="text-text-muted text-sm">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications[item.key as keyof typeof notifications]}
                                onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-background-hover rounded-full peer peer-checked:bg-accent-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  {/* Display Settings */}
                  <div className="card">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-accent-primary" />
                      Display Settings
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Theme</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['dark', 'light', 'system'].map((theme) => (
                            <button
                              key={theme}
                              onClick={() => setPreferences({ ...preferences, theme })}
                              className={clsx(
                                'p-4 rounded-xl border-2 transition-all capitalize',
                                preferences.theme === theme
                                  ? 'border-accent-primary bg-accent-primary/10'
                                  : 'border-border-primary hover:border-border-hover'
                              )}
                            >
                              {theme}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Language</label>
                        <select
                          value={preferences.language}
                          onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                          className="input"
                        >
                          <option value="en">English</option>
                          <option value="sr">Serbian</option>
                          <option value="de">German</option>
                          <option value="es">Spanish</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Table Color</label>
                        <div className="flex gap-3">
                          {[
                            { id: 'green', color: 'bg-green-700' },
                            { id: 'blue', color: 'bg-blue-700' },
                            { id: 'red', color: 'bg-red-800' },
                            { id: 'purple', color: 'bg-purple-700' },
                          ].map((table) => (
                            <button
                              key={table.id}
                              onClick={() => setPreferences({ ...preferences, tableColor: table.id })}
                              className={clsx(
                                'w-12 h-12 rounded-xl transition-all',
                                table.color,
                                preferences.tableColor === table.id
                                  ? 'ring-2 ring-accent-primary ring-offset-2 ring-offset-background-primary'
                                  : 'hover:opacity-80'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gameplay Settings */}
                  <div className="card">
                    <h2 className="text-xl font-bold mb-6">Gameplay Settings</h2>

                    <div className="space-y-3">
                      {[
                        { key: 'autoMuck', label: 'Auto-Muck Losing Hands', description: 'Automatically muck your cards when you lose' },
                        { key: 'showHandHistory', label: 'Show Hand History', description: 'Display your recent hands during play' },
                        { key: 'fourColorDeck', label: 'Four-Color Deck', description: 'Use different colors for each suit' },
                        { key: 'runItTwice', label: 'Run It Twice', description: 'Allow running the board twice when all-in' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-background-tertiary rounded-xl">
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-text-muted text-sm">{item.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences[item.key as keyof typeof preferences] as boolean}
                              onChange={(e) => setPreferences({ ...preferences, [item.key]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-background-hover rounded-full peer peer-checked:bg-accent-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
