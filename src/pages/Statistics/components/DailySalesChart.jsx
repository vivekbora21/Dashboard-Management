import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip);

const DailySalesChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.soldDate),
    datasets: [
      {
        label: 'Quantity Sold',
        data: data.map(item => item.quantity),
        borderColor: '#ff7300',
        backgroundColor: '#ff7300',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.parsed.y.toLocaleString() + ' Quantity Sold';
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
      <Line data={chartData} options={options} />
    </div>
  );
};

export default DailySalesChart;
