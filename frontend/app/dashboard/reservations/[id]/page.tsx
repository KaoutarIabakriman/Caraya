"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Loader2, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  User, 
  Car, 
  FileText,
  CheckCircle,
  XCircle,
  CalendarDays
} from 'lucide-react';

interface ReservationDetailsPageProps {
  params: {
    id: string;
  };
}

// Status badge colors
const statusColors: Record<ReservationStatus, string> = {
  pending: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30',
  confirmed: 'bg-blue-900/30 text-blue-400 border border-blue-500/30',
  active: 'bg-green-900/30 text-green-400 border border-green-500/30',
  completed: 'bg-gray-900/30 text-gray-300 border border-gray-500/30',
  cancelled: 'bg-red-900/30 text-red-400 border border-red-500/30'
};

export default function ReservationDetailsPage({ params }: ReservationDetailsPageProps) {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = params;
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
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
  
  useEffect(() => {
    fetchReservation();
  }, [id, token]);
  
  const fetchReservation = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:5000/api/reservations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setReservation(response.data.reservation);
    } catch (err: any) {
      console.error('Error fetching reservation:', err);
      setError(err.response?.data?.message || 'Failed to load reservation');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!token || !reservation) return;
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/reservations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      router.push('/dashboard/reservations');
    } catch (err: any) {
      console.error('Error deleting reservation:', err);
      alert(err.response?.data?.message || 'Failed to delete reservation');
    }
  };
  
  const updateReservationStatus = async (newStatus: ReservationStatus) => {
    if (!token || !reservation) return;
    
    try {
      setIsUpdatingStatus(true);
      
      await axios.put(
        `http://localhost:5000/api/reservations/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh reservation data
      fetchReservation();
    } catch (err: any) {
      console.error('Error updating reservation status:', err);
      alert(err.response?.data?.message || 'Failed to update reservation status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={40} className="animate-spin text-gold" />
      </div>
    );
  }
  
  if (error || !reservation) {
    return (
      <div className="bg-red-900/20 border-l-4 border-red-500 text-red-400 p-4 rounded-r-md">
        <p>{error || 'Reservation not found'}</p>
        <Link 
          href="/dashboard/reservations" 
          className="mt-4 inline-flex items-center text-gold hover:text-white transition-colors"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back to Reservations
        </Link>
      </div>
    );
  }
  
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
          <Link 
            href="/dashboard/reservations" 
            className="flex items-center gap-2 text-gold hover:text-white transition-colors mb-2"
          >
            <ArrowLeft size={18} />
            <span>Back to Reservations</span>
          </Link>
          
          <h1 className="text-3xl font-bold font-serif flex items-center">
            <CalendarDays className="mr-3 text-gold" size={28} />
            <span className="text-white">Reservation <span className="text-gold">Details</span></span>
          </h1>
          
          <div className="flex items-center mt-2">
            <div className="h-1 w-24 bg-gradient-to-r from-gold to-gold/50 mr-3"></div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[reservation.status]}`}>
              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link 
            href={`/dashboard/reservations/edit/${id}`}
            className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-md transition-all duration-300"
          >
            <Edit size={18} className="mr-2" />
            Edit
          </Link>
          
          <button 
            onClick={handleDelete}
            className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-md transition-all duration-300"
          >
            <Trash2 size={18} className="mr-2" />
            Delete
          </button>
        </div>
      </motion.div>
      
      {/* Reservation Details Card */}
      <motion.div 
        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm overflow-hidden"
        variants={itemVariants}
      >
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Information */}
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="text-gold mr-2" size={20} />
                <h2 className="text-xl font-semibold font-serif text-white">Client Information</h2>
              </div>
              
              {reservation.client ? (
                <div className="space-y-2 bg-gray-900/30 p-4 rounded-md border border-white/5">
                  <p className="text-lg font-medium text-white">{reservation.client.full_name}</p>
                  <p className="text-gray-300">{reservation.client.email}</p>
                  <p className="text-gray-300">{reservation.client.phone}</p>
                  
                  <Link 
                    href={`/dashboard/clients/${reservation.client_id}`}
                    className="text-gold hover:text-white transition-colors text-sm inline-flex items-center mt-2"
                  >
                    View Client Details
                    <ArrowLeft size={16} className="ml-1 rotate-180" />
                  </Link>
                </div>
              ) : (
                <p className="text-gray-400">Client information not available</p>
              )}
            </div>
            
            {/* Car Information */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Car className="text-gold mr-2" size={20} />
                <h2 className="text-xl font-semibold font-serif text-white">Car Information</h2>
              </div>
              
              {reservation.car ? (
                <div className="space-y-2 bg-gray-900/30 p-4 rounded-md border border-white/5">
                  <p className="text-lg font-medium text-white">
                    {reservation.car.brand} {reservation.car.model} ({reservation.car.year})
                  </p>
                  <p className="text-gray-300">License Plate: {reservation.car.license_plate}</p>
                  <p className="text-gray-300">
                    Status: <span className={`px-2 py-0.5 rounded-full text-xs ${
                      reservation.car.availability_status === 'available' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                      reservation.car.availability_status === 'rented' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' :
                      'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {reservation.car.availability_status.charAt(0).toUpperCase() + reservation.car.availability_status.slice(1)}
                    </span>
                  </p>
                  
                  <Link 
                    href={`/dashboard/cars/${reservation.car_id}`}
                    className="text-gold hover:text-white transition-colors text-sm inline-flex items-center mt-2"
                  >
                    View Car Details
                    <ArrowLeft size={16} className="ml-1 rotate-180" />
                  </Link>
                </div>
              ) : (
                <p className="text-gray-400">Car information not available</p>
              )}
            </div>
            
            {/* Reservation Details */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="text-gold mr-2" size={20} />
                <h2 className="text-xl font-semibold font-serif text-white">Reservation Period</h2>
              </div>
              
              <div className="space-y-2 bg-gray-900/30 p-4 rounded-md border border-white/5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Start Date</p>
                    <p className="text-white">{formatDate(reservation.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">End Date</p>
                    <p className="text-white">{formatDate(reservation.end_date)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Days</p>
                  <p className="text-white">{reservation.total_days} days</p>
                </div>
              </div>
            </div>
            
            {/* Pricing Information */}
            <div className="space-y-4">
              <div className="flex items-center">
                <DollarSign className="text-gold mr-2" size={20} />
                <h2 className="text-xl font-semibold font-serif text-white">Pricing</h2>
              </div>
              
              <div className="space-y-2 bg-gray-900/30 p-4 rounded-md border border-white/5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Daily Rate</p>
                    <p className="text-gold font-medium">${reservation.daily_rate.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Amount</p>
                    <p className="text-gold font-medium">${reservation.total_amount.toFixed(2)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Payment Status</p>
                  <p className={`${
                    reservation.payment_status === 'paid' ? 'text-green-400' : 
                    reservation.payment_status === 'partial' ? 'text-yellow-400' : 
                    'text-red-400'
                  }`}>
                    {reservation.payment_status.charAt(0).toUpperCase() + reservation.payment_status.slice(1)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Location Information */}
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="text-gold mr-2" size={20} />
                <h2 className="text-xl font-semibold font-serif text-white">Location</h2>
              </div>
              
              <div className="space-y-2 bg-gray-900/30 p-4 rounded-md border border-white/5">
                <div>
                  <p className="text-sm text-gray-400">Pickup Location</p>
                  <p className="text-white">{reservation.pickup_location || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Return Location</p>
                  <p className="text-white">{reservation.return_location || 'Not specified'}</p>
                </div>
              </div>
            </div>
            
            {/* Notes */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-center">
                <FileText className="text-gold mr-2" size={20} />
                <h2 className="text-xl font-semibold font-serif text-white">Notes</h2>
              </div>
              
              <div className="bg-gray-900/30 p-4 rounded-md border border-white/5">
                <p className="text-gray-300 whitespace-pre-wrap">{reservation.notes || 'No notes available.'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Management */}
        <div className="p-6 border-t border-white/10">
          <h2 className="text-xl font-semibold font-serif text-white mb-4 flex items-center">
            <Clock className="text-gold mr-2" size={20} />
            Reservation Status Management
          </h2>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateReservationStatus('pending')}
              disabled={reservation.status === 'pending' || isUpdatingStatus}
              className={`px-4 py-2 rounded-md ${
                reservation.status === 'pending' ? 
                'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30 cursor-not-allowed' : 
                'bg-gray-900/50 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-900/20 transition-colors'
              }`}
            >
              Set as Pending
            </button>
            
            <button
              onClick={() => updateReservationStatus('confirmed')}
              disabled={reservation.status === 'confirmed' || isUpdatingStatus}
              className={`px-4 py-2 rounded-md ${
                reservation.status === 'confirmed' ? 
                'bg-blue-900/30 text-blue-400 border border-blue-500/30 cursor-not-allowed' : 
                'bg-gray-900/50 text-blue-400 border border-blue-500/20 hover:bg-blue-900/20 transition-colors'
              }`}
            >
              Set as Confirmed
            </button>
            
            <button
              onClick={() => updateReservationStatus('active')}
              disabled={reservation.status === 'active' || isUpdatingStatus}
              className={`px-4 py-2 rounded-md ${
                reservation.status === 'active' ? 
                'bg-green-900/30 text-green-400 border border-green-500/30 cursor-not-allowed' : 
                'bg-gray-900/50 text-green-400 border border-green-500/20 hover:bg-green-900/20 transition-colors'
              }`}
            >
              Set as Active
            </button>
            
            <button
              onClick={() => updateReservationStatus('completed')}
              disabled={reservation.status === 'completed' || isUpdatingStatus}
              className={`px-4 py-2 rounded-md ${
                reservation.status === 'completed' ? 
                'bg-gray-900/30 text-gray-300 border border-gray-500/30 cursor-not-allowed' : 
                'bg-gray-900/50 text-gray-300 border border-gray-500/20 hover:bg-gray-700/50 transition-colors'
              }`}
            >
              Set as Completed
            </button>
            
            <button
              onClick={() => updateReservationStatus('cancelled')}
              disabled={reservation.status === 'cancelled' || isUpdatingStatus}
              className={`px-4 py-2 rounded-md ${
                reservation.status === 'cancelled' ? 
                'bg-red-900/30 text-red-400 border border-red-500/30 cursor-not-allowed' : 
                'bg-gray-900/50 text-red-400 border border-red-500/20 hover:bg-red-900/20 transition-colors'
              }`}
            >
              Set as Cancelled
            </button>
            
            {isUpdatingStatus && (
              <div className="flex items-center ml-2">
                <Loader2 size={18} className="animate-spin text-gold mr-2" />
                <span className="text-gray-300">Updating status...</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 