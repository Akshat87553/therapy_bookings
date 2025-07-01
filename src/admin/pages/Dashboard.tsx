// src/admin/components/Dashboard.tsx
import React from 'react';
import DaySelector from '../components/dashboard/DaySelector';
import AppointmentList from '../components/dashboard/AppointmentList';
import { format } from 'date-fns';

const Dashboard = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            className="ml-4 px-4 py-1 text-sm rounded-full border border-olive-700 text-olive-700 font-medium"
            onClick={() => setCurrentDate(new Date())}
          >
            TODAY
          </button>
        </div>
      </div>

      <DaySelector currentDate={currentDate} onDateChange={setCurrentDate} />

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-6">
          Sessions for {format(currentDate, 'do MMMM')}
        </h3>
        <AppointmentList date={currentDate} />
      </div>
    </div>
  );
};

export default Dashboard;
