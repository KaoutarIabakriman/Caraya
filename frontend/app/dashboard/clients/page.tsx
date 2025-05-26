'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Eye, User, AlertCircle, Search, Loader2, Users } from 'lucide-react';
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
        className="flex justify-between items-center mb-8"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2 flex items-center">
            <Users className="mr-3 text-gold" size={28} />
            <span className="text-white">Client <span className="text-gold">Management</span></span>
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-gold to-gold/50"></div>
        </div>
        <Link 
          href="/dashboard/clients/add" 
          className="flex items-center gap-2 bg-gradient-to-r from-gold to-amber-500 hover:from-gold hover:to-amber-400 text-black px-4 py-2 rounded-md transition-all duration-300 font-medium"
        >
          <PlusCircle size={18} />
          <span>Add New Client</span>
        </Link>
      </motion.div>
      
      {error && (
        <motion.div 
          variants={itemVariants}
          className="bg-red-900/20 border-l-4 border-red-500 text-red-400 p-4 mb-6 rounded-r-md"
        >
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <p>{error}</p>
          </div>
        </motion.div>
      )}
      
      {/* Search Bar */}
      <motion.div 
        className="mb-6"
        variants={itemVariants}
      >
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
              className="block w-full pl-10 pr-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-gold focus:border-gold"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-800 text-gold border border-gold/30 rounded-md hover:bg-gold/10 transition-colors"
          >
            Search
          </button>
        </form>
      </motion.div>
      
      {clients.length === 0 ? (
        <motion.div 
          variants={itemVariants}
          className="text-center py-16 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm"
        >
          <User className="mx-auto h-16 w-16 text-gold/60" />
          <h3 className="mt-4 text-xl font-medium text-white font-serif">No clients found</h3>
          <p className="mt-2 text-gray-400">Get started by adding a new client.</p>
          <div className="mt-6">
            <Link 
              href="/dashboard/clients/add" 
              className="inline-flex items-center px-5 py-2.5 border border-gold/30 shadow-lg text-sm font-medium rounded-md text-gold hover:text-black hover:bg-gold transition-colors duration-300"
            >
              <PlusCircle className="mr-2 h-5 w-5" aria-hidden="true" />
              Add New Client
            </Link>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div 
            variants={itemVariants}
            className="overflow-x-auto"
          >
            <table className="min-w-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg overflow-hidden shadow-lg border border-white/10">
              <thead className="bg-gray-900/50 text-gray-300 border-b border-white/10">
                <tr>
                  <th className="py-4 px-4 text-left font-medium">Name</th>
                  <th className="py-4 px-4 text-left font-medium">Email</th>
                  <th className="py-4 px-4 text-left font-medium">Phone</th>
                  <th className="py-4 px-4 text-left font-medium">Driver License</th>
                  <th className="py-4 px-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clients.map((client) => (
                  <tr key={client._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-white">{client.full_name}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-300">{client.email}</td>
                    <td className="py-4 px-4 text-gray-300">{client.phone}</td>
                    <td className="py-4 px-4 text-gray-300">{client.driver_license || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center space-x-2">
                        <Link href={`/dashboard/clients/${client._id}`}>
                          <button className="p-2 rounded-full hover:bg-white/10 transition-colors" title="View Details">
                            <Eye size={18} className="text-blue-400 hover:text-blue-300" />
                          </button>
                        </Link>
                        <Link href={`/dashboard/clients/edit/${client._id}`}>
                          <button className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Edit Client">
                            <Edit size={18} className="text-green-400 hover:text-green-300" />
                          </button>
                        </Link>
                        <button 
                          className="p-2 rounded-full hover:bg-white/10 transition-colors" 
                          title="Delete Client"
                          onClick={() => handleDelete(client._id)}
                        >
                          <Trash2 size={18} className="text-red-400 hover:text-red-300" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
          
          {/* Pagination */}
          <motion.div 
            variants={itemVariants}
            className="mt-6 flex items-center justify-between"
          >
            <div className="text-sm text-gray-300">
              Showing <span className="font-medium text-gold">{clients.length}</span> of{' '}
              <span className="font-medium text-gold">{totalClients}</span> clients
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-white/10 rounded-md disabled:opacity-50 text-gray-300 hover:bg-white/5 transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 border border-white/10 rounded-md bg-gray-800/50 text-gold">
                {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-white/10 rounded-md disabled:opacity-50 text-gray-300 hover:bg-white/5 transition-colors"
              >
                Next
              </button>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
} 