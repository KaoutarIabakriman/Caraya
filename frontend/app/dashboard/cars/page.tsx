'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Eye, Car, AlertCircle } from 'lucide-react';

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
        return 'bg-green-100 text-green-800';
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'needs_attention':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Car Management</h1>
        <Link 
          href="/dashboard/cars/add" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          <PlusCircle size={18} />
          <span>Add New Car</span>
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
      
      {cars.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No cars found</h3>
          <p className="mt-1 text-gray-500">Get started by adding a new car.</p>
          <div className="mt-6">
            <Link 
              href="/dashboard/cars/add" 
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add New Car
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Image</th>
                <th className="py-3 px-4 text-left">Brand & Model</th>
                <th className="py-3 px-4 text-left">Year</th>
                <th className="py-3 px-4 text-left">Price/Day</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">License Plate</th>
                <th className="py-3 px-4 text-left">Maintenance</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cars.map((car) => (
                <tr key={car._id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="h-16 w-24 relative rounded-md overflow-hidden">
                      {car.images && car.images.length > 0 ? (
                        <Image 
                          src={getFullImageUrl(car.images[0])} 
                          alt={`${car.brand} ${car.model}`} 
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-200">
                          <Car className="text-gray-400" size={24} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{car.brand}</div>
                    <div className="text-gray-500">{car.model}</div>
                  </td>
                  <td className="py-4 px-4">{car.year}</td>
                  <td className="py-4 px-4">${car.price_per_day}/day</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(car.availability_status)}`}>
                      {car.availability_status}
                    </span>
                  </td>
                  <td className="py-4 px-4">{car.license_plate}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMaintenanceStatusColor(car.maintenance_status)}`}>
                      {car.maintenance_status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center space-x-2">
                      <Link href={`/dashboard/cars/${car._id}`}>
                        <button className="p-1 rounded-full hover:bg-gray-200" title="View Details">
                          <Eye size={18} className="text-blue-600" />
                        </button>
                      </Link>
                      <Link href={`/dashboard/cars/edit/${car._id}`}>
                        <button className="p-1 rounded-full hover:bg-gray-200" title="Edit Car">
                          <Edit size={18} className="text-green-600" />
                        </button>
                      </Link>
                      <button 
                        className="p-1 rounded-full hover:bg-gray-200" 
                        title="Delete Car"
                        onClick={() => handleDelete(car._id)}
                        disabled={car.availability_status === 'rented'}
                      >
                        <Trash2 size={18} className={car.availability_status === 'rented' ? 'text-gray-400' : 'text-red-600'} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 