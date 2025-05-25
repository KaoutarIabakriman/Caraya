export interface Client {
  _id: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  driver_license?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
} 