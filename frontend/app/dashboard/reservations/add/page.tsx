"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import ReservationForm from '@/components/ReservationForm';
import { motion } from 'framer-motion';

export default function AddReservationPage() {
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
            <CalendarDays className="mr-3 text-gold" size={28} />
            <span className="text-white">Create New <span className="text-gold">Reservation</span></span>
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-gold to-gold/50 mt-2"></div>
        </div>
      </motion.div>
      
      <motion.div 
        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm p-6"
        variants={itemVariants}
      >
        <ReservationForm />
      </motion.div>
    </motion.div>
  );
} 