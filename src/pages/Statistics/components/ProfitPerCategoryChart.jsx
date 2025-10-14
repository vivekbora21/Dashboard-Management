import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProfitPerCategoryChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="productCategory" />
          <YAxis tickFormatter={(value) => value.toLocaleString()} />
          <Tooltip
            formatter={(value) => [value.toLocaleString(), 'Profit']}
            labelStyle={{ color: '#00ffb3' }}
            contentStyle={{ backgroundColor: '#333', border: 'none' }}
          />
          <Bar dataKey="profit" fill="#FF8042" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitPerCategoryChart;
