"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { Reservation } from '@/types/reservation';
import ReservationForm from '@/components/ReservationForm';
import { ArrowLeft, Loader2, CalendarDays, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <Loader2 size={40} className="animate-spin text-gold" />
      </div>
    );
  }
  
  if (error || !reservation) {
    return (
      <div className="bg-red-900/20 border-l-4 border-red-500 text-red-400 p-4 rounded-r-md">
        <p>{error || 'Reservation not found'}</p>
        <Link 
          href="/dashboard/reservations" 
          className="mt-4 inline-flex items-center text-gold hover:text-white transition-colors"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back to Reservations
        </Link>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <Link 
            href="/dashboard/reservations" 
            className="flex items-center gap-2 text-gold hover:text-white transition-colors mb-2"
          >
            <ArrowLeft size={18} />
            <span>Back to Reservations</span>
          </Link>
          
          <h1 className="text-3xl font-bold font-serif flex items-center">
            <Edit className="mr-3 text-gold" size={28} />
            <span className="text-white">Edit <span className="text-gold">Reservation</span></span>
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-gold to-gold/50 mt-2"></div>
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm p-6"
        variants={itemVariants}
      >
        <ReservationForm reservation={reservation} isEdit={true} />
      </motion.div>
    </motion.div>
  );
} 