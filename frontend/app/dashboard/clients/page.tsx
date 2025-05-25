'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Eye, User, AlertCircle, Search } from 'lucide-react';

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
};

export default function ClientsPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const perPage = 10;

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Fetch clients when component mounts or search/page changes
    if (isAuthenticated && token) {
      fetchClients();
    }
  }, [isAuthenticated, token, search, page]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/clients?search=${search}&page=${page}&per_page=${perPage}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setClients(response.data.clients);
      setTotalPages(response.data.pages);
      setTotalClients(response.data.total);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      setError(error.response?.data?.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/clients/${clientId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh clients list
      fetchClients();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      alert(error.response?.data?.message || 'Failed to delete client');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients();
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Client Management</h1>
        <Link 
          href="/dashboard/clients/add" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          <PlusCircle size={18} />
          <span>Add New Client</span>
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>
      </div>
      
      {clients.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No clients found</h3>
          <p className="mt-1 text-gray-500">Get started by adding a new client.</p>
          <div className="mt-6">
            <Link 
              href="/dashboard/clients/add" 
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add New Client
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Phone</th>
                  <th className="py-3 px-4 text-left">Driver License</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{client.full_name}</div>
                    </td>
                    <td className="py-4 px-4">{client.email}</td>
                    <td className="py-4 px-4">{client.phone}</td>
                    <td className="py-4 px-4">{client.driver_license || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center space-x-2">
                        <Link href={`/dashboard/clients/${client._id}`}>
                          <button className="p-1 rounded-full hover:bg-gray-200" title="View Details">
                            <Eye size={18} className="text-blue-600" />
                          </button>
                        </Link>
                        <Link href={`/dashboard/clients/edit/${client._id}`}>
                          <button className="p-1 rounded-full hover:bg-gray-200" title="Edit Client">
                            <Edit size={18} className="text-green-600" />
                          </button>
                        </Link>
                        <button 
                          className="p-1 rounded-full hover:bg-gray-200" 
                          title="Delete Client"
                          onClick={() => handleDelete(client._id)}
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{clients.length}</span> of{' '}
              <span className="font-medium">{totalClients}</span> clients
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 border rounded-md bg-gray-100">
                {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 