import React from 'react';
import { Download } from 'lucide-react';

interface ClientMetricsProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const ClientMetrics: React.FC<ClientMetricsProps> = ({ period }) => {
  // This is simplified - in a real app, you'd use a proper charting library like Chart.js or Recharts
  
  // Sample data
  const clientTypes = [
    { label: 'New Clients', value: 12, color: 'bg-blue-500' },
    { label: 'Returning Clients', value: 30, color: 'bg-green-500' },
    { label: 'Inactive Clients', value: 8, color: 'bg-gray-300' }
  ];
  
  const total = clientTypes.reduce((sum, type) => sum + type.value, 0);
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-800">Client Metrics</h3>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
          <Download className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-center mb-8">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {clientTypes.map((type, index) => {
                const percentage = type.value / total;
                const startAngle = index === 0 ? 0 : clientTypes.slice(0, index).reduce((sum, t) => sum + (t.value / total) * 360, 0);
                const endAngle = startAngle + percentage * 360;
                
                const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
                const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
                
                const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
                
                return (
                  <path 
                    key={index}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    className={type.color}
                    strokeWidth="0"
                  />
                );
              })}
              <circle cx="50" cy="50" r="30" fill="white" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-800">{total}</span>
              <span className="text-sm text-gray-500">Total Clients</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {clientTypes.map((type, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${type.color} mr-2`}></div>
                <span className="text-gray-700">{type.label}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-800">{type.value}</span>
                <span className="text-gray-500 ml-2">({Math.round(type.value / total * 100)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientMetrics;