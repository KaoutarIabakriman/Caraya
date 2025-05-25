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

// Manager type
type Manager = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
};

// Form schema for creating/editing managers
const managerSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
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
        if (data.password.trim() !== '') {
          updateData.password = data.password;
        }
        
        await axios.put(
          `http://localhost:5000/api/admin/managers/${currentManager.id}`,
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

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gray-800 text-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                Welcome, {admin?.name || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-4">
              <Link 
                href="/admin/dashboard" 
                className="px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                Dashboard
              </Link>
              <Link 
                href="/admin/managers" 
                className="px-3 py-2 text-sm font-medium rounded-md bg-gray-800 text-white"
              >
                Manage Managers
              </Link>
            </nav>
          </div>
        </div>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Managers</h2>
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add New Manager
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-lg font-medium text-gray-700">Loading managers...</p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {managers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                          No managers found. Add your first manager.
                        </td>
                      </tr>
                    ) : (
                      managers.map((manager) => (
                        <tr key={manager.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {manager.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {manager.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(manager.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openEditModal(manager)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteManager(manager.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* Modal for adding/editing managers */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditing ? 'Edit Manager' : 'Add New Manager'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="px-6 py-4">
                  {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
                      {successMessage}
                    </div>
                  )}
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                      {error}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      {...register('name')}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      {isEditing ? 'Password (leave blank to keep current)' : 'Password'}
                    </label>
                    <input
                      id="password"
                      type="password"
                      {...register('password', { required: !isEditing })}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : isEditing ? 'Update Manager' : 'Add Manager'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedAdminRoute>
  );
} 