import React from 'react';

interface AvailabilitySlotsProps {
  currentDate: Date;
}

const AvailabilitySlots: React.FC<AvailabilitySlotsProps> = ({ currentDate }) => {
  // Generate the week days starting from the current date
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentDate);
    day.setDate(day.getDate() + i);
    return day;
  });
  
  // Sample time slots - in a real app, these would be dynamic
  const timeSlots = [
    '12:00 AM', '12:15 AM', '12:30 AM', '12:45 AM',
    '01:00 AM', '01:15 AM', '01:30 AM', '01:45 AM',
    // ... more slots
  ];
  
  // Sample availability data - in a real app, this would come from an API
 const availableSlots: { [day: number]: { [slot: number]: boolean } } = {
  2: { 2: true, 3: true, 6: true },
  4: { 1: true, 2: true }
};
  return (
    <div className="p-4 overflow-x-auto">
      <div className="mb-4 flex items-center space-x-4">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
          <span className="text-sm text-gray-600">ONLINE</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
          <span className="text-sm text-gray-600">IN-PERSON</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
          <span className="text-sm text-gray-600">BOTH</span>
        </div>
      </div>
      
      <div className="relative min-w-max">
        <div className="grid grid-cols-8 gap-1">
          {/* Time column */}
          <div className="sticky left-0 bg-white z-10">
            <div className="h-10"></div> {/* Empty cell for header row */}
            {timeSlots.map((time, index) => (
              <div key={index} className="h-12 flex items-center justify-end pr-4 text-sm text-gray-500">
                {time}
              </div>
            ))}
          </div>
          
          {/* Days columns */}
          {weekDays.map((day, dayIndex) => {
            const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(day);
            const dayNumber = day.getDate();
            const hasAvailability = availableSlots[dayIndex];
            
            return (
              <div key={dayIndex} className="flex flex-col">
                <div className="h-10 flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-500">{dayName}</div>
                  <div className="font-medium">{dayNumber}</div>
                </div>
                
                {timeSlots.map((_, slotIndex) => {
                  const isAvailable = hasAvailability && hasAvailability[slotIndex];
                  
                  return (
                    <div 
                      key={slotIndex} 
                      className={`
                        h-12 border border-gray-200 rounded-md m-0.5
                        ${isAvailable ? 'bg-green-50 border-green-200 cursor-pointer' : ''}
                      `}
                    ></div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AvailabilitySlots;