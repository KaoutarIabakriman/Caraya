"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { 
  FinancialReports, 
  CarUtilization, 
  ClientActivity, 
  ReservationAnalytics 
} from '@/types/analytics';
import { 
  Download, 
  Calendar, 
  Filter, 
  FileText, 
  Car, 
  Users, 
  DollarSign,
  Loader2
} from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  const { token } = useAuth();
  
  // State for date range
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // State for report data
  const [reportType, setReportType] = useState<'financial' | 'car' | 'client' | 'reservation'>('financial');
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  
  // State for report data
  const [financialData, setFinancialData] = useState<FinancialReports | null>(null);
  const [carData, setCarData] = useState<CarUtilization | null>(null);
  const [clientData, setClientData] = useState<ClientActivity | null>(null);
  const [reservationData, setReservationData] = useState<ReservationAnalytics | null>(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize dates on component mount
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);
  
  // Fetch report data when parameters change
  useEffect(() => {
    if (token && startDate && endDate) {
      fetchReportData();
    }
  }, [token, reportType, startDate, endDate, periodType]);
  
  const fetchReportData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    
    try {
      switch (reportType) {
        case 'financial':
          const financialResponse = await axios.get(
            `http://localhost:5000/api/analytics/financial?start_date=${startDate}T00:00:00&end_date=${endDate}T23:59:59&period=${periodType}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setFinancialData(financialResponse.data);
          break;
          
        case 'car':
          const carResponse = await axios.get(
            `http://localhost:5000/api/analytics/cars/utilization?start_date=${startDate}T00:00:00&end_date=${endDate}T23:59:59`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setCarData(carResponse.data);
          break;
          
        case 'client':
          const clientResponse = await axios.get(
            `http://localhost:5000/api/analytics/clients/activity?start_date=${startDate}T00:00:00&end_date=${endDate}T23:59:59`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setClientData(clientResponse.data);
          break;
          
        case 'reservation':
          const reservationResponse = await axios.get(
            `http://localhost:5000/api/analytics/reservations?year=${new Date(startDate).getFullYear()}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setReservationData(reservationResponse.data);
          break;
      }
    } catch (err: any) {
      console.error(`Error fetching ${reportType} report:`, err);
      setError(err.response?.data?.message || `Failed to load ${reportType} report`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';
    
    switch (reportType) {
      case 'financial':
        if (financialData) {
          // Create headers
          csvContent = 'Period,Revenue\n';
          
          // Add rows
          financialData.revenue_by_period.forEach(item => {
            csvContent += `${item.period},${item.revenue}\n`;
          });
          
          filename = `financial_report_${startDate}_to_${endDate}.csv`;
        }
        break;
        
      case 'car':
        if (carData) {
          // Create headers
          csvContent = 'Car,Brand,Model,Year,License Plate,Days Rented,Utilization %,Revenue,Status\n';
          
          // Add rows
          carData.car_utilization.forEach(car => {
            csvContent += `${car.car_id},${car.brand},${car.model},${car.year},${car.license_plate},${car.days_rented},${car.utilization_percentage}%,${car.revenue},${car.current_status}\n`;
          });
          
          filename = `car_utilization_report_${startDate}_to_${endDate}.csv`;
        }
        break;
        
      case 'client':
        if (clientData) {
          // Create headers
          csvContent = 'Client ID,Name,Email,Phone,Total Reservations,Completed Reservations,Cancelled Reservations,Total Spent,Last Activity\n';
          
          // Add rows
          clientData.client_activity.forEach(client => {
            csvContent += `${client.client_id},${client.name},${client.email},${client.phone},${client.total_reservations},${client.completed_reservations},${client.cancelled_reservations},${client.total_spent},${client.last_activity}\n`;
          });
          
          filename = `client_activity_report_${startDate}_to_${endDate}.csv`;
        }
        break;
        
      case 'reservation':
        if (reservationData) {
          // Create headers
          csvContent = 'Month,Reservation Count\n';
          
          // Add rows
          reservationData.bookings_by_month.forEach(item => {
            csvContent += `${item.month},${item.count}\n`;
          });
          
          filename = `reservation_report_${new Date(startDate).getFullYear()}.csv`;
        }
        break;
    }
    
    if (csvContent) {
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
        
        <button
          onClick={handleExportCSV}
          disabled={isLoading || !financialData}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          <Download size={18} className="mr-2" />
          Export CSV
        </button>
      </div>
      
      {/* Report filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="financial">Financial Report</option>
              <option value="car">Car Utilization Report</option>
              <option value="client">Client Activity Report</option>
              <option value="reservation">Reservation Status Report</option>
            </select>
          </div>
          
          {reportType === 'financial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period
              </label>
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Report content */}
      <div className="bg-white p-6 rounded-lg shadow">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={40} className="animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-700">
            {error}
          </div>
        ) : (
          <div>
            {/* Financial Report */}
            {reportType === 'financial' && financialData && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <DollarSign size={20} className="mr-2 text-green-600" />
                  Financial Report
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {financialData.revenue_by_period.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.period}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ${item.revenue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          Total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          ${financialData.revenue_by_period.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                {/* Outstanding Payments */}
                {financialData.outstanding_payments.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Outstanding Payments</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Client
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Car
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {financialData.outstanding_payments.map((payment, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                {payment.client_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {payment.car_info}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                ${payment.total_amount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  payment.payment_status === 'unpaid' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {payment.payment_status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Car Utilization Report */}
            {reportType === 'car' && carData && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Car size={20} className="mr-2 text-blue-600" />
                  Car Utilization Report
                </h2>
                
                <div className="mb-4 p-4 bg-blue-50 rounded-md">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Cars</p>
                      <p className="text-xl font-semibold">{carData.fleet_statistics.total_cars}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fleet Utilization</p>
                      <p className="text-xl font-semibold">{carData.fleet_statistics.fleet_utilization_percentage}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="text-xl font-semibold">${carData.fleet_statistics.total_revenue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Car
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          License Plate
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Days Rented
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilization %
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {carData.car_utilization.map((car, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {car.brand} {car.model} ({car.year})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {car.license_plate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {car.days_rented}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {car.utilization_percentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ${car.revenue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              car.current_status === 'available' ? 'bg-green-100 text-green-800' :
                              car.current_status === 'rented' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {car.current_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Client Activity Report */}
            {reportType === 'client' && clientData && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Users size={20} className="mr-2 text-green-600" />
                  Client Activity Report
                </h2>
                
                <div className="mb-4 p-4 bg-green-50 rounded-md">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Active Clients</p>
                      <p className="text-xl font-semibold">{clientData.summary.total_active_clients}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">New Clients</p>
                      <p className="text-xl font-semibold">{clientData.summary.new_clients}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="text-xl font-semibold">${clientData.summary.total_revenue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Reservations
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completed
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cancelled
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Spent
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clientData.client_activity.map((client, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {client.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {client.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {client.total_reservations}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {client.completed_reservations}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {client.cancelled_reservations}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ${client.total_spent.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Reservation Status Report */}
            {reportType === 'reservation' && reservationData && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Calendar size={20} className="mr-2 text-purple-600" />
                  Reservation Status Report
                </h2>
                
                <div className="mb-4 p-4 bg-purple-50 rounded-md">
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(reservationData.status_distribution).map(([status, count]) => (
                      <div key={status}>
                        <p className="text-sm text-gray-500">{status.charAt(0).toUpperCase() + status.slice(1)}</p>
                        <p className="text-xl font-semibold">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <h3 className="text-lg font-semibold mb-2">Bookings by Month</h3>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reservation Count
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reservationData.bookings_by_month.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Popular Cars */}
                {reservationData.popular_cars.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-2">Popular Cars</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Car
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reservations
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reservationData.popular_cars.map((car, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                {car.brand} {car.model} ({car.year})
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {car.reservation_count}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 