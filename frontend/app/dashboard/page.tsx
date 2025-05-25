'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Users, Calendar, FileText, Loader2 } from 'lucide-react';
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
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
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
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold font-serif mb-2 flex items-center">
          <span className="text-gold">Manager</span> Dashboard
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-gold to-gold/50 mb-8"></div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 font-serif">Welcome, {user?.name}!</h2>
        <p className="text-gray-300">
          You are logged in as a manager. Use the options below to manage your resources.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/cars" className="block">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm p-6 hover:border-gold/50 transition-all duration-300 group">
            <div className="flex items-center mb-4">
              <div className="bg-blue-900/30 p-3 rounded-full mr-4 border border-blue-500/30 group-hover:border-gold/30 transition-colors">
                <Car className="text-blue-400 group-hover:text-gold transition-colors" size={24} />
              </div>
              <h3 className="text-lg font-bold font-serif">Car Management</h3>
            </div>
            <p className="text-gray-300">
              View, add, edit, and manage your car inventory. Track car details, availability, and rental history.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/clients" className="block">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm p-6 hover:border-gold/50 transition-all duration-300 group">
            <div className="flex items-center mb-4">
              <div className="bg-purple-900/30 p-3 rounded-full mr-4 border border-purple-500/30 group-hover:border-gold/30 transition-colors">
                <Users className="text-purple-400 group-hover:text-gold transition-colors" size={24} />
              </div>
              <h3 className="text-lg font-bold font-serif">Client Management</h3>
            </div>
            <p className="text-gray-300">
              Manage client information, view rental history, and track client details for easy access during rentals.
            </p>
          </div>
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/reservations" className="block">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm p-6 hover:border-gold/50 transition-all duration-300 group">
            <div className="flex items-center mb-4">
              <div className="bg-green-900/30 p-3 rounded-full mr-4 border border-green-500/30 group-hover:border-gold/30 transition-colors">
                <Calendar className="text-green-400 group-hover:text-gold transition-colors" size={24} />
              </div>
              <h3 className="text-lg font-bold font-serif">Reservation Management</h3>
            </div>
            <p className="text-gray-300">
              Create, view, and manage reservations. Track rental periods, payments, and reservation status.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/reports" className="block">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm p-6 hover:border-gold/50 transition-all duration-300 group">
            <div className="flex items-center mb-4">
              <div className="bg-amber-900/30 p-3 rounded-full mr-4 border border-amber-500/30 group-hover:border-gold/30 transition-colors">
                <FileText className="text-amber-400 group-hover:text-gold transition-colors" size={24} />
              </div>
              <h3 className="text-lg font-bold font-serif">Reports & Analytics</h3>
            </div>
            <p className="text-gray-300">
              View financial reports, utilization metrics, and business analytics to make informed decisions.
            </p>
          </div>
        </Link>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div variants={itemVariants}>
        <DashboardMetricsCards 
          metrics={dashboardMetrics as DashboardMetrics} 
          isLoading={isLoadingMetrics} 
        />
      </motion.div>
      
      {/* Charts Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart 
          financialData={financialData} 
          isLoading={isLoadingFinancial} 
        />
        
        <ReservationStatsChart 
          data={reservationStats} 
          isLoading={isLoadingReservationStats} 
        />
      </motion.div>
      
      {/* Car Utilization and Upcoming Events */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CarUtilizationChart 
          data={carUtilization} 
          isLoading={isLoadingUtilization} 
        />
        
        <UpcomingReservations 
          data={upcomingEvents} 
          isLoading={isLoadingUpcoming} 
        />
      </motion.div>
    </motion.div>
  );
} 