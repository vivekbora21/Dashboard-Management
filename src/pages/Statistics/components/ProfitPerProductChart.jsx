import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const ProfitPerProductChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.productName),
    datasets: [
      {
        label: 'Profit',
        data: data.map(item => item.profit),
        backgroundColor: '#64f875',
        borderColor: '#64f875',
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
            return context.parsed.y.toLocaleString() + ' Profit';
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ProfitPerProductChart;
