'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Users, LogOut, User } from 'lucide-react';
import { 
  DashboardMetrics, 
  ReservationAnalytics,
  FinancialReports,
  CarUtilization,
  UpcomingEvents
} from '@/types/analytics';
import DashboardMetricsCards from '@/components/dashboard/DashboardMetricsCards';
import RevenueChart from '@/components/dashboard/RevenueChart';
import ReservationStatsChart from '@/components/dashboard/ReservationStatsChart';
import CarUtilizationChart from '@/components/dashboard/CarUtilizationChart';
import UpcomingReservations from '@/components/dashboard/UpcomingReservations';

export default function DashboardPage() {
  const { user, token, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [reservationStats, setReservationStats] = useState<ReservationAnalytics | null>(null);
  const [financialData, setFinancialData] = useState<FinancialReports | null>(null);
  const [carUtilization, setCarUtilization] = useState<CarUtilization | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvents | null>(null);
  
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingReservationStats, setIsLoadingReservationStats] = useState(true);
  const [isLoadingFinancial, setIsLoadingFinancial] = useState(true);
  const [isLoadingUtilization, setIsLoadingUtilization] = useState(true);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (token) {
      fetchDashboardMetrics();
      fetchReservationStats();
      fetchFinancialData();
      fetchCarUtilization();
      fetchUpcomingEvents();
    }
  }, [token]);

  const fetchDashboardMetrics = async () => {
    try {
      setIsLoadingMetrics(true);
      const response = await axios.get('http://localhost:5000/api/analytics/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDashboardMetrics(response.data);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setIsLoadingMetrics(false);
    }
  };
  
  const fetchReservationStats = async () => {
    try {
      setIsLoadingReservationStats(true);
      const response = await axios.get('http://localhost:5000/api/analytics/reservations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setReservationStats(response.data);
    } catch (error) {
      console.error('Error fetching reservation stats:', error);
    } finally {
      setIsLoadingReservationStats(false);
    }
  };
  
  const fetchFinancialData = async () => {
    try {
      setIsLoadingFinancial(true);
      const response = await axios.get('http://localhost:5000/api/analytics/financial', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFinancialData(response.data);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setIsLoadingFinancial(false);
    }
  };
  
  const fetchCarUtilization = async () => {
    try {
      setIsLoadingUtilization(true);
      const response = await axios.get('http://localhost:5000/api/analytics/cars/utilization', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCarUtilization(response.data);
    } catch (error) {
      console.error('Error fetching car utilization:', error);
    } finally {
      setIsLoadingUtilization(false);
    }
  };
  
  const fetchUpcomingEvents = async () => {
    try {
      setIsLoadingUpcoming(true);
      const response = await axios.get('http://localhost:5000/api/analytics/upcoming', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUpcomingEvents(response.data);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    } finally {
      setIsLoadingUpcoming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleLogout = () => {
    setLoading(true);
    logout();
    router.push('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          <LogOut size={18} />
          <span>{loading ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Welcome, {user?.name}!</h2>
        <p className="text-gray-600">
          You are logged in as a manager. Use the options below to manage your resources.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/cars" className="block">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Car className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-bold">Car Management</h3>
            </div>
            <p className="text-gray-600">
              View, add, edit, and manage your car inventory. Track car details, availability, and rental history.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/clients" className="block">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <User className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-bold">Client Management</h3>
            </div>
            <p className="text-gray-600">
              Manage client information, view rental history, and track client details for easy access during rentals.
            </p>
          </div>
        </Link>
      </div>

      {/* Metrics Cards */}
      <DashboardMetricsCards 
        metrics={dashboardMetrics as DashboardMetrics} 
        isLoading={isLoadingMetrics} 
      />
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart 
          financialData={financialData} 
          isLoading={isLoadingFinancial} 
        />
        
        <ReservationStatsChart 
          data={reservationStats} 
          isLoading={isLoadingReservationStats} 
        />
      </div>
      
      {/* Car Utilization and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CarUtilizationChart 
          data={carUtilization} 
          isLoading={isLoadingUtilization} 
        />
        
        <UpcomingReservations 
          data={upcomingEvents} 
          isLoading={isLoadingUpcoming} 
        />
      </div>
    </div>
  );
} 