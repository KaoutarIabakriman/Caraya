import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { ReservationStats as StatsType } from '@/types/reservation';
import { Loader2, AlertCircle, Clock, DollarSign, Activity, FileText, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReservationStats() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [stats, setStats] = useState<StatsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };
  
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
        <Loader2 size={40} className="animate-spin text-gold" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-900/20 border-l-4 border-red-500 text-red-400 p-4 rounded-md flex items-start">
        <AlertCircle className="text-red-400 mr-2 flex-shrink-0" size={20} />
        <p>{error}</p>
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
        <motion.div 
          className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-4 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm flex items-center"
          variants={itemVariants}
        >
          <div className="bg-blue-900/30 p-3 rounded-full mr-4 border border-blue-500/30">
            <FileText className="text-blue-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Active Reservations</p>
            <p className="text-2xl font-bold text-white">{stats.status_counts.active}</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-4 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm flex items-center"
          variants={itemVariants}
        >
          <div className="bg-green-900/30 p-3 rounded-full mr-4 border border-green-500/30">
            <DollarSign className="text-green-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Revenue</p>
            <p className="text-2xl font-bold text-gold">${stats.total_revenue.toFixed(2)}</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-4 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm flex items-center"
          variants={itemVariants}
        >
          <div className="bg-yellow-900/30 p-3 rounded-full mr-4 border border-yellow-500/30">
            <Clock className="text-yellow-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Pending Reservations</p>
            <p className="text-2xl font-bold text-white">{stats.status_counts.pending}</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-4 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm flex items-center"
          variants={itemVariants}
        >
          <div className="bg-purple-900/30 p-3 rounded-full mr-4 border border-purple-500/30">
            <CheckCircle className="text-purple-400" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Completed Rentals</p>
            <p className="text-2xl font-bold text-white">{stats.completed_count}</p>
          </div>
        </motion.div>
      </div>
      
      {/* Overdue rentals */}
      {stats.overdue_rentals.count > 0 && (
        <motion.div 
          className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-4 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm"
          variants={itemVariants}
        >
          <h2 className="text-xl font-semibold font-serif mb-4 flex items-center">
            <AlertCircle className="text-red-400 mr-2" size={20} />
            <span className="text-white">Overdue <span className="text-red-400">Rentals</span></span>
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-gray-900/50 text-gray-300">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Car
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    End Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Days Overdue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.overdue_rentals.rentals.map((rental) => (
                  <tr 
                    key={rental.reservation_id}
                    onClick={() => navigateToReservation(rental.reservation_id)}
                    className="hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{rental.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{rental.car_info}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {new Date(rental.end_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-900/30 text-red-400 border border-red-500/30">
                        {rental.days_overdue} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      
      {/* Upcoming reservations */}
      {stats.upcoming_reservations.count > 0 && (
        <motion.div 
          className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-4 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm"
          variants={itemVariants}
        >
          <h2 className="text-xl font-semibold font-serif mb-4 flex items-center">
            <Calendar className="text-blue-400 mr-2" size={20} />
            <span className="text-white">Upcoming <span className="text-blue-400">Reservations</span></span>
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-gray-900/50 text-gray-300">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Car
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Start Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.upcoming_reservations.reservations.map((reservation) => (
                  <tr 
                    key={reservation.reservation_id}
                    onClick={() => navigateToReservation(reservation.reservation_id)}
                    className="hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{reservation.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{reservation.car_info}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {new Date(reservation.start_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        reservation.status === 'pending' ? 
                        'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' : 
                        'bg-blue-900/30 text-blue-400 border border-blue-500/30'
                      }`}>
                        {reservation.status === 'pending' ? 'Pending' : 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      
      {/* Status breakdown */}
      <motion.div 
        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-4 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm"
        variants={itemVariants}
      >
        <h2 className="text-xl font-semibold font-serif mb-4 text-white">Reservation Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-yellow-900/30 p-3 rounded-md text-center border border-yellow-500/30">
            <p className="text-sm text-yellow-400">Pending</p>
            <p className="text-xl font-bold text-white">{stats.status_counts.pending}</p>
          </div>
          <div className="bg-blue-900/30 p-3 rounded-md text-center border border-blue-500/30">
            <p className="text-sm text-blue-400">Confirmed</p>
            <p className="text-xl font-bold text-white">{stats.status_counts.confirmed}</p>
          </div>
          <div className="bg-green-900/30 p-3 rounded-md text-center border border-green-500/30">
            <p className="text-sm text-green-400">Active</p>
            <p className="text-xl font-bold text-white">{stats.status_counts.active}</p>
          </div>
          <div className="bg-gray-900/30 p-3 rounded-md text-center border border-gray-500/30">
            <p className="text-sm text-gray-300">Completed</p>
            <p className="text-xl font-bold text-white">{stats.status_counts.completed}</p>
          </div>
          <div className="bg-red-900/30 p-3 rounded-md text-center border border-red-500/30">
            <p className="text-sm text-red-400">Cancelled</p>
            <p className="text-xl font-bold text-white">{stats.status_counts.cancelled}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 