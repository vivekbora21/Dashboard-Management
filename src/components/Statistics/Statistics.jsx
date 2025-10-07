import React, { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from "recharts";
import api from "../../api.js";
import "./Statistics.css";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F", "#FFBB28", "#FF8042"];

const Statistics = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/statistics/");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="loading">Loading statistics...</div>;

  return (
    <div className="statistics-page">
      <div className="page-header">
        <h1>📊 Statistical Analytics</h1>
        <p>All your important statistics at a glance</p>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Monthly Sales & Profit Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.sales_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} name="Sales" />
              <Line type="monotone" dataKey="profit" stroke="#82ca9d" strokeWidth={2} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Daily Sales Count</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.daily_sales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="soldDate" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="quantity" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-card">
          <h3>Profit per Product</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.profit_per_product}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="profit" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Top 5 Selling Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.top_products}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Profit per Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.profit_per_category}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productCategory" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="profit" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Average Ratings per Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.avg_ratings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productCategory" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg_rating" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        
      </div>
    </div>

  );
};

export default Statistics;
