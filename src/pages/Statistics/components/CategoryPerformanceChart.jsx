import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CategoryPerformanceChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis tickFormatter={(value) => value.toLocaleString()} />
          <Tooltip
            formatter={(value, name) => [value.toLocaleString(), name]}
            labelStyle={{ color: '#00ffb3' }}
            contentStyle={{ backgroundColor: '#333', border: 'none' }}
          />
          <Bar dataKey="sales" fill="#8884d8" />
          <Bar dataKey="profit" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPerformanceChart;
