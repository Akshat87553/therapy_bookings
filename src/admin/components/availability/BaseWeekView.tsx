import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, addDays } from 'date-fns';

type SlotType = 'online' | 'in_person' | 'both';

interface AvailabilitySlot {
  time: string;
  isAvailable: boolean;
  slotType: SlotType;
}

interface BaseWeekViewProps {
  startDate: Date;
  onSlotSelect: (date: string, day: string, time: string, type: string, isAvailable: boolean) => void;
}

const API_URL = '/api/schedule';

const BaseWeekView: React.FC<BaseWeekViewProps> = ({ startDate, onSlotSelect }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'Night' | 'Day'>('Day');
  const [slotType, setSlotType] = useState<SlotType>('online');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, { available: boolean; type: SlotType }>>({});
  const [error, setError] = useState<string | null>(null);

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const timeSlots: Record<'Night' | 'Day', string[]> = {
    Night: [
      '12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM',
      '03:00 AM', '03:30 AM', '04:00 AM', '04:30 AM', '05:00 AM', '05:30 AM',
      '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM',
    ],
    Day: [
      '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
      '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
      '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
      '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
      '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM',
    ]
  };

  useEffect(() => {
    fetchAvailabilitySlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate]);

  interface AvailabilityDay {
    date: string;
    slots: AvailabilitySlot[];
  }

  const fetchAvailabilitySlots = async () => {
    try {
      const start = format(weekDates[0], 'yyyy-MM-dd');
      const end = format(weekDates[6], 'yyyy-MM-dd');

      const response = await axios.get<AvailabilityDay[]>(
        `${API_URL}/availability`,
        {
          params: { start, end },
          withCredentials: true,
        }
      );

      const slots: Record<string, { available: boolean; type: SlotType }> = {};
      response.data.forEach((dayEntry) => {
        const dateKey = format(new Date(dayEntry.date), 'yyyy-MM-dd');
        dayEntry.slots.forEach((slot) => {
          const key = `${dateKey}-${slot.time}`;
          slots[key] = {
            available: slot.isAvailable,
            type: slot.slotType,
          };
        });
      });

      setSelectedSlots(slots);
      setError(null);
    } catch (error) {
      console.error('Error fetching availability slots:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setError('Please log in to view availability');
      } else {
        setError('Failed to fetch availability slots');
      }
    }
  };

  const handleSlotClick = async (date: Date, time: string) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayOfWeek = format(date, 'EEEE').toUpperCase();
    const key = `${dateString}-${time}`;
    const isSelected = selectedSlots[key]?.available;

    const newSlotState = !isSelected;

    const originalState = selectedSlots[key];
    setSelectedSlots((prev) => ({
      ...prev,
      [key]: { available: newSlotState, type: slotType },
    }));

    try {
      await axios.post(
        `${API_URL}/availability`,
        {
          date: dateString,
          day_of_week: dayOfWeek,
          time_slot: time,
          slot_type: slotType,
          is_available: newSlotState,
        },
        { withCredentials: true }
      );
      onSlotSelect(dateString, dayOfWeek, time, slotType, newSlotState);
      setError(null);
    } catch (error) {
      console.error('Slot update failed:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setError('Please log in to update availability');
      } else {
        setError('Failed to update slot');
      }
      // Revert on error
      setSelectedSlots((prev) => ({
        ...prev,
        [key]: originalState,
      }));
    }
  };

  const handleSelectAllForDay = async (date: Date, shouldSelect: boolean) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayOfWeek = format(date, 'EEEE').toUpperCase();
    const currentDaySlots = timeSlots[selectedTimeRange];

    const originalStates: Record<string, { available: boolean; type: SlotType } | undefined> = {};
    currentDaySlots.forEach((time) => {
      const key = `${dateString}-${time}`;
      originalStates[key] = selectedSlots[key];
    });

    setSelectedSlots((prev) => {
      const newSelectedSlots = { ...prev };
      currentDaySlots.forEach((time) => {
        const key = `${dateString}-${time}`;
        newSelectedSlots[key] = { available: shouldSelect, type: slotType };
      });
      return newSelectedSlots;
    });

    // Prefer bulk endpoint if available on server
    try {
      await axios.post(
        `${API_URL}/availability/bulk`,
        {
          date: dateString,
          day_of_week: dayOfWeek,
          time_slots: currentDaySlots,
          slot_type: slotType,
          is_available: shouldSelect,
        },
        { withCredentials: true }
      );

      currentDaySlots.forEach((time) => {
        onSlotSelect(dateString, dayOfWeek, time, slotType, shouldSelect);
      });
      setError(null);
    } catch (error) {
      console.error('Bulk update failed:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setError('Please log in to update availability');
      } else {
        setError('Failed to update all slots');
      }
      setSelectedSlots((prev) => ({ ...prev, ...originalStates }));
    }
  };

  return (
    <div className="p-6 space-y-4">
      {error && <div className="bg-red-100 text-red-800 p-2 rounded">{error}</div>}

      <div className="flex space-x-2">
        <button
          onClick={() => setSlotType('online')}
          className={`px-4 py-2 rounded-full ${slotType === 'online' ? 'bg-amber-200' : 'bg-amber-100 text-amber-800'}`}>
          ONLINE
        </button>
        <button
          onClick={() => setSlotType('in_person')}
          className={`px-4 py-2 rounded-full ${slotType === 'in_person' ? 'bg-blue-200' : 'bg-blue-100 text-blue-800'}`}>
          IN-PERSON
        </button>
        <button
          onClick={() => setSlotType('both')}
          className={`px-4 py-2 rounded-full ${slotType === 'both' ? 'bg-green-200' : 'bg-green-100 text-green-800'}`}>
          BOTH
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">{selectedTimeRange} View</span>
        <button onClick={() => setSelectedTimeRange((prev) => (prev === 'Night' ? 'Day' : 'Night'))} className="text-sm underline text-blue-600 hover:text-blue-800">
          (Toggle to {selectedTimeRange === 'Night' ? 'Day' : 'Night'})
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-4 mt-4">
        {weekDates.map((date) => {
            const dateString = format(date, 'yyyy-MM-dd');
            const allSelected = timeSlots[selectedTimeRange].every(time => {
                const key = `${dateString}-${time}`;
                return selectedSlots[key]?.available;
            });

            return (
              <div key={date.toISOString()} className="text-center space-y-2">
                <div className="text-sm font-medium">{format(date, 'EEE, MMM d')}</div>
                <div className="flex items-center justify-center space-x-1">
                    <input 
                        type="checkbox" 
                        id={`select-all-${dateString}`}
                        checked={allSelected}
                        onChange={(e) => handleSelectAllForDay(date, e.target.checked)}
                        className="h-4 w-4 rounded text-olive-600 focus:ring-olive-500"
                    />
                    <label htmlFor={`select-all-${dateString}`} className="text-xs text-gray-600">All</label>
                </div>
              </div>
            )
        })}
      </div>

      <div className="grid grid-cols-7 gap-4">
        {weekDates.map((date) => (
          <div key={date.toISOString()} className="space-y-2">
            {timeSlots[selectedTimeRange].map((time) => {
              const dateString = format(date, 'yyyy-MM-dd');
              const key = `${dateString}-${time}`;
              const slot = selectedSlots[key];
              const isActive = slot?.available;

              return (
                <button
                  key={key}
                  onClick={() => handleSlotClick(date, time)}
                  className={`w-full text-sm py-1 rounded border text-center transition-all
                    ${isActive 
                        ? slot.type === 'online' ? 'bg-amber-200 border-amber-300' 
                        : slot.type === 'in_person' ? 'bg-blue-200 border-blue-300' 
                        : 'bg-green-200 border-green-300' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {time}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BaseWeekView;
