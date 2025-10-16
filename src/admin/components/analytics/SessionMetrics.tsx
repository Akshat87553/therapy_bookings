import React from 'react';
import { Download } from 'lucide-react';

interface SessionMetricsProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const periodLabels: Record<SessionMetricsProps['period'], string> = {
  week: 'Weekly overview',
  month: 'Monthly overview',
  quarter: 'Quarterly overview',
  year: 'Year to date overview',
};

const SessionMetrics: React.FC<SessionMetricsProps> = ({ period }) => {
  // This is simplified - in a real app, you'd use a proper charting library
  
  // Sample data for bar chart
  const sessionData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Online',
        data: [18, 25, 20, 30],
        color: 'bg-blue-500'
      },
      {
        label: 'In-person',
        data: [12, 15, 22, 14],
        color: 'bg-green-500'
      }
    ]
  };
  
  // Find the maximum value to scale the chart
  const maxValue = Math.max(
    ...sessionData.datasets.flatMap(dataset => dataset.data)
  );
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h3 className="font-medium text-gray-800">Session Metrics</h3>
          <p className="text-xs text-gray-500">{periodLabels[period]}</p>
        </div>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
          <Download className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-end space-x-4 mb-4">
          {sessionData.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-3 h-3 ${dataset.color} mr-2`}></div>
              <span className="text-sm text-gray-600">{dataset.label}</span>
            </div>
          ))}
        </div>
        
        <div className="h-64 relative">
          <div className="flex h-full">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between pr-2 text-xs text-gray-500">
              <span>{maxValue}</span>
              <span>{Math.round(maxValue * 0.75)}</span>
              <span>{Math.round(maxValue * 0.5)}</span>
              <span>{Math.round(maxValue * 0.25)}</span>
              <span>0</span>
            </div>
            
            {/* Chart area */}
            <div className="flex-1 flex items-end">
              {sessionData.labels.map((label, labelIndex) => (
                <div key={labelIndex} className="flex-1 flex flex-col justify-end space-y-1">
                  {sessionData.datasets.map((dataset, datasetIndex) => {
                    const value = dataset.data[labelIndex];
                    const height = `${(value / maxValue) * 100}%`;
                    
                    return (
                      <div
                        key={datasetIndex}
                        className={`w-full mx-1 ${dataset.color}`}
                        style={{ height }}
                      ></div>
                    );
                  })}
                  <span className="text-xs text-gray-500 text-center mt-2">{label}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-1/4 border-t border-gray-100"></div>
            <div className="h-1/4 border-t border-gray-100"></div>
            <div className="h-1/4 border-t border-gray-100"></div>
            <div className="h-1/4 border-t border-gray-100"></div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Sessions</span>
            <span className="font-medium text-gray-800">156</span>
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: '65%' }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs">
            <span className="text-gray-500">Online: 93 (65%)</span>
            <span className="text-gray-500">In-person: 63 (35%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionMetrics;