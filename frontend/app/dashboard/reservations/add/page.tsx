"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ReservationForm from '@/components/ReservationForm';

export default function AddReservationPage() {
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
        
        <h1 className="text-2xl font-bold">Create New Reservation</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <ReservationForm />
      </div>
    </div>
  );
} 