"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { Reservation } from '@/types/reservation';
import ReservationForm from '@/components/ReservationForm';
import { ChevronLeft, Loader2 } from 'lucide-react';

interface EditReservationPageProps {
  params: {
    id: string;
  };
}

export default function EditReservationPage({ params }: EditReservationPageProps) {
  const router = useRouter();
  const { token } = useAuth();
  const { id } = params;
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchReservation();
  }, [id, token]);
  
  const fetchReservation = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:5000/api/reservations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setReservation(response.data.reservation);
    } catch (err: any) {
      console.error('Error fetching reservation:', err);
      setError(err.response?.data?.message || 'Failed to load reservation');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (error || !reservation) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">{error || 'Reservation not found'}</p>
        <Link 
          href="/dashboard/reservations" 
          className="mt-4 inline-flex items-center text-blue-500 hover:text-blue-700"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Reservations
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/reservations" 
          className="inline-flex items-center text-blue-500 hover:text-blue-700"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Reservations
        </Link>
        
        <h1 className="text-2xl font-bold">Edit Reservation</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <ReservationForm reservation={reservation} isEdit={true} />
      </div>
    </div>
  );
} 