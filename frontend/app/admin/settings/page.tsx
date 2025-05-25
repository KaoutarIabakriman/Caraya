'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/lib/admin-provider';
import ProtectedAdminRoute from '@/components/auth/protected-admin-route';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Settings,
  LogOut,
  Save,
  User,
  Lock,
  Mail,
  Globe,
  Database,
  Bell,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form schema for profile settings
const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

// Form schema for password change
const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Confirm password must be at least 6 characters' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Form schema for system settings
const systemSchema = z.object({
  siteTitle: z.string().min(1, { message: 'Site title is required' }),
  contactEmail: z.string().email({ message: 'Please enter a valid email address' }),
  maintenanceMode: z.boolean().optional(),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']),
  notificationsEnabled: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type SystemFormValues = z.infer<typeof systemSchema>;

export default function SettingsPage() {
  const { admin, logout, token } = useAdmin();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: admin?.name || '',
      email: admin?.email || '',
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // System settings form
  const {
    register: registerSystem,
    handleSubmit: handleSystemSubmit,
    formState: { errors: systemErrors },
  } = useForm<SystemFormValues>({
    resolver: zodResolver(systemSchema),
    defaultValues: {
      siteTitle: 'Caraya Car Rental',
      contactEmail: 'contact@caraya.com',
      maintenanceMode: false,
      backupFrequency: 'daily',
      notificationsEnabled: true,
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Profile data:', data);
      setSuccessMessage('Profile updated successfully');
      setIsSubmitting(false);
    }, 1000);
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Password data:', data);
      setSuccessMessage('Password changed successfully');
      resetPassword();
      setIsSubmitting(false);
    }, 1000);
  };

  const onSystemSubmit = async (data: SystemFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    // Simulate API call
    setTimeout(() => {
      console.log('System data:', data);
      setSuccessMessage('System settings updated successfully');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-white/10 shadow-lg">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold font-serif">
                <span className="text-gold">Caraya</span> Admin
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm hidden md:inline-block">
                Welcome, {admin?.name || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 rounded-md flex items-center border border-white/10"
              >
                <LogOut size={16} className="mr-2" /> Logout
              </button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <div className="bg-gray-800/50 border-b border-white/5">
          <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-4 overflow-x-auto pb-1">
              <Link 
                href="/admin/dashboard" 
                className="px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:text-white hover:bg-gray-700/50 flex items-center"
              >
                <BarChart3 size={16} className="mr-1" /> Dashboard
              </Link>
              <Link 
                href="/admin/managers" 
                className="px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:text-white hover:bg-gray-700/50 flex items-center"
              >
                <Users size={16} className="mr-1" /> Managers
              </Link>
              <Link 
                href="/admin/settings" 
                className="px-3 py-2 text-sm font-medium rounded-md bg-gold text-black flex items-center"
              >
                <Settings size={16} className="mr-1" /> Settings
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold mb-6 font-serif flex items-center">
                <Settings className="mr-2 text-gold" /> Settings
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Sidebar */}
              <motion.div variants={itemVariants} className="md:col-span-1">
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 overflow-hidden rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
                  <div className="p-4">
                    <nav className="space-y-1">
                      <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full px-3 py-2 text-left text-sm font-medium rounded-md flex items-center ${
                          activeTab === 'profile' 
                            ? 'bg-gold text-black' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                        }`}
                      >
                        <User size={16} className="mr-2" /> Profile Settings
                      </button>
                      <button
                        onClick={() => setActiveTab('password')}
                        className={`w-full px-3 py-2 text-left text-sm font-medium rounded-md flex items-center ${
                          activeTab === 'password' 
                            ? 'bg-gold text-black' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                        }`}
                      >
                        <Lock size={16} className="mr-2" /> Change Password
                      </button>
                      <button
                        onClick={() => setActiveTab('system')}
                        className={`w-full px-3 py-2 text-left text-sm font-medium rounded-md flex items-center ${
                          activeTab === 'system' 
                            ? 'bg-gold text-black' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                        }`}
                      >
                        <Globe size={16} className="mr-2" /> System Settings
                      </button>
                    </nav>
                  </div>
                </div>
              </motion.div>

              {/* Content */}
              <motion.div variants={itemVariants} className="md:col-span-3">
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 overflow-hidden rounded-lg border border-white/10 shadow-lg backdrop-blur-sm p-6">
                  {/* Success/Error Messages */}
                  {successMessage && (
                    <div className="mb-6 bg-green-900/30 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg text-sm flex items-center">
                      <CheckCircle size={16} className="mr-2" />
                      {successMessage}
                    </div>
                  )}
                  
                  {errorMessage && (
                    <div className="mb-6 bg-red-900/30 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm flex items-center">
                      <AlertCircle size={16} className="mr-2" />
                      {errorMessage}
                    </div>
                  )}

                  {/* Profile Settings */}
                  {activeTab === 'profile' && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 font-serif">Profile Settings</h3>
                      <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                            Name
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <User size={18} />
                            </span>
                            <input
                              id="name"
                              {...registerProfile('name')}
                              className="pl-10 w-full bg-gray-800/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300"
                              placeholder="Your name"
                            />
                          </div>
                          {profileErrors.name && (
                            <p className="text-red-400 text-xs mt-1">{profileErrors.name.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                            Email
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <Mail size={18} />
                            </span>
                            <input
                              id="email"
                              type="email"
                              {...registerProfile('email')}
                              className="pl-10 w-full bg-gray-800/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300"
                              placeholder="Your email"
                            />
                          </div>
                          {profileErrors.email && (
                            <p className="text-red-400 text-xs mt-1">{profileErrors.email.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-lg text-black bg-gold hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold disabled:opacity-50 transition-all duration-300 overflow-hidden"
                          >
                            <span className="absolute right-full group-hover:right-0 top-0 h-full w-full bg-white/20 transition-all duration-500 transform skew-x-12"></span>
                            <span className="relative flex items-center">
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save size={16} className="mr-2" />
                                  Save Profile
                                </>
                              )}
                            </span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Password Settings */}
                  {activeTab === 'password' && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 font-serif">Change Password</h3>
                      <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                            Current Password
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <Lock size={18} />
                            </span>
                            <input
                              id="currentPassword"
                              type="password"
                              {...registerPassword('currentPassword')}
                              className="pl-10 w-full bg-gray-800/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300"
                              placeholder="Current password"
                            />
                          </div>
                          {passwordErrors.currentPassword && (
                            <p className="text-red-400 text-xs mt-1">{passwordErrors.currentPassword.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                            New Password
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <Lock size={18} />
                            </span>
                            <input
                              id="newPassword"
                              type="password"
                              {...registerPassword('newPassword')}
                              className="pl-10 w-full bg-gray-800/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300"
                              placeholder="New password"
                            />
                          </div>
                          {passwordErrors.newPassword && (
                            <p className="text-red-400 text-xs mt-1">{passwordErrors.newPassword.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <Lock size={18} />
                            </span>
                            <input
                              id="confirmPassword"
                              type="password"
                              {...registerPassword('confirmPassword')}
                              className="pl-10 w-full bg-gray-800/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300"
                              placeholder="Confirm new password"
                            />
                          </div>
                          {passwordErrors.confirmPassword && (
                            <p className="text-red-400 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-lg text-black bg-gold hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold disabled:opacity-50 transition-all duration-300 overflow-hidden"
                          >
                            <span className="absolute right-full group-hover:right-0 top-0 h-full w-full bg-white/20 transition-all duration-500 transform skew-x-12"></span>
                            <span className="relative flex items-center">
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                  Changing...
                                </>
                              ) : (
                                <>
                                  <Save size={16} className="mr-2" />
                                  Change Password
                                </>
                              )}
                            </span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* System Settings */}
                  {activeTab === 'system' && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 font-serif">System Settings</h3>
                      <form onSubmit={handleSystemSubmit(onSystemSubmit)} className="space-y-6">
                        <div>
                          <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-300 mb-1">
                            Site Title
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <Globe size={18} />
                            </span>
                            <input
                              id="siteTitle"
                              {...registerSystem('siteTitle')}
                              className="pl-10 w-full bg-gray-800/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300"
                              placeholder="Site title"
                            />
                          </div>
                          {systemErrors.siteTitle && (
                            <p className="text-red-400 text-xs mt-1">{systemErrors.siteTitle.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300 mb-1">
                            Contact Email
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <Mail size={18} />
                            </span>
                            <input
                              id="contactEmail"
                              type="email"
                              {...registerSystem('contactEmail')}
                              className="pl-10 w-full bg-gray-800/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300"
                              placeholder="Contact email"
                            />
                          </div>
                          {systemErrors.contactEmail && (
                            <p className="text-red-400 text-xs mt-1">{systemErrors.contactEmail.message}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-300 mb-1">
                              Backup Frequency
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <Database size={18} />
                              </span>
                              <select
                                id="backupFrequency"
                                {...registerSystem('backupFrequency')}
                                className="pl-10 w-full bg-gray-800/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300"
                              >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <input
                                id="maintenanceMode"
                                type="checkbox"
                                {...registerSystem('maintenanceMode')}
                                className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                              />
                              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-300">
                                Maintenance Mode
                              </label>
                            </div>
                            
                            <div className="flex items-center">
                              <input
                                id="notificationsEnabled"
                                type="checkbox"
                                {...registerSystem('notificationsEnabled')}
                                className="h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded"
                              />
                              <label htmlFor="notificationsEnabled" className="ml-2 block text-sm text-gray-300">
                                Enable Notifications
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-lg text-black bg-gold hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold disabled:opacity-50 transition-all duration-300 overflow-hidden"
                          >
                            <span className="absolute right-full group-hover:right-0 top-0 h-full w-full bg-white/20 transition-all duration-500 transform skew-x-12"></span>
                            <span className="relative flex items-center">
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save size={16} className="mr-2" />
                                  Save Settings
                                </>
                              )}
                            </span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </ProtectedAdminRoute>
  );
} 