'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Calendar, Car, Loader2, AlertCircle, User, Mail, Phone, MapPin, Contact, FileText, Clock, CreditCard, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// Define client type
type Client = {
  _id: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  driver_license?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

// Define rental history type
type RentalRecord = {
  car_id: string;
  car_name: string;
  start_date: string;
  end_date: string;
  total_cost: number;
  status: string;
  record_id: string;
};

export default function ClientDetailsPage({ params }: { params: { id: string } }) {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [rentalHistory, setRentalHistory] = useState<RentalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Fetch client details and rental history when component mounts
    if (isAuthenticated && token) {
      fetchClientDetails();
      fetchRentalHistory();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/clients/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setClient(response.data.client);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching client details:', error);
      setError(error.response?.data?.message || 'Failed to fetch client details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRentalHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/clients/${params.id}/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setRentalHistory(response.data.rental_history || []);
    } catch (error: any) {
      console.error('Error fetching rental history:', error);
      // We don't set the main error state here to avoid blocking the client details display
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900/30 text-green-400 border border-green-500/30';
      case 'completed':
        return 'bg-blue-900/30 text-blue-400 border border-blue-500/30';
      case 'cancelled':
        return 'bg-red-900/30 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-800/50 text-gray-300 border border-gray-700';
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/20 border-l-4 border-red-500 text-red-400 p-4 rounded-r-md">
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <p>{error}</p>
          </div>
        </div>
        <div className="mt-4">
          <Link 
            href="/dashboard/clients" 
            className="flex items-center gap-2 text-gold hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Clients</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-400 p-4 rounded-r-md">
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <p>Client not found</p>
          </div>
        </div>
        <div className="mt-4">
          <Link 
            href="/dashboard/clients" 
            className="flex items-center gap-2 text-gold hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Clients</span>
          </Link>
        </div>
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
        className="mb-6 flex items-center justify-between"
        variants={itemVariants}
      >
        <Link 
          href="/dashboard/clients" 
          className="flex items-center gap-2 text-gold hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Clients</span>
        </Link>
        
        <Link 
          href={`/dashboard/clients/edit/${params.id}`} 
          className="flex items-center gap-2 bg-gradient-to-r from-gold to-amber-500 hover:from-gold hover:to-amber-400 text-black px-4 py-2 rounded-md transition-all duration-300 font-medium"
        >
          <Edit size={18} />
          <span>Edit Client</span>
        </Link>
      </motion.div>
      
      <motion.div 
        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm overflow-hidden"
        variants={itemVariants}
      >
        <div className="p-6 border-b border-white/10">
          <h1 className="text-3xl font-bold font-serif text-white flex items-center">
            <User className="mr-3 text-gold" size={28} />
            <span className="text-gold">{client.full_name}</span>
          </h1>
          <p className="text-gray-400 mt-2">Client ID: {client._id}</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
                <Mail className="mr-2 text-gold" size={20} />
                Contact Information
              </h2>
              <div className="space-y-4 bg-gray-900/30 p-4 rounded-md border border-white/5">
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium text-white flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    {client.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="font-medium text-white flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    {client.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="font-medium text-white flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    {client.address || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Emergency Contact</p>
                  <p className="font-medium text-white flex items-center">
                    <Contact className="w-4 h-4 mr-2 text-gray-500" />
                    {client.emergency_contact || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
                <UserCheck className="mr-2 text-gold" size={20} />
                Personal Information
              </h2>
              <div className="space-y-4 bg-gray-900/30 p-4 rounded-md border border-white/5">
                <div>
                  <p className="text-sm text-gray-400">Driver License</p>
                  <p className="font-medium text-white flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                    {client.driver_license || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date of Birth</p>
                  <p className="font-medium text-white flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    {formatDate(client.date_of_birth)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Client Since</p>
                  <p className="font-medium text-white flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    {formatDate(client.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Last Updated</p>
                  <p className="font-medium text-white flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    {formatDate(client.updated_at)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Notes */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
                <FileText className="mr-2 text-gold" size={20} />
                Notes
              </h2>
              <div className="bg-gray-900/30 p-4 rounded-md border border-white/5">
                <p className="whitespace-pre-wrap text-gray-300">{client.notes || 'No notes available.'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Rental History */}
        <div className="p-6 border-t border-white/10">
          <h2 className="text-xl font-bold font-serif mb-4 flex items-center text-white">
            <Calendar className="mr-2 text-gold" size={20} />
            <span>Rental History</span>
          </h2>
          
          {rentalHistory.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/30 rounded-md border border-white/5">
              <Car className="mx-auto h-16 w-16 text-gold/60" />
              <h3 className="mt-4 text-xl font-medium text-white font-serif">No rental history</h3>
              <p className="mt-2 text-gray-400">This client hasn't rented any cars yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-900/50 rounded-lg overflow-hidden border border-white/10">
                <thead className="text-gray-300">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium">Car</th>
                    <th className="py-3 px-4 text-left font-medium">Start Date</th>
                    <th className="py-3 px-4 text-left font-medium">End Date</th>
                    <th className="py-3 px-4 text-left font-medium">Total Cost</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rentalHistory.map((rental) => (
                    <tr key={rental.record_id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{rental.car_name}</td>
                      <td className="py-3 px-4 text-gray-300">{formatDate(rental.start_date)}</td>
                      <td className="py-3 px-4 text-gray-300">{formatDate(rental.end_date)}</td>
                      <td className="py-3 px-4 text-gold font-medium">${rental.total_cost.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                          {rental.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
} 