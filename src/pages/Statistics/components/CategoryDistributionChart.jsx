import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const CategoryDistributionChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: COLORS,
        borderColor: COLORS,
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
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return value.toLocaleString() + ' (' + percentage + '%)';
          },
        },
        backgroundColor: '#333',
        titleColor: '#00ffb3',
        bodyColor: '#00ffb3',
      },
    },
  };

  return (
    <div style={{ width: '100%', height: 300 , display: "flex", justifyContent: "center", alignItems: "center"}}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default CategoryDistributionChart;
