'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Calendar, Car } from 'lucide-react';

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

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <Link 
            href="/dashboard/clients" 
            className="text-blue-600 hover:underline"
          >
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p>Client not found</p>
        </div>
        <div className="mt-4">
          <Link 
            href="/dashboard/clients" 
            className="text-blue-600 hover:underline"
          >
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link 
          href="/dashboard/clients" 
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft size={18} />
          <span>Back to Clients</span>
        </Link>
        <Link 
          href={`/dashboard/clients/edit/${params.id}`} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          <Edit size={18} />
          <span>Edit Client</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">{client.full_name}</h1>
          <p className="text-gray-600 mt-2">Client ID: {client._id}</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{client.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p className="font-medium">{client.emergency_contact || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-bold mb-4">Personal Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Driver License</p>
                  <p className="font-medium">{client.driver_license || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{formatDate(client.date_of_birth)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Client Since</p>
                  <p className="font-medium">{formatDate(client.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{formatDate(client.updated_at)}</p>
                </div>
              </div>
            </div>
            
            {/* Notes */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <h2 className="text-xl font-bold mb-4">Notes</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="whitespace-pre-wrap">{client.notes || 'No notes available.'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Rental History */}
        <div className="p-6 border-t border-gray-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar size={20} />
            <span>Rental History</span>
          </h2>
          
          {rentalHistory.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Car className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No rental history</h3>
              <p className="mt-1 text-gray-500">This client hasn't rented any cars yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Car</th>
                    <th className="py-3 px-4 text-left">Start Date</th>
                    <th className="py-3 px-4 text-left">End Date</th>
                    <th className="py-3 px-4 text-left">Total Cost</th>
                    <th className="py-3 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rentalHistory.map((rental) => (
                    <tr key={rental.record_id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Link 
                          href={`/dashboard/cars/${rental.car_id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {rental.car_name}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{formatDate(rental.start_date)}</td>
                      <td className="py-3 px-4">{formatDate(rental.end_date)}</td>
                      <td className="py-3 px-4">${rental.total_cost?.toFixed(2) || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rental.status === 'completed' ? 'bg-green-100 text-green-800' :
                          rental.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          rental.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {rental.status?.charAt(0).toUpperCase() + rental.status?.slice(1) || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 