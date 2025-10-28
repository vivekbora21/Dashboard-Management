import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const RevenueProfitMarginChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        type: 'bar',
        label: 'Revenue',
        data: data.map(item => item.revenue),
        backgroundColor: '#8884d8',
        borderColor: '#8884d8',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Profit Margin (%)',
        data: data.map(item => item.profit_margin),
        borderColor: '#82ca9d',
        backgroundColor: '#82ca9d',
        tension: 0.1,
        yAxisID: 'y1',
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
            if (context.dataset.type === 'bar') {
              return context.parsed.y.toLocaleString();
            } else {
              return context.parsed.y + '%';
            }
          },
        },
        backgroundColor: '#333',
        titleColor: '#00ffb3',
        bodyColor: '#00ffb3',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: {
          callback: function(value) {
            return value + '%';
          },
        },
        grid: {
          drawOnChartArea: false,
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

export default RevenueProfitMarginChart;
