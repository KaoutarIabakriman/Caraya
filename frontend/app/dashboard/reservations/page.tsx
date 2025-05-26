"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { Reservation, ReservationStatus } from '@/types/reservation';
import ReservationStats from '@/components/ReservationStats';
import ReservationCalendar from '@/components/ReservationCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  Calendar as CalendarIcon, 
  List, 
  Eye, 
  Edit, 
  Trash2,
  CalendarDays 
} from 'lucide-react';

// Status badge colors
const statusColors: Record<ReservationStatus, string> = {
  pending: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30',
  confirmed: 'bg-blue-900/30 text-blue-400 border border-blue-500/30',
  active: 'bg-green-900/30 text-green-400 border border-green-500/30',
  completed: 'bg-gray-900/30 text-gray-300 border border-gray-500/30',
  cancelled: 'bg-red-900/30 text-red-400 border border-red-500/30'
};

export default function ReservationsPage() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | ''>('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
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
  
  // Fetch reservations when component mounts or filters change
  useEffect(() => {
    fetchReservations();
  }, [token, currentPage, statusFilter]);
  
  const fetchReservations = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      let url = `http://localhost:5000/api/reservations?page=${currentPage}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setReservations(response.data.reservations);
      setTotalPages(response.data.pages);
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load reservations');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReservations();
  };
  
  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/reservations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh the reservation list
      fetchReservations();
    } catch (err: any) {
      console.error('Error deleting reservation:', err);
      alert(err.response?.data?.message || 'Failed to delete reservation');
    }
  };
  
  const handleCalendarEventClick = (eventId: string) => {
    router.push(`/dashboard/reservations/${eventId}`);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2 flex items-center">
            <CalendarDays className="mr-3 text-gold" size={28} />
            <span className="text-white">Reservation <span className="text-gold">Management</span></span>
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-gold to-gold/50"></div>
        </div>
        
        <Link 
          href="/dashboard/reservations/add" 
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gold to-amber-500 hover:from-gold hover:to-amber-400 text-black rounded-md transition-all duration-300 font-medium"
        >
          <Plus size={20} className="mr-2" />
          New Reservation
        </Link>
      </motion.div>
      
      {/* Statistics Overview */}
      <motion.div variants={itemVariants}>
        <ReservationStats />
      </motion.div>
      
      {/* View Mode Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-white/10">
            <TabsTrigger 
              value="list" 
              onClick={() => setViewMode('list')}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold/20 data-[state=active]:to-amber-500/20 data-[state=active]:text-gold"
            >
              <List size={16} className="mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger 
              value="calendar" 
              onClick={() => setViewMode('calendar')}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold/20 data-[state=active]:to-amber-500/20 data-[state=active]:text-gold"
            >
              <CalendarIcon size={16} className="mr-2" />
              Calendar View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-4">
            {/* Filters and Search */}
            <motion.div 
              className="bg-gray-800/50 p-4 rounded-lg border border-white/10 shadow mb-4"
              variants={itemVariants}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <form onSubmit={handleSearch} className="flex">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search reservations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full bg-gray-900/50 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="ml-2 px-4 py-2 bg-gray-700 text-gold border border-gold/30 rounded-md hover:bg-gold/10 transition-colors"
                    >
                      Search
                    </button>
                  </form>
                </div>
                
                <div className="w-full sm:w-64">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Filter size={18} className="text-gray-400" />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | '')}
                      className="pl-10 pr-4 py-2 w-full bg-gray-900/50 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold appearance-none"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Reservations List */}
            <motion.div 
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow overflow-hidden"
              variants={itemVariants}
            >
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 size={40} className="animate-spin text-gold" />
                </div>
              ) : error ? (
                <div className="p-4 text-red-400 bg-red-900/20 border-l-4 border-red-500">
                  {error}
                </div>
              ) : reservations.length === 0 ? (
                <div className="p-16 text-center">
                  <CalendarDays size={48} className="mx-auto text-gold/60 mb-4" />
                  <h3 className="text-xl font-medium text-white font-serif">No reservations found</h3>
                  <p className="mt-2 text-gray-400">Create a new reservation to get started</p>
                  <div className="mt-6">
                    <Link 
                      href="/dashboard/reservations/add" 
                      className="inline-flex items-center px-5 py-2.5 border border-gold/30 shadow-lg text-sm font-medium rounded-md text-gold hover:text-black hover:bg-gold transition-colors duration-300"
                    >
                      <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
                      New Reservation
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-gray-900/50 text-gray-300 border-b border-white/10">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                          Client
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                          Car
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                          Dates
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {reservations.map((reservation) => (
                        <tr key={reservation._id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {reservation.client?.full_name || 'Unknown Client'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {reservation.client?.email || 'No email'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {reservation.car ? `${reservation.car.brand} ${reservation.car.model}` : 'Unknown Car'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {reservation.car?.license_plate || 'No plate'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {formatDate(reservation.start_date)} - {formatDate(reservation.end_date)}
                            </div>
                            <div className="text-sm text-gray-400">
                              {reservation.total_days} days
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gold">
                              ${reservation.total_amount.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-400">
                              ${reservation.daily_rate.toFixed(2)}/day
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[reservation.status]}`}>
                              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Link href={`/dashboard/reservations/${reservation._id}`}>
                                <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors" title="View Details">
                                  <Eye size={16} className="text-blue-400 hover:text-blue-300" />
                                </button>
                              </Link>
                              <Link href={`/dashboard/reservations/edit/${reservation._id}`}>
                                <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors" title="Edit Reservation">
                                  <Edit size={16} className="text-green-400 hover:text-green-300" />
                                </button>
                              </Link>
                              <button 
                                className="p-1.5 rounded-full hover:bg-white/10 transition-colors" 
                                title="Delete Reservation"
                                onClick={() => handleDelete(reservation._id)}
                              >
                                <Trash2 size={16} className="text-red-400 hover:text-red-300" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination */}
              {reservations.length > 0 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-white/10">
                  <div className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-white/10 rounded-md disabled:opacity-50 text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-white/10 rounded-md disabled:opacity-50 text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-4">
            <motion.div 
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow p-4"
              variants={itemVariants}
            >
              <ReservationCalendar onEventClick={handleCalendarEventClick} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
} 