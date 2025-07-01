import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay, addDays } from 'date-fns';

interface MonthlyViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ currentDate, onDateChange, onDateSelect }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Create weeks array for calendar grid
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = [];

  // Add empty cells for days before the first of the month
  const firstDayOfMonth = getDay(monthStart); // 0 = Sunday, 1 = Monday, etc.
  for (let i = 0; i < firstDayOfMonth; i++) {
    week.push(null);
  }

  // Add the days of the month
  daysInMonth.forEach((day) => {
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    week.push(day);
  });

  // Add empty cells for days after the last of the month
  while (week.length < 7) {
    week.push(null);
  }
  weeks.push(week);

  // Handle navigation to previous and next months
  const handlePrevMonth = () => {
    onDateChange(addDays(currentDate, -30)); // Rough estimate for previous month
  };

  const handleNextMonth = () => {
    onDateChange(addDays(currentDate, 30)); // Rough estimate for next month
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button onClick={handlePrevMonth}>
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-medium">{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <button className="px-4 py-2 text-olive-700 border border-olive-700 rounded-md">
          EDIT BASE WEEK
        </button>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => (
          <div key={day} className="text-sm text-gray-500 text-center">
            {day}
          </div>
        ))}

        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`h-24 border border-gray-200 rounded-lg p-2 cursor-pointer ${
                  day && isSameMonth(day, currentDate)
                    ? 'bg-white'
                    : 'bg-gray-50'
                }`}
                onClick={() => day && onDateSelect(day)}
              >
                {day && (
                  <div className="text-sm text-gray-600">
                    {format(day, 'd')}
                  </div>
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MonthlyView;