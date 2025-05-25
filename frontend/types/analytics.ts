import { ReservationStatus, PaymentStatus } from './reservation';

export interface DashboardMetrics {
  total_cars: number;
  available_cars: number;
  total_clients: number;
  active_reservations: number;
  pending_reservations: number;
  total_revenue: number;
  recent_reservations: RecentReservation[];
  period: {
    start_date: string;
    end_date: string;
  };
}

export interface RecentReservation {
  id: string;
  client_name: string;
  car_info: string;
  start_date: string;
  end_date: string;
  status: ReservationStatus;
  total_amount: number;
}

export interface ReservationAnalytics {
  bookings_by_month: {
    month: string;
    count: number;
  }[];
  popular_cars: {
    car_id: string;
    brand: string;
    model: string;
    year: number;
    reservation_count: number;
  }[];
  top_clients: {
    client_id: string;
    name: string;
    email: string;
    reservation_count: number;
    total_spent: number;
  }[];
  status_distribution: Record<ReservationStatus, number>;
  year: number;
}

export interface FinancialReports {
  revenue_by_period: {
    period: string;
    revenue: number;
  }[];
  outstanding_payments: {
    reservation_id: string;
    client_name: string;
    car_info: string;
    total_amount: number;
    payment_status: PaymentStatus;
    status: ReservationStatus;
    start_date: string;
    end_date: string;
  }[];
  deposit_summary: Record<ReservationStatus, {
    total_deposits: number;
    count: number;
  }>;
  period_type: 'daily' | 'weekly' | 'monthly';
  date_range: {
    start_date: string;
    end_date: string;
  };
}

export interface CarUtilization {
  car_utilization: {
    car_id: string;
    brand: string;
    model: string;
    year: number;
    license_plate: string;
    days_rented: number;
    utilization_percentage: number;
    revenue: number;
    current_status: 'available' | 'maintenance' | 'rented';
  }[];
  fleet_statistics: {
    total_cars: number;
    fleet_utilization_percentage: number;
    total_revenue: number;
  };
  date_range: {
    start_date: string;
    end_date: string;
  };
}

export interface ClientActivity {
  client_activity: {
    client_id: string;
    name: string;
    email: string;
    phone: string;
    total_reservations: number;
    completed_reservations: number;
    cancelled_reservations: number;
    total_spent: number;
    last_activity: string;
    preferred_cars: {
      car_id: string;
      brand: string;
      model: string;
      count: number;
    }[];
  }[];
  summary: {
    total_active_clients: number;
    new_clients: number;
    total_revenue: number;
  };
  date_range: {
    start_date: string;
    end_date: string;
  };
}

export interface UpcomingEvents {
  upcoming_pickups: {
    reservation_id: string;
    client_name: string;
    client_id: string;
    car_info: string;
    car_id: string;
    start_date: string;
    status: ReservationStatus;
    pickup_location: string;
  }[];
  upcoming_returns: {
    reservation_id: string;
    client_name: string;
    client_id: string;
    car_info: string;
    car_id: string;
    end_date: string;
    return_location: string;
    total_amount: number;
    payment_status: PaymentStatus;
  }[];
  overdue_returns: {
    reservation_id: string;
    client_name: string;
    client_id: string;
    car_info: string;
    car_id: string;
    end_date: string;
    days_overdue: number;
    return_location: string;
    total_amount: number;
    payment_status: PaymentStatus;
  }[];
  date_range: {
    start_date: string;
    end_date: string;
  };
} 