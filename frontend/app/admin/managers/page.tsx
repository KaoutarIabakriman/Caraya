'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/lib/admin-provider';
import ProtectedAdminRoute from '@/components/auth/protected-admin-route';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  X,
  User,
  Mail,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react';

// Manager type
type Manager = {
  _id: string;
  email: string;
  name: string;
  role: string;
  created_at?: string;
};

// Form schema for creating/editing managers
const managerSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).or(z.string().length(0)),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
});

type ManagerFormValues = z.infer<typeof managerSchema>;

export default function ManagersPage() {
  const { admin, token, logout } = useAdmin();
  const router = useRouter();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentManager, setCurrentManager] = useState<Manager | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ManagerFormValues>({
    resolver: zodResolver(managerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  // Fetch managers on component mount
  useEffect(() => {
    fetchManagers();
  }, [token]);

  const fetchManagers = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/api/admin/managers', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setManagers(response.data.managers);
    } catch (err: any) {
      console.error('Error fetching managers:', err);
      setError(err.response?.data?.message || 'Failed to fetch managers');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentManager(null);
    reset({
      email: '',
      password: '',
      name: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (manager: Manager) => {
    setIsEditing(true);
    setCurrentManager(manager);
    setValue('email', manager.email);
    setValue('name', manager.name);
    setValue('password', ''); // Don't prefill password
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSuccessMessage(null);
  };

  const onSubmit = async (data: ManagerFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isEditing && currentManager) {
        // Update existing manager
        const updateData: any = {
          name: data.name,
          email: data.email,
        };
        
        // Only include password if it was provided
        if (data.password && data.password.trim() !== '') {
          updateData.password = data.password;
        }
        
        await axios.put(
          `http://localhost:5000/api/admin/managers/${currentManager._id}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setSuccessMessage('Manager updated successfully');
      } else {
        // Create new manager
        await axios.post(
          'http://localhost:5000/api/admin/managers',
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setSuccessMessage('Manager created successfully');
      }
      
      // Refresh the manager list
      fetchManagers();
      
      // Close modal after a short delay
      setTimeout(() => {
        closeModal();
      }, 1500);
      
    } catch (err: any) {
      console.error('Error saving manager:', err);
      setError(err.response?.data?.message || 'Failed to save manager');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteManager = async (managerId: string) => {
    if (!confirm('Are you sure you want to delete this manager?')) {
      return;
    }

    setError(null);

    try {
      await axios.delete(`http://localhost:5000/api/admin/managers/${managerId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh the manager list
      fetchManagers();
      
    } catch (err: any) {
      console.error('Error deleting manager:', err);
      setError(err.response?.data?.message || 'Failed to delete manager');
    }
  };

  // Filter managers based on search query
  const filteredManagers = managers.filter(manager => 
    manager.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    manager.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                className="px-3 py-2 text-sm font-medium rounded-md bg-gold text-black flex items-center"
              >
                <Users size={16} className="mr-1" /> Managers
              </Link>
              <Link 
                href="/admin/settings" 
                className="px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:text-white hover:bg-gray-700/50 flex items-center"
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
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold font-serif flex items-center">
                <Users className="mr-2 text-gold" /> Manage Managers
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search managers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-64 bg-gray-800/50 border border-white/10 rounded-lg py-2 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <button
                  onClick={openAddModal}
                  className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-gold hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute right-full group-hover:right-0 top-0 h-full w-full bg-white/20 transition-all duration-500 transform skew-x-12"></span>
                  <span className="relative flex items-center">
                    <Plus size={18} className="mr-2" /> Add Manager
                  </span>
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-900/30 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm flex items-center"
              >
                <AlertCircle size={16} className="mr-2" />
                {error}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 overflow-hidden rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {isLoading ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center">
                            <div className="flex justify-center">
                              <Loader2 className="h-8 w-8 animate-spin text-gold" />
                            </div>
                          </td>
                        </tr>
                      ) : filteredManagers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                            {searchQuery ? 'No managers found matching your search' : 'No managers found'}
                          </td>
                        </tr>
                      ) : (
                        filteredManagers.map((manager) => (
                          <tr key={manager._id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{manager.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{manager.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {manager.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openEditModal(manager)}
                                  className="text-gray-300 hover:text-gold transition-colors"
                                  title="Edit"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteManager(manager._id)}
                                  className="text-gray-300 hover:text-red-400 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal}></div>
            <motion.div 
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-lg border border-white/10 shadow-2xl p-6 w-full max-w-md z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white font-serif">
                  {isEditing ? 'Edit Manager' : 'Add New Manager'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {successMessage && (
                <div className="mb-4 bg-green-900/30 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg text-sm flex items-center">
                  <CheckCircle size={16} className="mr-2" />
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                      {...register('name')}
                      className="pl-10 w-full bg-gray-800/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300"
                      placeholder="Manager name"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
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
                      {...register('email')}
                      className="pl-10 w-full bg-gray-800/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300"
                      placeholder="Email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    {isEditing ? 'Password (leave blank to keep current)' : 'Password'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Lock size={18} />
                    </span>
                    <input
                      id="password"
                      type="password"
                      {...register('password')}
                      className="pl-10 w-full bg-gray-800/50 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent transition-all duration-300"
                      placeholder={isEditing ? "Leave blank to keep current" : "Password"}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="py-2 px-4 border border-white/10 rounded-lg text-gray-300 hover:bg-gray-700 focus:outline-none transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-gold hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold disabled:opacity-50 transition-all duration-300 overflow-hidden"
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
                          {isEditing ? 'Update' : 'Create'}
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </ProtectedAdminRoute>
  );
} 