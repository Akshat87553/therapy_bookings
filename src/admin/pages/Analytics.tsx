import React, { useState } from 'react';
import { BarChart3, PieChart, LineChart, Calendar, Filter } from 'lucide-react';
import ClientMetrics from '../components/analytics/ClientMetrics';
import SessionMetrics from '../components/analytics/SessionMetrics';

type MetricPeriod = 'week' | 'month' | 'quarter' | 'year';

const Analytics = () => {
  const [period, setPeriod] = useState<MetricPeriod>('month');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Analytics</h2>
        
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1 bg-gray-100 rounded-md p-1">
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                period === 'week' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
              onClick={() => setPeriod('week')}
            >
              Week
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                period === 'month' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
              onClick={() => setPeriod('month')}
            >
              Month
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                period === 'quarter' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
              onClick={() => setPeriod('quarter')}
            >
              Quarter
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                period === 'year' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
              onClick={() => setPeriod('year')}
            >
              Year
            </button>
          </div>
          
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <Calendar className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Total Clients</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">42</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <PieChart className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">↑ 12%</span>
            <span className="text-gray-500 ml-1">vs previous {period}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Total Sessions</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">156</p>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <BarChart3 className="w-6 h-6 text-green-500" />
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">↑ 8%</span>
            <span className="text-gray-500 ml-1">vs previous {period}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Revenue</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹ 1,45,200</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-full">
              <LineChart className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <span className="text-green-600 font-medium">↑ 15%</span>
            <span className="text-gray-500 ml-1">vs previous {period}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientMetrics period={period} />
        <SessionMetrics period={period} />
      </div>
    </div>
  );
};

export default Analytics;