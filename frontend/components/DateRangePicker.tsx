import { useState, useEffect } from 'react';
import { Calendar, CalendarIcon } from 'lucide-react';

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

  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
  }, [startDate, endDate]);

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
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Rental Period
      </label>
      
      {/* Date display */}
      <div 
        className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <CalendarIcon size={18} className="text-gray-500 mr-2" />
          <span>
            {startDate && endDate ? 
              `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}` : 
              'Select dates'}
          </span>
        </div>
      </div>
      
      {/* Date picker dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={localStartDate}
                onChange={handleStartDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                value={localEndDate}
                onChange={handleEndDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 