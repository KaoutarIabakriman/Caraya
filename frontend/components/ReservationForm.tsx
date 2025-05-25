import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { Reservation, ReservationFormData, ReservationStatus, PaymentStatus } from '@/types/reservation';
import { Client } from '@/types/client';
import { Car } from '@/types/car';
import ClientSelector from './ClientSelector';
import CarSelector from './CarSelector';
import DateRangePicker from './DateRangePicker';
import { Loader2, Save, AlertCircle } from 'lucide-react';

interface ReservationFormProps {
  reservation?: Reservation;
  isEdit?: boolean;
}

export default function ReservationForm({ reservation, isEdit = false }: ReservationFormProps) {
  const router = useRouter();
  const { token } = useAuth();
  
  const [formData, setFormData] = useState<ReservationFormData>({
    client_id: '',
    car_id: '',
    start_date: '',
    end_date: '',
    pickup_location: '',
    return_location: '',
    deposit_amount: 0,
    payment_status: 'unpaid',
    status: 'pending',
    notes: ''
  });
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [pricing, setPricing] = useState<{
    daily_rate: number;
    total_days: number;
    total_amount: number;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Initialize form data if editing an existing reservation
  useEffect(() => {
    if (isEdit && reservation) {
      setFormData({
        client_id: reservation.client_id,
        car_id: reservation.car_id,
        start_date: reservation.start_date,
        end_date: reservation.end_date,
        pickup_location: reservation.pickup_location || '',
        return_location: reservation.return_location || '',
        deposit_amount: reservation.deposit_amount,
        payment_status: reservation.payment_status,
        status: reservation.status,
        notes: reservation.notes || ''
      });
      
      // Set pricing information
      setPricing({
        daily_rate: reservation.daily_rate,
        total_days: reservation.total_days,
        total_amount: reservation.total_amount
      });
      
      // Set selected client and car if available
      if (reservation.client) {
        setSelectedClient(reservation.client);
      }
      
      if (reservation.car) {
        setSelectedCar(reservation.car);
      }
    }
  }, [isEdit, reservation]);
  
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData(prev => ({
      ...prev,
      client_id: client._id
    }));
  };
  
  const handleCarSelect = (car: Car, carPricing?: { daily_rate: number; total_days: number; total_amount: number }) => {
    setSelectedCar(car);
    setFormData(prev => ({
      ...prev,
      car_id: car._id
    }));
    
    if (carPricing) {
      setPricing(carPricing);
    } else if (car && formData.start_date && formData.end_date) {
      // Calculate pricing based on selected car and dates
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      setPricing({
        daily_rate: car.price_per_day,
        total_days: days,
        total_amount: car.price_per_day * days
      });
    }
  };
  
  const handleDateChange = (startDate: string, endDate: string) => {
    setFormData(prev => ({
      ...prev,
      start_date: startDate,
      end_date: endDate
    }));
    
    // Update pricing if car is selected
    if (selectedCar && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      
      setPricing({
        daily_rate: selectedCar.price_per_day,
        total_days: days,
        total_amount: selectedCar.price_per_day * days
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'deposit_amount' ? parseFloat(value) : value
    }));
  };
  
  const validateForm = (): boolean => {
    if (!formData.client_id) {
      setError('Please select a client');
      return false;
    }
    
    if (!formData.car_id) {
      setError('Please select a car');
      return false;
    }
    
    if (!formData.start_date || !formData.end_date) {
      setError('Please select rental period');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isEdit && reservation) {
        // Update existing reservation
        const response = await axios.put(
          `http://localhost:5000/api/reservations/${reservation._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setSuccess('Reservation updated successfully');
        setTimeout(() => {
          router.push('/dashboard/reservations');
        }, 1500);
      } else {
        // Create new reservation
        const response = await axios.post(
          'http://localhost:5000/api/reservations',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setSuccess('Reservation created successfully');
        setTimeout(() => {
          router.push('/dashboard/reservations');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error saving reservation:', err);
      setError(err.response?.data?.message || 'Failed to save reservation');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client and Car Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ClientSelector
          onClientSelect={handleClientSelect}
          selectedClientId={formData.client_id}
        />
        
        <CarSelector
          onCarSelect={handleCarSelect}
          selectedCarId={formData.car_id}
          startDate={formData.start_date}
          endDate={formData.end_date}
          reservationId={isEdit ? reservation?._id : undefined}
        />
      </div>
      
      {/* Date Range Selection */}
      <DateRangePicker
        startDate={formData.start_date}
        endDate={formData.end_date}
        onDateChange={handleDateChange}
      />
      
      {/* Pricing Information */}
      {pricing && (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pricing</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Daily Rate</p>
              <p className="font-medium">${pricing.daily_rate.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Days</p>
              <p className="font-medium">{pricing.total_days}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium text-lg text-blue-600">${pricing.total_amount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Location Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Location
          </label>
          <input
            type="text"
            name="pickup_location"
            value={formData.pickup_location}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter pickup location"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Return Location
          </label>
          <input
            type="text"
            name="return_location"
            value={formData.return_location}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter return location"
          />
        </div>
      </div>
      
      {/* Payment Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deposit Amount
          </label>
          <input
            type="number"
            name="deposit_amount"
            value={formData.deposit_amount || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter deposit amount"
            min="0"
            step="0.01"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select
            name="payment_status"
            value={formData.payment_status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partially Paid</option>
            <option value="paid">Fully Paid</option>
          </select>
        </div>
      </div>
      
      {/* Reservation Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reservation Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add any additional notes here"
        ></textarea>
      </div>
      
      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 p-4 rounded-md flex items-start">
          <AlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 p-4 rounded-md">
          <p className="text-green-700">{success}</p>
        </div>
      )}
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 flex items-center"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin mr-2" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save size={20} className="mr-2" />
              {isEdit ? 'Update Reservation' : 'Create Reservation'}
            </>
          )}
        </button>
      </div>
    </form>
  );
} 