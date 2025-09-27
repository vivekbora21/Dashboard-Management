import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../api.js';
import './Statistics.css';

const Statistics = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('week');
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#A28EFF', '#FF6384', '#36A2EB', '#FFCE56'];

  const fetchProductsByDate = async (date) => {
    setLoading(true);
    try {
      const response = await api.get(`/products/date/${date}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
    setLoading(false);
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/summary?period=${period}`);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummary([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductsByDate(selectedDate);
    fetchSummary();
  }, [selectedDate, period]);

  const calculateProfit = (product) => {
    return product.sellingPrice - product.productPrice;
  };

  const pieData = products.map(product => ({
    name: product.productName,
    value: calculateProfit(product),
  })).filter(item => item.value > 0);

  const barData = products.map(product => ({
    name: product.productName,
    productPrice: product.productPrice,
    sellingPrice: product.sellingPrice,
    profit: calculateProfit(product),
  }));

  return (
    <div className="statistics-container">
      <h1>Statistics</h1>
      <div className="selectors-section">
        <div className="date-picker-section">
          <label htmlFor="date-picker">Select Date: </label>
          <input
            type="date"
            id="date-picker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="period-selector-section">
          <label htmlFor="period-selector">Select Period: </label>
          <select
            id="period-selector"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {products.length === 0 ? (
            <p>No products found for the selected date.</p>
          ) : (
            <div className="charts-container">
              <div className="pie-chart-section">
                <h2>Profit Distribution by Product (Pie Chart)</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bar-chart-section">
                <h2>Price Comparison (Bar Chart)</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="productPrice" fill="#8884d8" name="Product Price" />
                    <Bar dataKey="sellingPrice" fill="#82ca9d" name="Selling Price" />
                    <Bar dataKey="profit" fill="#ffc658" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="line-chart-section">
            <h2>Sales and Profit Over Time (Line Chart)</h2>
            {summary.length === 0 ? (
              <p>No data available for the selected period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={summary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales" />
                  <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Statistics;

