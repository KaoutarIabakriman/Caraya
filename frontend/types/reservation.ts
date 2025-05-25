import { Client } from './client';
import { Car } from './car';

export type ReservationStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Reservation {
  _id: string;
  client_id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  total_amount: number;
  status: ReservationStatus;
  pickup_location?: string;
  return_location?: string;
  deposit_amount: number;
  payment_status: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Populated fields (not in the database model)
  client?: Client;
  car?: Car;
}

export interface ReservationFormData {
  client_id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  pickup_location?: string;
  return_location?: string;
  deposit_amount?: number;
  payment_status?: PaymentStatus;
  status?: ReservationStatus;
  notes?: string;
}

export interface AvailabilityCheckResponse {
  available: boolean;
  message: string;
  pricing?: {
    daily_rate: number;
    total_days: number;
    total_amount: number;
  };
  conflicts?: Array<{
    reservation_id: string;
    start_date: string;
    end_date: string;
    status: ReservationStatus;
  }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status: ReservationStatus;
  client_id: string;
  car_id: string;
  client_name: string;
  car_info: string;
}

export interface ReservationStats {
  total_revenue: number;
  completed_count: number;
  status_counts: {
    pending: number;
    confirmed: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  overdue_rentals: {
    count: number;
    rentals: Array<{
      reservation_id: string;
      client_name: string;
      client_id: string;
      car_info: string;
      car_id: string;
      end_date: string;
      days_overdue: number;
    }>;
  };
  upcoming_reservations: {
    count: number;
    reservations: Array<{
      reservation_id: string;
      client_name: string;
      car_info: string;
      start_date: string;
      status: ReservationStatus;
      days_until: number;
    }>;
  };
} 