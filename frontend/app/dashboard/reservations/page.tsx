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
import { 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  Calendar as CalendarIcon, 
  List, 
  Eye, 
  Edit, 
  Trash2 
} from 'lucide-react';

// Status badge colors
const statusColors: Record<ReservationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Reservations</h1>
        
        <Link 
          href="/dashboard/reservations/add" 
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus size={20} className="mr-2" />
          New Reservation
        </Link>
      </div>
      
      {/* Statistics Overview */}
      <ReservationStats />
      
      {/* View Mode Tabs */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" onClick={() => setViewMode('list')}>
            <List size={16} className="mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar" onClick={() => setViewMode('calendar')}>
            <CalendarIcon size={16} className="mr-2" />
            Calendar View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-4">
          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-lg shadow mb-4">
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
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
          </div>
          
          {/* Reservations List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 size={40} className="animate-spin text-blue-500" />
              </div>
            ) : error ? (
              <div className="p-4 text-red-700 bg-red-100">
                {error}
              </div>
            ) : reservations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No reservations found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Car
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reservations.map((reservation) => (
                      <tr key={reservation._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {reservation.client?.full_name || 'Unknown Client'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.client?.email || 'No email'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {reservation.car ? `${reservation.car.brand} ${reservation.car.model}` : 'Unknown Car'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.car?.license_plate || 'No plate'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(reservation.start_date)} - {formatDate(reservation.end_date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.total_days} days
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${reservation.total_amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ${reservation.daily_rate.toFixed(2)}/day
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[reservation.status]}`}>
                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/dashboard/reservations/${reservation._id}`}>
                              <Eye size={18} className="text-blue-500 hover:text-blue-700" />
                            </Link>
                            <Link href={`/dashboard/reservations/edit/${reservation._id}`}>
                              <Edit size={18} className="text-green-500 hover:text-green-700" />
                            </Link>
                            <button onClick={() => handleDelete(reservation._id)}>
                              <Trash2 size={18} className="text-red-500 hover:text-red-700" />
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
            {!isLoading && reservations.length > 0 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-4">
          <ReservationCalendar onEventClick={handleCalendarEventClick} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 