export interface Car {
  _id: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  availability_status: 'available' | 'maintenance' | 'rented';
  features: string[];
  images: string[];
  description?: string;
  fuel_type?: string;
  transmission?: string;
  seats?: number;
  color?: string;
  license_plate?: string;
  mileage?: number;
  insurance_info?: Record<string, any>;
  maintenance_status?: string;
  current_renter_id?: string | null;
  rental_history?: Array<{
    client_id: string;
    reservation_id: string;
    start_date: string;
    end_date: string;
    status: string;
  }>;
  created_at: string;
  updated_at: string;
} 