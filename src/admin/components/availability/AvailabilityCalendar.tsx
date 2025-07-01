import React from 'react';

interface AvailabilityCalendarProps {
  currentDate: Date;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ currentDate }) => {
  // This is a simplified version - in a real app, you'd generate the actual calendar
  // based on the current month
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Generate days for the month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Create array of day numbers, with empty spaces for days from previous month
  const days = Array(firstDayOfMonth).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );
  
  // Add empty cells to complete the grid if needed
  const totalCells = Math.ceil(days.length / 7) * 7;
  const daysWithPadding = [...days, ...Array(totalCells - days.length).fill(null)];
  
  // Split into weeks
  const weeks = [];
  for (let i = 0; i < daysWithPadding.length; i += 7) {
    weeks.push(daysWithPadding.slice(i, i + 7));
  }
  
  // Sample data - in a real app, this would come from an API
  const bookedDays = [7, 12, 18, 23];
  const noSlotsDays = [22, 23];
  
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  return (
    <div className="p-4">
      <div className="grid grid-cols-7 gap-1">
        {weekdays.map(day => (
          <div key={day} className="text-center py-2 text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => {
              const isBooked = day !== null && bookedDays.includes(day);
              const hasNoSlots = day !== null && noSlotsDays.includes(day);
              
              return (
                <div 
                  key={dayIndex} 
                  className={`
                    aspect-square border rounded-md flex flex-col items-center justify-center
                    ${day === null ? 'border-transparent' : 'border-gray-200'}
                    ${isBooked ? 'bg-green-50 border-green-200' : ''}
                  `}
                >
                  {day !== null && (
                    <>
                      <span className={`
                        text-lg font-medium 
                        ${isBooked ? 'text-green-700' : 'text-gray-700'}
                      `}>
                        {day}
                      </span>
                      {hasNoSlots && (
                        <span className="text-xs text-gray-500 mt-1">No Slots</span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;