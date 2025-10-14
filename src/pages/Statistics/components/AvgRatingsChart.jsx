import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const AvgRatingsChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.productCategory),
    datasets: [
      {
        label: 'Avg Rating',
        data: data.map(item => item.avg_rating),
        backgroundColor: '#ffc658',
        borderColor: '#ffc658',
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
            return context.parsed.y.toFixed(2) + ' Avg Rating';
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
            return value.toFixed(2);
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

export default AvgRatingsChart;
