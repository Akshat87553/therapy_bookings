import React, { useState } from 'react';
import axios from 'axios';
import BaseWeekView from '../components/availability/BaseWeekView';
import MonthlyView from '../components/availability/MonthlyView';

type ViewMode = 'week' | 'month';

// Adjusted to match your routes
const API_URL = 'http://localhost:5000/api';

const Availability: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // Get JWT from localStorage
  const getToken = (): string | null => {
    return localStorage.getItem('token');
  };

  const handleSlotSelect = async (
    date: string,
    day: string,
    time: string,
    type: string,
    isAvailable: boolean
  ) => {
    try {
      const token = getToken();
      // Always send request; server handles auth via token
      await axios.post(
        `${API_URL}/schedule/availability`,
        {
          date: date,
          day_of_week: day,
          time_slot: time,
          slot_type: type,
          is_available: isAvailable,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setError(null);
    } catch (error: any) {
      console.error('Error updating availability:', error);
      if (error.response?.status === 401) {
        setError('Please log in to update availability');
      } else {
        setError('Failed to update availability');
      }
    }
  };

  const handleSaveChanges = async () => {
    console.log('Changes saved');
    setError(null);
  };

  // Handle date selection from MonthlyView
  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setViewMode('week');
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-2 bg-red-100 text-red-800 rounded">{error}</div>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Availability</h2>

        <div className="flex space-x-1 bg-gray-100 rounded-md p-1">
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              viewMode === 'week' ? 'bg-white shadow-sm' : 'text-gray-600'
            }`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              viewMode === 'month' ? 'bg-white shadow-sm' : 'text-gray-600'
            }`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {viewMode === 'week' ? (
          <BaseWeekView startDate={currentDate} onSlotSelect={handleSlotSelect} />
        ) : (
          <MonthlyView
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onDateSelect={handleDateSelect}
          />
        )}
      </div>

      <div className="flex justify-end">
        <button
          className="px-6 py-2 bg-olive-700 text-white rounded-md hover:bg-olive-800 transition-colors"
          onClick={handleSaveChanges}
        >
          SAVE CHANGES
        </button>
      </div>
    </div>
  );
};

export default Availability;
