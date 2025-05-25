'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Edit, Car as CarIcon, Tag, Fuel, Settings, Users, Info, FileText } from 'lucide-react';

// Define car type with all fields
type Car = {
  _id: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  availability_status: string;
  features: string[];
  images: string[];
  description: string;
  fuel_type: string;
  transmission: string;
  seats: number;
  color: string;
  license_plate: string;
  mileage: number;
  insurance_info: Record<string, any>;
  maintenance_status: string;
  current_renter_id: string | null;
  rental_history: RentalRecord[];
  created_at: string;
  updated_at: string;
};

type RentalRecord = {
  record_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  total_cost: number;
  status: string;
  created_at: string;
};

export default function CarDetailsPage({ params }: { params: { id: string } }) {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Fetch car details when component mounts
    if (isAuthenticated && token) {
      fetchCarDetails();
    }
  }, [isAuthenticated, token, params.id]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/cars/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCar(response.data.car);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching car details:', error);
      setError(error.response?.data?.message || 'Failed to fetch car details');
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (error || !car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error || 'Car not found'}</p>
        </div>
        <Link 
          href="/dashboard/cars" 
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft size={18} />
          <span>Back to Cars</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link 
          href="/dashboard/cars" 
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft size={18} />
          <span>Back to Cars</span>
        </Link>
        
        <Link 
          href={`/dashboard/cars/edit/${car._id}`} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          <Edit size={18} />
          <span>Edit Car</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Car Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{car.brand} {car.model}</h1>
              <p className="text-gray-500 mt-1">
                {car.year} • {car.color} • License: {car.license_plate}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(car.availability_status)}`}>
                {car.availability_status}
              </span>
              <p className="mt-2 text-2xl font-bold text-blue-600">${car.price_per_day}/day</p>
            </div>
          </div>
        </div>
        
        {/* Car Images */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col">
            <div className="relative h-80 w-full rounded-lg overflow-hidden mb-4">
              {car.images && car.images.length > 0 ? (
                <Image 
                  src={getFullImageUrl(car.images[activeImageIndex])} 
                  alt={`${car.brand} ${car.model}`} 
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200">
                  <CarIcon className="text-gray-400" size={48} />
                </div>
              )}
            </div>
            
            {car.images && car.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {car.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`h-20 w-32 relative rounded-md overflow-hidden cursor-pointer ${index === activeImageIndex ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <Image 
                      src={getFullImageUrl(image)} 
                      alt={`${car.brand} ${car.model} thumbnail ${index + 1}`} 
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Car Details */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Info className="mr-2" size={20} />
              Basic Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Brand</p>
                <p className="font-medium">{car.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Model</p>
                <p className="font-medium">{car.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Year</p>
                <p className="font-medium">{car.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Color</p>
                <p className="font-medium">{car.color}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">License Plate</p>
                <p className="font-medium">{car.license_plate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mileage</p>
                <p className="font-medium">{car.mileage.toLocaleString()} km</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Settings className="mr-2" size={20} />
              Technical Specifications
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Fuel Type</p>
                <p className="font-medium">{car.fuel_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Transmission</p>
                <p className="font-medium">{car.transmission || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Seats</p>
                <p className="font-medium">{car.seats || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Maintenance Status</p>
                <p className="font-medium">{car.maintenance_status}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Car Description */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FileText className="mr-2" size={20} />
            Description
          </h2>
          <p className="text-gray-700">{car.description || 'No description available.'}</p>
        </div>
        
        {/* Car Features */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Tag className="mr-2" size={20} />
            Features
          </h2>
          {car.features && car.features.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {car.features.map((feature, index) => (
                <div key={index} className="bg-gray-100 px-3 py-2 rounded-md text-sm">
                  {feature}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No features listed.</p>
          )}
        </div>
        
        {/* Rental History */}
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Calendar className="mr-2" size={20} />
            Rental History
          </h2>
          {car.rental_history && car.rental_history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Renter ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {car.rental_history.map((record) => (
                    <tr key={record.record_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.renter_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(record.start_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(record.end_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${record.total_cost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'active' ? 'bg-green-100 text-green-800' : 
                          record.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No rental history available.</p>
          )}
        </div>
      </div>
    </div>
  );
} 