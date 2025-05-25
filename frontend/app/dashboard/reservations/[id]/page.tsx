"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { 
  ChevronLeft, 
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
  XCircle
} from 'lucide-react';

interface ReservationDetailsPageProps {
  params: {
    id: string;
  };
}

// Status badge colors
const statusColors: Record<ReservationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  active: 'bg-green-100 text-green-800 border-green-300',
  completed: 'bg-gray-100 text-gray-800 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300'
};

export default function ReservationDetailsPage({ params }: ReservationDetailsPageProps) {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = params;
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
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
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (error || !reservation) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">{error || 'Reservation not found'}</p>
        <Link 
          href="/dashboard/reservations" 
          className="mt-4 inline-flex items-center text-blue-500 hover:text-blue-700"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Reservations
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/reservations" 
            className="inline-flex items-center text-blue-500 hover:text-blue-700"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Reservations
          </Link>
          
          <h1 className="text-2xl font-bold">Reservation Details</h1>
          
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[reservation.status]}`}>
            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Link 
            href={`/dashboard/reservations/edit/${id}`}
            className="inline-flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <Edit size={18} className="mr-2" />
            Edit
          </Link>
          
          <button 
            onClick={handleDelete}
            className="inline-flex items-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            <Trash2 size={18} className="mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      {/* Reservation Details Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Information */}
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="text-gray-400 mr-2" size={20} />
                <h2 className="text-lg font-semibold">Client Information</h2>
              </div>
              
              {reservation.client ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium">{reservation.client.full_name}</p>
                  <p className="text-gray-500">{reservation.client.email}</p>
                  <p className="text-gray-500">{reservation.client.phone}</p>
                  
                  <Link 
                    href={`/dashboard/clients/${reservation.client_id}`}
                    className="text-blue-500 hover:text-blue-700 text-sm inline-flex items-center"
                  >
                    View Client Details
                    <ChevronLeft size={16} className="ml-1 rotate-180" />
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500">Client information not available</p>
              )}
            </div>
            
            {/* Car Information */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Car className="text-gray-400 mr-2" size={20} />
                <h2 className="text-lg font-semibold">Car Information</h2>
              </div>
              
              {reservation.car ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {reservation.car.brand} {reservation.car.model} ({reservation.car.year})
                  </p>
                  <p className="text-gray-500">License Plate: {reservation.car.license_plate}</p>
                  <p className="text-gray-500">
                    Status: <span className={`px-2 py-0.5 rounded-full text-xs ${
                      reservation.car.availability_status === 'available' ? 'bg-green-100 text-green-800' :
                      reservation.car.availability_status === 'rented' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reservation.car.availability_status.charAt(0).toUpperCase() + reservation.car.availability_status.slice(1)}
                    </span>
                  </p>
                  
                  <Link 
                    href={`/dashboard/cars/${reservation.car_id}`}
                    className="text-blue-500 hover:text-blue-700 text-sm inline-flex items-center"
                  >
                    View Car Details
                    <ChevronLeft size={16} className="ml-1 rotate-180" />
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500">Car information not available</p>
              )}
            </div>
          </div>
          
          <hr className="my-6" />
          
          {/* Reservation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dates and Duration */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="text-gray-400 mr-2" size={20} />
                <h2 className="text-lg font-semibold">Rental Period</h2>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Clock className="text-gray-400 mr-2" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(reservation.start_date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="text-gray-400 mr-2" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">{formatDate(reservation.end_date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="text-gray-400 mr-2" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{reservation.total_days} days</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Locations */}
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="text-gray-400 mr-2" size={20} />
                <h2 className="text-lg font-semibold">Locations</h2>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Pickup Location</p>
                  <p className="font-medium">{reservation.pickup_location || 'Not specified'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Return Location</p>
                  <p className="font-medium">{reservation.return_location || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <hr className="my-6" />
          
          {/* Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <DollarSign className="text-gray-400 mr-2" size={20} />
                <h2 className="text-lg font-semibold">Payment Information</h2>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-gray-500">Daily Rate:</p>
                  <p className="font-medium">${reservation.daily_rate.toFixed(2)}</p>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-gray-500">Total Days:</p>
                  <p className="font-medium">{reservation.total_days}</p>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-gray-500">Deposit Amount:</p>
                  <p className="font-medium">${reservation.deposit_amount.toFixed(2)}</p>
                </div>
                
                <div className="flex justify-between border-t pt-2">
                  <p className="text-gray-700 font-medium">Total Amount:</p>
                  <p className="font-bold text-lg">${reservation.total_amount.toFixed(2)}</p>
                </div>
                
                <div className="flex justify-between mt-2">
                  <p className="text-gray-500">Payment Status:</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    reservation.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                    reservation.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {reservation.payment_status === 'paid' ? 'Paid' :
                     reservation.payment_status === 'partial' ? 'Partially Paid' :
                     'Unpaid'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Notes */}
            <div className="space-y-4">
              <div className="flex items-center">
                <FileText className="text-gray-400 mr-2" size={20} />
                <h2 className="text-lg font-semibold">Notes</h2>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
                {reservation.notes ? (
                  <p className="text-gray-700">{reservation.notes}</p>
                ) : (
                  <p className="text-gray-400 italic">No notes provided</p>
                )}
              </div>
            </div>
          </div>
          
          <hr className="my-6" />
          
          {/* Status Management */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Reservation Status Management</h2>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateReservationStatus('pending')}
                disabled={reservation.status === 'pending' || isUpdatingStatus}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  reservation.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800 cursor-default' 
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                } disabled:opacity-50`}
              >
                Mark as Pending
              </button>
              
              <button
                onClick={() => updateReservationStatus('confirmed')}
                disabled={reservation.status === 'confirmed' || isUpdatingStatus}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  reservation.status === 'confirmed' 
                    ? 'bg-blue-100 text-blue-800 cursor-default' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } disabled:opacity-50`}
              >
                Confirm Reservation
              </button>
              
              <button
                onClick={() => updateReservationStatus('active')}
                disabled={reservation.status === 'active' || isUpdatingStatus}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  reservation.status === 'active' 
                    ? 'bg-green-100 text-green-800 cursor-default' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                } disabled:opacity-50`}
              >
                Mark as Active
              </button>
              
              <button
                onClick={() => updateReservationStatus('completed')}
                disabled={reservation.status === 'completed' || isUpdatingStatus}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  reservation.status === 'completed' 
                    ? 'bg-gray-100 text-gray-800 cursor-default' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                } disabled:opacity-50`}
              >
                Mark as Completed
              </button>
              
              <button
                onClick={() => updateReservationStatus('cancelled')}
                disabled={reservation.status === 'cancelled' || isUpdatingStatus}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  reservation.status === 'cancelled' 
                    ? 'bg-red-100 text-red-800 cursor-default' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                } disabled:opacity-50`}
              >
                Cancel Reservation
              </button>
            </div>
            
            {isUpdatingStatus && (
              <div className="flex items-center text-blue-600">
                <Loader2 size={18} className="animate-spin mr-2" />
                Updating status...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 