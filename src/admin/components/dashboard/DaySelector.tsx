import React from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DaySelectorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const DaySelector: React.FC<DaySelectorProps> = ({ currentDate, onDateChange }) => {
  const days = Array.from({ length: 5 }, (_, i) => addDays(currentDate, i - 2));
  
  return (
    <div className="flex items-center space-x-4">
      <button className="p-1 rounded-full hover:bg-gray-100">
        <ChevronLeft className="w-5 h-5 text-gray-500" />
      </button>
      
      <div className="flex flex-1 justify-between md:justify-start md:space-x-4">
        {days.map((day, index) => (
          <button
            key={index}
            className={`flex flex-col items-center py-2 px-4 rounded-lg ${
              isSameDay(day, currentDate)
                ? 'bg-white shadow-sm border border-gray-200'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => onDateChange(day)}
          >
            <span className="text-xs text-gray-500">{format(day, 'EEE')}</span>
            <span className="text-xl font-medium text-gray-800">{format(day, 'd')}</span>
          </button>
        ))}
      </div>
      
      <button className="p-1 rounded-full hover:bg-gray-100">
        <ChevronRight className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
};

export default DaySelector;