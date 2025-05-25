import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { CalendarEvent, ReservationStatus } from '@/types/reservation';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReservationCalendarProps {
  onEventClick?: (eventId: string) => void;
}

// Status color mapping
const statusColors: Record<ReservationStatus, string> = {
  pending: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  confirmed: 'bg-blue-100 border-blue-400 text-blue-800',
  active: 'bg-green-100 border-green-400 text-green-800',
  completed: 'bg-gray-100 border-gray-400 text-gray-800',
  cancelled: 'bg-red-100 border-red-400 text-red-800'
};

export default function ReservationCalendar({ onEventClick }: ReservationCalendarProps) {
  const router = useRouter();
  const { token } = useAuth();
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  
  // Generate calendar days when month changes
  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth]);
  
  // Fetch events when month changes
  useEffect(() => {
    fetchEvents();
  }, [currentMonth, token]);
  
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of the month
    const firstDay = new Date(year, month, 1);
    
    // Get last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate total days to show (previous month + current month + next month)
    const totalDays = 42; // 6 rows of 7 days
    
    // Generate array of dates
    const days: Date[] = [];
    
    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push(date);
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push(date);
    }
    
    // Add days from next month
    const remainingDays = totalDays - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push(date);
    }
    
    setCalendarDays(days);
  };
  
  const fetchEvents = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Calculate start and end dates for the current view
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const startDate = new Date(year, month - 1, 1); // Include previous month
      const endDate = new Date(year, month + 2, 0); // Include next month
      
      const response = await axios.get(
        `http://localhost:5000/api/reservations/calendar?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setEvents(response.data.events);
    } catch (err: any) {
      console.error('Error fetching calendar events:', err);
      setError('Failed to load calendar events');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const handleEventClick = (eventId: string) => {
    if (onEventClick) {
      onEventClick(eventId);
    } else {
      router.push(`/dashboard/reservations/${eventId}`);
    }
  };
  
  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  // Check if a date is in the current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };
  
  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // Check if the date falls within the event range
      return date >= new Date(eventStart.setHours(0, 0, 0, 0)) && 
             date <= new Date(eventEnd.setHours(23, 59, 59, 999));
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="bg-white">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {isLoading ? (
            <div className="col-span-7 h-96 flex items-center justify-center bg-white">
              <Loader2 size={40} className="animate-spin text-blue-500" />
            </div>
          ) : (
            calendarDays.map((date, index) => {
              const dayEvents = getEventsForDay(date);
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] bg-white p-2 ${
                    isToday(date) ? 'bg-blue-50' : ''
                  } ${
                    !isCurrentMonth(date) ? 'text-gray-400' : ''
                  }`}
                >
                  <div className="font-medium text-sm mb-1">
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1 overflow-y-auto max-h-[80px]">
                    {dayEvents.map(event => (
                      <div
                        key={`${event.id}-${date.toISOString()}`}
                        onClick={() => handleEventClick(event.id)}
                        className={`text-xs p-1 rounded border cursor-pointer truncate ${statusColors[event.status]}`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-4 text-red-700 bg-red-100">
          {error}
        </div>
      )}
    </div>
  );
} 