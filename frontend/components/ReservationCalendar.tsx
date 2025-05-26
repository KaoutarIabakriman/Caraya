import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/auth-provider';
import { CalendarEvent, ReservationStatus } from '@/types/reservation';
import { Loader2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReservationCalendarProps {
  onEventClick?: (eventId: string) => void;
}

// Status color mapping
const statusColors: Record<ReservationStatus, string> = {
  pending: 'bg-yellow-900/30 border-yellow-500/30 text-yellow-400',
  confirmed: 'bg-blue-900/30 border-blue-500/30 text-blue-400',
  active: 'bg-green-900/30 border-green-500/30 text-green-400',
  completed: 'bg-gray-900/30 border-gray-500/30 text-gray-300',
  cancelled: 'bg-red-900/30 border-red-500/30 text-red-400'
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
  
  // Animation variants
  const calendarVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.01,
        duration: 0.3 
      } 
    }
  };

  const cellVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } }
  };
  
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
    <motion.div 
      className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm overflow-hidden"
      variants={calendarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h2 className="text-xl font-semibold font-serif text-white flex items-center">
          <Calendar className="text-gold mr-2" size={20} />
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-md hover:bg-white/10 text-gray-300 hover:text-gold transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-md hover:bg-white/10 text-gray-300 hover:text-gold transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="bg-gray-900/50">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-px bg-gray-800/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-gray-900/80 py-2 text-center text-sm font-medium text-gray-300">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-px bg-gray-800/50">
          {isLoading ? (
            <div className="col-span-7 h-96 flex items-center justify-center bg-gray-900/50">
              <Loader2 size={40} className="animate-spin text-gold" />
            </div>
          ) : (
            calendarDays.map((date, index) => {
              const dayEvents = getEventsForDay(date);
              
              return (
                <motion.div
                  key={index}
                  variants={cellVariants}
                  className={`min-h-[120px] p-2 ${
                    isToday(date) ? 'bg-blue-900/20 border border-blue-500/20' : 'bg-gray-900/50'
                  } ${
                    !isCurrentMonth(date) ? 'text-gray-500' : 'text-white'
                  }`}
                >
                  <div className={`font-medium text-sm mb-1 ${isToday(date) ? 'text-gold' : ''}`}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1 overflow-y-auto max-h-[80px]">
                    {dayEvents.map(event => (
                      <div
                        key={`${event.id}-${date.toISOString()}`}
                        onClick={() => handleEventClick(event.id)}
                        className={`text-xs p-1 rounded border cursor-pointer truncate hover:brightness-110 transition-all ${statusColors[event.status]}`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-4 text-red-400 bg-red-900/20 border border-red-500/30">
          {error}
        </div>
      )}
    </motion.div>
  );
} 