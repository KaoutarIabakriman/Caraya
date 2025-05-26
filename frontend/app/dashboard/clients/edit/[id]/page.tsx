'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Mail, Phone, Calendar, MapPin, CreditCard, Contact, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

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

export default function EditClientPage({ params }: { params: { id: string } }) {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Initialize form
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
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

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Fetch client data when component mounts
    if (isAuthenticated && token) {
      fetchClientData();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/clients/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const client = response.data.client;
      
      // Format date of birth for input field
      let formattedDateOfBirth = '';
      if (client.date_of_birth) {
        const date = new Date(client.date_of_birth);
        formattedDateOfBirth = date.toISOString().split('T')[0];
      }
      
      // Reset form with client data
      reset({
        full_name: client.full_name,
        email: client.email,
        phone: client.phone,
        address: client.address || '',
        driver_license: client.driver_license || '',
        date_of_birth: formattedDateOfBirth,
        emergency_contact: client.emergency_contact || '',
        notes: client.notes || ''
      });
      
      setError(null);
    } catch (error: any) {
      console.error('Error fetching client data:', error);
      setError(error.response?.data?.message || 'Failed to fetch client data');
    } finally {
      setLoading(false);
    }
  };

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
      await axios.put(`http://localhost:5000/api/clients/${params.id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Redirect to client details page
      router.push(`/dashboard/clients/${params.id}`);
    } catch (err: any) {
      console.error('Error updating client:', err);
      setError(err.response?.data?.message || 'Failed to update client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="mb-6 flex items-center"
        variants={itemVariants}
      >
        <Link 
          href={`/dashboard/clients/${params.id}`}
          className="flex items-center gap-2 text-gold hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Client Details</span>
        </Link>
      </motion.div>
      
      <motion.div 
        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm overflow-hidden"
        variants={itemVariants}
      >
        <div className="p-6 border-b border-white/10">
          <h1 className="text-3xl font-bold font-serif text-white flex items-center">
            <User className="mr-3 text-gold" size={28} />
            <span>Edit <span className="text-gold">Client</span></span>
          </h1>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {error && (
            <div className="mb-6 bg-red-900/20 border-l-4 border-red-500 text-red-400 p-4 rounded-r-md">
              <div className="flex items-center">
                <AlertCircle className="mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
                <User className="mr-2 text-gold" size={20} />
                Basic Information
              </h2>
            </div>
            
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                Full Name <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                id="full_name"
                type="text"
                className={`w-full px-3 py-2 bg-gray-900/50 text-white border rounded-md focus:ring-1 focus:ring-gold focus:border-gold ${errors.full_name ? 'border-red-500' : 'border-gray-700'}`}
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-400">{errors.full_name.message}</p>
              )}
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                <Mail size={16} className="mr-1 text-gray-400" />
                Email <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                id="email"
                type="email"
                className={`w-full px-3 py-2 bg-gray-900/50 text-white border rounded-md focus:ring-1 focus:ring-gold focus:border-gold ${errors.email ? 'border-red-500' : 'border-gray-700'}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                <Phone size={16} className="mr-1 text-gray-400" />
                Phone <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                className={`w-full px-3 py-2 bg-gray-900/50 text-white border rounded-md focus:ring-1 focus:ring-gold focus:border-gold ${errors.phone ? 'border-red-500' : 'border-gray-700'}`}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
              )}
            </div>
            
            {/* Date of Birth */}
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                <Calendar size={16} className="mr-1 text-gray-400" />
                Date of Birth
              </label>
              <input
                id="date_of_birth"
                type="date"
                className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                {...register('date_of_birth')}
              />
            </div>
            
            {/* Additional Information */}
            <div className="col-span-1 md:col-span-2 mt-6">
              <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
                <FileText className="mr-2 text-gold" size={20} />
                Additional Information
              </h2>
            </div>
            
            {/* Address */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                <MapPin size={16} className="mr-1 text-gray-400" />
                Address
              </label>
              <textarea
                id="address"
                rows={3}
                className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                {...register('address')}
              ></textarea>
            </div>
            
            {/* Driver License */}
            <div>
              <label htmlFor="driver_license" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                <CreditCard size={16} className="mr-1 text-gray-400" />
                Driver License
              </label>
              <input
                id="driver_license"
                type="text"
                className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                {...register('driver_license')}
              />
            </div>
            
            {/* Emergency Contact */}
            <div>
              <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                <Contact size={16} className="mr-1 text-gray-400" />
                Emergency Contact
              </label>
              <input
                id="emergency_contact"
                type="text"
                className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                {...register('emergency_contact')}
              />
            </div>
            
            {/* Notes */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                <FileText size={16} className="mr-1 text-gray-400" />
                Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
                {...register('notes')}
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-8 border-t border-white/10 pt-6">
            <Link 
              href={`/dashboard/clients/${params.id}`}
              className="px-4 py-2 border border-white/10 text-gray-300 rounded-md hover:bg-white/5 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-gold to-amber-500 hover:from-gold hover:to-amber-400 text-black rounded-md transition-all duration-300 disabled:opacity-50 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Update Client</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
} 