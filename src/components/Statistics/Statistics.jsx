import React, { useState, useEffect } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import api from "../../api.js";
import "./Statistics.css";

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

  // 🔸 Format line data for Nivo
  const salesTrendData = [
    {
      id: "Sales",
      color: "#8884d8",
      data: stats.sales_trend.map(item => ({ x: item.month, y: item.sales })),
    },
    {
      id: "Profit",
      color: "#82ca9d",
      data: stats.sales_trend.map(item => ({ x: item.month, y: item.profit })),
    },
  ];

  const dailySalesData = [
    {
      id: "Quantity Sold",
      color: "#ff7300",
      data: stats.daily_sales.map(item => ({ x: item.soldDate, y: item.quantity })),
    },
  ];

  return (
    <div className="statistics-page">
      <div className="page-header">
        <h1>📊 Statistical Analytics</h1>
        <p>All your important statistics at a glance</p>
      </div>

      <div className="chart-grid">

        {/* 🔹 Monthly Sales & Profit Trend */}
        <div className="chart-card">
          <h3>Monthly Sales & Profit Trend</h3>
          <div style={{ height: 300 }}>
            <ResponsiveLine
              data={salesTrendData}
              margin={{ top: 30, right: 40, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
              axisBottom={{ tickRotation: -45 }}
              axisLeft={{ tickSize: 5, tickPadding: 5, format: value => value.toLocaleString() }}
              colors={{ scheme: "set2" }}
              pointSize={8}
              pointBorderWidth={2}
              useMesh={true}
              tooltip={({ point }) => (
                <div
                  style={{
                    background: "#333",
                    color: "#00ffb3",
                    padding: "4px 5px",
                    borderRadius: "5px",
                  }}
                >
                  <strong>{point.seriesId}</strong>: {point.data.y.toLocaleString()}
                </div>
              )}
            />
          </div>
        </div>

        {/* 🔹 Daily Sales Count */}
        <div className="chart-card">
          <h3>Daily Sales Count</h3>
          <div style={{ height: 300 }}>
            <ResponsiveLine
              data={dailySalesData}
              margin={{ top: 30, right: 40, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              axisBottom={{ tickRotation: -45 }}
              axisLeft={{ tickSize: 5, tickPadding: 5, format: value => value.toLocaleString() }}
              colors={["#ff7300"]}
              pointSize={8}
              pointBorderWidth={2}
              useMesh={true}
              tooltip={({ point }) => (
                <div
                  style={{
                    background: "#333",
                    color: "#ffc658",
                    padding: "6px 10px",
                    borderRadius: "5px",
                  }}
                >
                  <strong>{point.data.xFormatted}</strong>: {point.data.y.toLocaleString()}
                </div>
              )}
            />
          </div>
        </div>

        {/* 🔹 Profit per Product */}
        <div className="chart-card">
          <h3>Profit per Product</h3>
          <div style={{ height: 300 }}>
            <ResponsiveBar
              data={stats.profit_per_product}
              keys={["profit"]}
              indexBy="productName"
              margin={{ top: 30, right: 40, bottom: 80, left: 60 }}
              padding={0.3}
              colors={["#64f875"]}
              tooltip={({ indexValue, value }) => (
                <div
                  style={{
                    background: "#333",
                    color: "#00ffb3",
                    padding: "6px 10px",
                    borderRadius: "5px",
                  }}
                >
                  <strong>{indexValue}</strong>
                  <br />
                  Profit: {value.toLocaleString()}
                </div>
              )}
              axisBottom={{ tickRotation: -45 }}
              axisLeft={{ tickSize: 5, tickPadding: 5, format: value => value.toLocaleString() }}
            />
          </div>
        </div>

        {/* 🔹 Top 5 Selling Products */}
        <div className="chart-card">
          <h3>Top 5 Selling Products</h3>
          <div style={{ height: 300 }}>
            <ResponsiveBar
              data={stats.top_products}
              keys={["quantity"]}
              indexBy="productName"
              margin={{ top: 30, right: 40, bottom: 80, left: 60 }}
              padding={0.3}
              colors={["#8884d8"]}
              tooltip={({ indexValue, value }) => (
                <div
                  style={{
                    background: "#333",
                    color: "#ffc658",
                    padding: "6px 10px",
                    borderRadius: "5px",
                  }}
                >
                  <strong>{indexValue}</strong>
                  <br />
                  Sold: {value.toLocaleString()}
                </div>
              )}
              axisBottom={{ tickRotation: -45 }}
              axisLeft={{ tickSize: 5, tickPadding: 5, format: value => value.toLocaleString() }}
            />
          </div>
        </div>

        {/* 🔹 Profit per Category */}
        <div className="chart-card">
          <h3>Profit per Category</h3>
          <div style={{ height: 300 }}>
            <ResponsiveBar
              data={stats.profit_per_category}
              keys={["profit"]}
              indexBy="productCategory"
              margin={{ top: 30, right: 40, bottom: 80, left: 60 }}
              padding={0.3}
              colors={["#FF8042"]}
              tooltip={({ indexValue, value }) => (
                <div
                  style={{
                    background: "#333",
                    color: "#00ffb3",
                    padding: "6px 10px",
                    borderRadius: "5px",
                  }}
                >
                  <strong>{indexValue}</strong>
                  <br />
                  Profit: {value.toLocaleString()}
                </div>
              )}
              axisBottom={{ tickRotation: -45 }}
              axisLeft={{ tickSize: 5, tickPadding: 5, format: value => value.toLocaleString() }}
            />
          </div>
        </div>

        {/* 🔹 Average Ratings per Category */}
        <div className="chart-card">
          <h3>Average Ratings per Category</h3>
          <div style={{ height: 300 }}>
            <ResponsiveBar
              data={stats.avg_ratings}
              keys={["avg_rating"]}
              indexBy="productCategory"
              margin={{ top: 30, right: 40, bottom: 80, left: 60 }}
              padding={0.3}
              colors={["#ffc658"]}
              tooltip={({ indexValue, value }) => (
                <div
                  style={{
                    background: "#333",
                    color: "#00ffb3",
                    padding: "6px 10px",
                    borderRadius: "5px",
                  }}
                >
                  <strong>{indexValue}</strong>
                  <br />
                  Avg Rating: {value.toFixed(2)}
                </div>
              )}
              axisBottom={{ tickRotation: -45 }}
              axisLeft={{ tickSize: 5, tickPadding: 5, format: value => value.toLocaleString() }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
