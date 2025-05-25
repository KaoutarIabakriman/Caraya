'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define form schema
const clientSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().optional(),
  driver_license: z.string().optional(),
  date_of_birth: z.string().optional(),
  emergency_contact: z.string().optional(),
  notes: z.string().optional()
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function AddClientPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      address: '',
      driver_license: '',
      date_of_birth: '',
      emergency_contact: '',
      notes: ''
    }
  });

  // Handle form submission
  const onSubmit = async (data: ClientFormData) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Submit to API
      const response = await axios.post('http://localhost:5000/api/clients', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Redirect to client details page
      router.push(`/dashboard/clients/${response.data.client._id}`);
    } catch (err: any) {
      console.error('Error creating client:', err);
      setError(err.response?.data?.message || 'Failed to create client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Link 
          href="/dashboard/clients" 
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft size={18} />
          <span>Back to Clients</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Add New Client</h1>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {error && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
              <p>{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            </div>
            
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="full_name"
                type="text"
                className={`w-full px-3 py-2 border rounded-md ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                type="email"
                className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                id="phone"
                type="tel"
                className={`w-full px-3 py-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            
            {/* Date of Birth */}
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                id="date_of_birth"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...register('date_of_birth')}
              />
            </div>
            
            {/* Additional Information */}
            <div className="col-span-1 md:col-span-2 mt-6">
              <h2 className="text-xl font-bold mb-4">Additional Information</h2>
            </div>
            
            {/* Address */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...register('address')}
              ></textarea>
            </div>
            
            {/* Driver License */}
            <div>
              <label htmlFor="driver_license" className="block text-sm font-medium text-gray-700 mb-1">
                Driver License
              </label>
              <input
                id="driver_license"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...register('driver_license')}
              />
            </div>
            
            {/* Emergency Contact */}
            <div>
              <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact
              </label>
              <input
                id="emergency_contact"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...register('emergency_contact')}
              />
            </div>
            
            {/* Notes */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                {...register('notes')}
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-8">
            <Link 
              href="/dashboard/clients" 
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 