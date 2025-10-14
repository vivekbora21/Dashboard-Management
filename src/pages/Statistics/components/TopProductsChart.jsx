import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const TopProductsChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.productName),
    datasets: [
      {
        label: 'Sold',
        data: data.map(item => item.quantity),
        backgroundColor: '#8884d8',
        borderColor: '#8884d8',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.parsed.y.toLocaleString() + ' Sold';
          },
        },
        backgroundColor: '#333',
        titleColor: '#ffc658',
        bodyColor: '#ffc658',
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TopProductsChart;
