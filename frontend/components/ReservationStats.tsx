import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { ReservationStats as StatsType } from '@/types/reservation';
import { Loader2, AlertCircle, Clock, DollarSign, Activity, FileText } from 'lucide-react';

export default function ReservationStats() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [stats, setStats] = useState<StatsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchStats();
  }, [token]);
  
  const fetchStats = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(
        'http://localhost:5000/api/reservations/stats',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching reservation stats:', err);
      setError('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };
  
  const navigateToReservation = (id: string) => {
    router.push(`/dashboard/reservations/${id}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg flex items-start">
        <AlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }
  
  if (!stats) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <FileText className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Reservations</p>
            <p className="text-2xl font-bold">{stats.status_counts.active}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <DollarSign className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Revenue</p>
            <p className="text-2xl font-bold">${stats.total_revenue.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow flex items-center">
          <div className="bg-yellow-100 p-3 rounded-full mr-4">
            <Clock className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Reservations</p>
            <p className="text-2xl font-bold">{stats.status_counts.pending}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <Activity className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Completed Rentals</p>
            <p className="text-2xl font-bold">{stats.completed_count}</p>
          </div>
        </div>
      </div>
      
      {/* Overdue rentals */}
      {stats.overdue_rentals.count > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overdue Rentals</h2>
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
                    End Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Overdue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.overdue_rentals.rentals.map((rental) => (
                  <tr 
                    key={rental.reservation_id}
                    onClick={() => navigateToReservation(rental.reservation_id)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rental.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{rental.car_info}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(rental.end_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {rental.days_overdue} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Upcoming reservations */}
      {stats.upcoming_reservations.count > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Reservations</h2>
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
                    Start Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.upcoming_reservations.reservations.map((reservation) => (
                  <tr 
                    key={reservation.reservation_id}
                    onClick={() => navigateToReservation(reservation.reservation_id)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{reservation.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{reservation.car_info}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(reservation.start_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {reservation.status === 'pending' ? 'Pending' : 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Status breakdown */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reservation Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-yellow-50 p-3 rounded-md text-center">
            <p className="text-sm text-yellow-800">Pending</p>
            <p className="text-xl font-bold text-yellow-600">{stats.status_counts.pending}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-md text-center">
            <p className="text-sm text-blue-800">Confirmed</p>
            <p className="text-xl font-bold text-blue-600">{stats.status_counts.confirmed}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-md text-center">
            <p className="text-sm text-green-800">Active</p>
            <p className="text-xl font-bold text-green-600">{stats.status_counts.active}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md text-center">
            <p className="text-sm text-gray-800">Completed</p>
            <p className="text-xl font-bold text-gray-600">{stats.status_counts.completed}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-md text-center">
            <p className="text-sm text-red-800">Cancelled</p>
            <p className="text-xl font-bold text-red-600">{stats.status_counts.cancelled}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 