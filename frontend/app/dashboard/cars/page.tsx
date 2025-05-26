'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Eye, Car, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Define car type
type Car = {
  _id: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  availability_status: string;
  images: string[];
  color: string;
  license_plate: string;
  current_renter_id: string | null;
  maintenance_status: string;
};

export default function CarsPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
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
    // Fetch cars when component mounts
    if (isAuthenticated && token) {
      fetchCars();
    }
  }, [isAuthenticated, token]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/cars', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCars(response.data.cars);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching cars:', error);
      setError(error.response?.data?.message || 'Failed to fetch cars');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/cars/${carId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh cars list
      fetchCars();
    } catch (error: any) {
      console.error('Error deleting car:', error);
      alert(error.response?.data?.message || 'Failed to delete car');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-900/30 text-green-400 border border-green-500/30';
      case 'rented':
        return 'bg-blue-900/30 text-blue-400 border border-blue-500/30';
      case 'maintenance':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30';
      default:
        return 'bg-gray-800/50 text-gray-300 border border-gray-700';
    }
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-900/30 text-green-400 border border-green-500/30';
      case 'needs_attention':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30';
      case 'critical':
        return 'bg-red-900/30 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-800/50 text-gray-300 border border-gray-700';
    }
  };

  // Function to ensure image URLs are properly formatted
  const getFullImageUrl = (url: string) => {
    if (url.startsWith('http')) {
      return url;
    } else if (url.startsWith('/uploads/')) {
      return `http://localhost:5000${url}`;
    } else {
      return url;
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
        className="flex justify-between items-center mb-8"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2 flex items-center">
            <Car className="mr-3 text-gold" size={28} />
            <span className="text-white">Car <span className="text-gold">Management</span></span>
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-gold to-gold/50"></div>
        </div>
        <Link 
          href="/dashboard/cars/add" 
          className="flex items-center gap-2 bg-gradient-to-r from-gold to-amber-500 hover:from-gold hover:to-amber-400 text-black px-4 py-2 rounded-md transition-all duration-300 font-medium"
        >
          <PlusCircle size={18} />
          <span>Add New Car</span>
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
      
      {cars.length === 0 ? (
        <motion.div 
          variants={itemVariants}
          className="text-center py-16 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm"
        >
          <Car className="mx-auto h-16 w-16 text-gold/60" />
          <h3 className="mt-4 text-xl font-medium text-white font-serif">No cars found</h3>
          <p className="mt-2 text-gray-400">Get started by adding a new car to your fleet.</p>
          <div className="mt-6">
            <Link 
              href="/dashboard/cars/add" 
              className="inline-flex items-center px-5 py-2.5 border border-gold/30 shadow-lg text-sm font-medium rounded-md text-gold hover:text-black hover:bg-gold transition-colors duration-300"
            >
              <PlusCircle className="mr-2 h-5 w-5" aria-hidden="true" />
              Add New Car
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          variants={itemVariants}
          className="overflow-x-auto"
        >
          <table className="min-w-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg overflow-hidden shadow-lg border border-white/10">
            <thead className="bg-gray-900/50 text-gray-300 border-b border-white/10">
              <tr>
                <th className="py-4 px-4 text-left font-medium">Image</th>
                <th className="py-4 px-4 text-left font-medium">Brand & Model</th>
                <th className="py-4 px-4 text-left font-medium">Year</th>
                <th className="py-4 px-4 text-left font-medium">Price/Day</th>
                <th className="py-4 px-4 text-left font-medium">Status</th>
                <th className="py-4 px-4 text-left font-medium">License Plate</th>
                <th className="py-4 px-4 text-left font-medium">Maintenance</th>
                <th className="py-4 px-4 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {cars.map((car) => (
                <tr key={car._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4">
                    <div className="h-16 w-24 relative rounded-md overflow-hidden border border-white/10">
                      {car.images && car.images.length > 0 ? (
                        <Image 
                          src={getFullImageUrl(car.images[0])} 
                          alt={`${car.brand} ${car.model}`} 
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-800">
                          <Car className="text-gray-600" size={24} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-white">{car.brand}</div>
                    <div className="text-gray-400">{car.model}</div>
                  </td>
                  <td className="py-4 px-4 text-gray-300">{car.year}</td>
                  <td className="py-4 px-4 text-gold font-medium">${car.price_per_day}/day</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(car.availability_status)}`}>
                      {car.availability_status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-300">{car.license_plate}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMaintenanceStatusColor(car.maintenance_status)}`}>
                      {car.maintenance_status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center space-x-2">
                      <Link href={`/dashboard/cars/${car._id}`}>
                        <button className="p-2 rounded-full hover:bg-white/10 transition-colors" title="View Details">
                          <Eye size={18} className="text-blue-400 hover:text-blue-300" />
                        </button>
                      </Link>
                      <Link href={`/dashboard/cars/edit/${car._id}`}>
                        <button className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Edit Car">
                          <Edit size={18} className="text-green-400 hover:text-green-300" />
                        </button>
                      </Link>
                      <button 
                        className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50" 
                        title="Delete Car"
                        onClick={() => handleDelete(car._id)}
                        disabled={car.availability_status === 'rented'}
                      >
                        <Trash2 size={18} className={car.availability_status === 'rented' ? 'text-gray-600' : 'text-red-400 hover:text-red-300'} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
} 