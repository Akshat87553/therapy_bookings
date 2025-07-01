import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import { format, addDays, isSameDay } from 'date-fns';

interface AvailabilitySlot {
  time: string;
  isAvailable: boolean;
  type: string;
}

interface BaseWeekViewProps {
  startDate: Date;
  onSlotSelect: (date: string, day: string, time: string, type: string, isAvailable: boolean) => void;
}

const API_URL = 'http://localhost:5000/api/schedule';

const BaseWeekView: React.FC<BaseWeekViewProps> = ({ startDate, onSlotSelect }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'Night' | 'Day'>('Day');
  const [slotType, setSlotType] = useState<'online' | 'in_person' | 'both'>('online');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, { available: boolean; type: string }>>({});
  const [error, setError] = useState<string | null>(null);

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const timeSlots = {
    Night: [
      '12:00 AM', '12:30 AM',
      '01:00 AM', '01:30 AM',
      '02:00 AM', '02:30 AM',
      '03:00 AM', '03:30 AM',
      '04:00 AM', '04:30 AM',
      '05:00 AM', '05:30 AM',
      '06:00 AM', '06:30 AM',
      '07:00 AM', '07:30 AM',
    ],
    Day: [
      '08:00 AM', '08:30 AM',
      '09:00 AM', '09:30 AM',
      '10:00 AM', '10:30 AM',
      '11:00 AM', '11:30 AM',
      '12:00 PM', '12:30 PM',
      '01:00 PM', '01:30 PM',
      '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM',
      '04:00 PM', '04:30 PM',
      '05:00 PM', '05:30 PM',
      '06:00 PM', '06:30 PM',
      '07:00 PM', '07:30 PM',
      '08:00 PM', '08:30 PM',
      '09:00 PM', '09:30 PM',
      '10:00 PM', '10:30 PM',
    ]
  };

  // Helper to get JWT token from localStorage
  const getToken = (): string | null => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    fetchAvailabilitySlots();
  }, [startDate]);

  const fetchAvailabilitySlots = async () => {
    try {
      const start = format(weekDates[0], 'yyyy-MM-dd');
      const end = format(weekDates[6], 'yyyy-MM-dd');
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_URL}/availability?start=${start}&end=${end}`,
        { headers }
      );

      const slots: Record<string, { available: boolean; type: string }> = {};
      response.data.forEach((dayEntry: { date: string; slots: AvailabilitySlot[] }) => {
        const dateKey = format(new Date(dayEntry.date), 'yyyy-MM-dd');
        dayEntry.slots.forEach((slot: AvailabilitySlot) => {
          const key = `${dateKey}-${slot.time}`;
          slots[key] = {
            available: slot.isAvailable,
            type: slot.type,
          };
        });
      });

      setSelectedSlots(slots);
      setError(null);
    } catch (e: any) {
      if (e.response?.status === 401) {
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

    const newSlot = {
      date: dateString,
      day_of_week: dayOfWeek,
      time_slot: time,
      slot_type: slotType,
      is_available: !isSelected,
    };

    // Optimistic UI update
    setSelectedSlots((prev) => ({
      ...prev,
      [key]: { available: !isSelected, type: slotType },
    }));

    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        `${API_URL}/availability`,
        newSlot,
        { headers }
      );
      onSlotSelect(dateString, dayOfWeek, time, slotType, !isSelected);
      setError(null);
    } catch (error: any) {
      console.error('Slot update failed:', error);
      if (error.response?.status === 401) {
        setError('Please log in to update availability');
      } else {
        setError('Failed to update slot');
      }
      // Revert on error
      setSelectedSlots((prev) => ({
        ...prev,
        [key]: { available: isSelected, type: slotType },
      }));
    }
  };

  // Determine today (actual date) and if all slots are selected for today
  const today = new Date();
  const todayString = format(today, 'yyyy-MM-dd');
  const isInWeek = weekDates.some((d) => isSameDay(d, today));
  const allPresentSelected = isInWeek && timeSlots[selectedTimeRange].every((time) => {
    const key = `${todayString}-${time}`;
    return selectedSlots[key]?.available;
  });

  const handleApplyToAll = () => {
    if (!isInWeek) return;
    setSelectedSlots((prev) => {
      const updated = { ...prev };
      weekDates.forEach((date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        if (dateString === todayString) return;
        timeSlots[selectedTimeRange].forEach((time) => {
          const presentKey = `${todayString}-${time}`;
          const targetKey = `${dateString}-${time}`;
          if (selectedSlots[presentKey]?.available) {
            updated[targetKey] = { available: true, type: selectedSlots[presentKey].type };
          }
        });
      });
      return updated;
    });
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
        <span className="text-sm">{selectedTimeRange}</span>
        <ChevronDown className="w-4 h-4" />
        <button onClick={() => setSelectedTimeRange((prev) => (prev === 'Night' ? 'Day' : 'Night'))} className="text-sm underline text-blue-600">
          Toggle to {selectedTimeRange === 'Night' ? 'Day' : 'Night'}
        </button>
      </div>

      <div className="grid grid-cols-8 gap-4 mt-4">
        <div></div>
        {weekDates.map((date) => (
          <div key={date.toISOString()} className="text-center">
            <div className="text-sm font-medium">{format(date, 'EEE, MMM d')}</div>
            <div className="text-xs text-gray-500">{format(date, 'yyyy-MM-dd')}</div>
          </div>
        ))}
      </div>

      {allPresentSelected && (
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="applyToAll" onChange={handleApplyToAll} />
          <label htmlFor="applyToAll" className="text-sm text-gray-700">Apply today’s slots to all days</label>
        </div>
      )}

      <div className="grid grid-cols-8 gap-4">
        <div className="space-y-2">
          {timeSlots[selectedTimeRange].map((time) => (
            <div key={time} className="text-sm text-right">{time}</div>
          ))}
        </div>

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
                    ${isActive ? slot.type === 'online' ? 'bg-amber-200 border-amber-300' : slot.type === 'in_person' ? 'bg-blue-200 border-blue-300' : 'bg-green-200 border-green-300' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
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
