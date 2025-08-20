
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../../../../types';

interface SimpleBarChartProps {
  data: ChartDataPoint[];
  barColor?: string;
  xAxisKey?: string;
  dataKey: string; // The key in data objects that holds the value for the bar
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, barColor = "#8884d8", xAxisKey = "name", dataKey }) => {
   if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 p-4">No hay datos disponibles para el gráfico.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill={barColor} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SimpleBarChart;
