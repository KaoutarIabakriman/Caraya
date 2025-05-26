import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
  className?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  className = ''
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState(startDate || '');
  const [localEndDate, setLocalEndDate] = useState(endDate || '');
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  };

  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
  }, [startDate, endDate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setLocalStartDate(newStartDate);
    validateAndUpdate(newStartDate, localEndDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setLocalEndDate(newEndDate);
    validateAndUpdate(localStartDate, newEndDate);
  };

  const validateAndUpdate = (start: string, end: string) => {
    // Clear previous error
    setError(null);
    
    // Check if both dates are provided
    if (!start || !end) return;
    
    // Parse dates
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    
    // Validate dates
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      setError('Invalid date format');
      return;
    }
    
    // Check if end date is after start date
    if (endDateObj <= startDateObj) {
      setError('End date must be after start date');
      return;
    }
    
    // Check if start date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDateObj < today) {
      setError('Start date cannot be in the past');
      return;
    }
    
    // All validations passed, update parent
    onDateChange(start, end);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleApply = () => {
    validateAndUpdate(localStartDate, localEndDate);
    if (!error) {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Rental Period
      </label>
      
      {/* Date display */}
      <div 
        className="flex items-center justify-between w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md cursor-pointer focus:ring-1 focus:ring-gold focus:border-gold"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <CalendarIcon size={18} className="text-gold mr-2" />
          <span>
            {startDate && endDate ? 
              `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}` : 
              'Select rental period'}
          </span>
        </div>
      </div>
      
      {/* Date picker dropdown */}
      {isOpen && (
        <motion.div 
          className="absolute z-10 w-full mt-1 bg-gray-800/90 border border-white/10 rounded-md shadow-lg p-4 backdrop-blur-sm"
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={localStartDate}
                onChange={handleStartDateChange}
                className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={localEndDate}
                onChange={handleEndDateChange}
                className="w-full px-3 py-2 bg-gray-900/50 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>
          
          {error && (
            <div className="text-red-400 text-sm mt-2 bg-red-900/20 p-2 rounded-md border border-red-500/20">
              {error}
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 bg-gradient-to-r from-gold to-amber-500 hover:from-gold hover:to-amber-400 text-black rounded-md transition-all duration-300 font-medium"
            >
              Apply
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
} 