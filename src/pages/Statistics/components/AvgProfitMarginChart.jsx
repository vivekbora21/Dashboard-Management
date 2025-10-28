import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AvgProfitMarginChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        label: 'Profit Margin (%)',
        data: data.map(item => item.profit_margin),
        backgroundColor: '#82ca9d',
        borderColor: '#82ca9d',
        borderWidth: 1,
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
            return context.parsed.y + '%';
          },
        },
        backgroundColor: '#333',
        titleColor: '#00ffb3',
        bodyColor: '#00ffb3',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default AvgProfitMarginChart;
