'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/lib/admin-provider';
import ProtectedAdminRoute from '@/components/auth/protected-admin-route';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Car,
  Users,
  Calendar,
  DollarSign,
  LogOut,
  Plus,
  Settings,
  User,
  ChevronRight,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

// Types
interface DashboardStats {
  total_cars: number;
  available_cars: number;
  total_clients: number;
  active_reservations: number;
  pending_reservations: number;
  total_revenue: number;
  recent_reservations: RecentReservation[];
}

interface RecentReservation {
  id: string;
  client_name: string;
  car_info: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
}

interface Manager {
  _id: string;
  name: string;
  email: string;
}

export default function AdminDashboardPage() {
  const { admin, logout, token } = useAdmin();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    if (token) {
      fetchDashboardData();
      fetchManagers();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/api/analytics/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/managers', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setManagers(response.data.managers);
    } catch (err) {
      console.error('Error fetching managers:', err);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 size={14} className="mr-1" />;
      case 'pending':
        return <Clock size={14} className="mr-1" />;
      case 'completed':
        return <CheckCircle2 size={14} className="mr-1" />;
      case 'cancelled':
        return <AlertCircle size={14} className="mr-1" />;
      default:
        return null;
    }
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
                className="px-3 py-2 text-sm font-medium rounded-md bg-gold text-black flex items-center"
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
                href="#" 
                className="px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:text-white hover:bg-gray-700/50 flex items-center"
              >
                <Settings size={16} className="mr-1" /> Settings
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Stats Overview */}
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-xl font-bold mb-4 font-serif flex items-center">
                  <BarChart3 className="mr-2 text-gold" /> Dashboard Overview
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Total Cars */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 overflow-hidden rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-500/20 rounded-md p-3 border border-blue-500/30">
                          <Car className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-400 truncate">Total Cars</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-white">{stats?.total_cars || 0}</div>
                              <div className="ml-2 text-sm text-gray-400">
                                <span className="text-green-400 font-medium">{stats?.available_cars || 0} available</span>
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Clients */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 overflow-hidden rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-500/20 rounded-md p-3 border border-purple-500/30">
                          <Users className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-400 truncate">Total Clients</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-white">{stats?.total_clients || 0}</div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Reservations */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 overflow-hidden rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
                <div className="p-5">
                  <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-500/20 rounded-md p-3 border border-green-500/30">
                          <Calendar className="h-6 w-6 text-green-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-400 truncate">Active Reservations</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-white">{stats?.active_reservations || 0}</div>
                              <div className="ml-2 text-sm text-gray-400">
                                <span className="text-yellow-400 font-medium">{stats?.pending_reservations || 0} pending</span>
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Revenue */}
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 overflow-hidden rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-gold/20 rounded-md p-3 border border-gold/30">
                          <DollarSign className="h-6 w-6 text-gold" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                            <dt className="text-sm font-medium text-gray-400 truncate">Total Revenue</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-white">{formatCurrency(stats?.total_revenue || 0)}</div>
                              <div className="ml-2 text-sm text-green-400 flex items-center">
                                <TrendingUp size={14} className="mr-1" /> 30 days
                              </div>
                        </dd>
                      </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Reservations */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold font-serif flex items-center">
                    <Calendar className="mr-2 text-gold" /> Recent Reservations
                  </h2>
                  <Link 
                    href="#" 
                    className="text-sm text-gold hover:text-gold/80 flex items-center"
                  >
                    View all <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 overflow-hidden rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                      <thead className="bg-gray-800/50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Car</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Dates</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {stats?.recent_reservations && stats.recent_reservations.length > 0 ? (
                          stats.recent_reservations.map((reservation) => (
                            <tr key={reservation.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{reservation.client_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{reservation.car_info}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {formatDate(reservation.start_date)} - {formatDate(reservation.end_date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{formatCurrency(reservation.total_amount)}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                                  {getStatusIcon(reservation.status)}
                                  {reservation.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-400">No recent reservations</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>

              {/* Managers */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-serif flex items-center">
                      <Users className="mr-2 text-gold" /> Managers
                    </h2>
                    <Link 
                      href="/admin/managers" 
                      className="text-sm text-gold hover:text-gold/80 flex items-center"
                    >
                      View all <ChevronRight size={16} />
                    </Link>
                  </div>
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 overflow-hidden rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-gray-800/50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {managers && managers.length > 0 ? (
                            managers.slice(0, 5).map((manager) => (
                              <tr key={manager._id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{manager.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{manager.email}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-400">No managers found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                </div>
              </div>

              {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-bold mb-4 font-serif flex items-center">
                    <Settings className="mr-2 text-gold" /> Quick Actions
                  </h2>
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 overflow-hidden rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
                <div className="p-5">
                      <ul className="divide-y divide-white/10">
                      <li className="py-3">
                          <Link 
                            href="/admin/managers" 
                            className="text-gray-200 hover:text-gold flex items-center transition-colors"
                          >
                            <Plus size={16} className="mr-2" />
                          Add New Manager
                        </Link>
                      </li>
                      <li className="py-3">
                          <Link 
                            href="#" 
                            className="text-gray-200 hover:text-gold flex items-center transition-colors"
                          >
                            <Settings size={16} className="mr-2" />
                            System Settings
                          </Link>
                        </li>
                        <li className="py-3">
                          <Link 
                            href="#" 
                            className="text-gray-200 hover:text-gold flex items-center transition-colors"
                          >
                            <User size={16} className="mr-2" />
                            Update Profile
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              </motion.div>
            </motion.div>
          )}
        </main>
      </div>
    </ProtectedAdminRoute>
  );
} 