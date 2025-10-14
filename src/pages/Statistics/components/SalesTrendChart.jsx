import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SalesTrendChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Sales',
        data: data.map(item => item.sales),
        borderColor: '#8884d8',
        backgroundColor: '#8884d8',
        tension: 0.1,
      },
      {
        label: 'Profit',
        data: data.map(item => item.profit),
        borderColor: '#82ca9d',
        backgroundColor: '#82ca9d',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.parsed.y.toLocaleString();
          },
        },
        backgroundColor: '#333',
        titleColor: '#00ffb3',
        bodyColor: '#00ffb3',
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default SalesTrendChart;
