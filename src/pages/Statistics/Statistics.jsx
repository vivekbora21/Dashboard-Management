import React, { useState, useEffect, useRef } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import api from "../../api.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Statistics.css";
import { FaDownload } from 'react-icons/fa';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const statsRef = useRef();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          salesTrendRes,
          dailySalesRes,
          profitPerProductRes,
          topProductsRes,
          profitPerCategoryRes,
          avgRatingsRes,
          categoryDistributionRes
        ] = await Promise.all([
          api.get("/statistics/sales-trend"),
          api.get("/statistics/daily-sales"),
          api.get("/statistics/profit-per-product"),
          api.get("/statistics/top-products"),
          api.get("/statistics/profit-per-category"),
          api.get("/statistics/avg-ratings"),
          api.get("/statistics/category-distribution")
        ]);
        setStats({
          sales_trend: salesTrendRes.data,
          daily_sales: dailySalesRes.data,
          profit_per_product: profitPerProductRes.data,
          top_products: topProductsRes.data,
          profit_per_category: profitPerCategoryRes.data,
          avg_ratings: avgRatingsRes.data,
          category_distribution: categoryDistributionRes.data
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="loading">Loading statistics...</div>;

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

  const categoryPerformanceData = stats.category_distribution.map(cat => {
    const profitCat = stats.profit_per_category.find(p => p.productCategory === cat.category);
    return {
      category: cat.category,
      sales: cat.value,
      profit: profitCat ? profitCat.profit : 0
    };
  });

  const handleDownloadPDF = async () => {
    const input = statsRef.current;
    const canvas = await html2canvas(input, { scale: 3 , backgroundColor: "#fff", allowTaint: true});
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("statistics.pdf");
  };

  return (
    <div className="statistics-page">
      <div className="page-header">
        <h1>📊 Statistical Analytics</h1>
        <p>All your important statistics at a glance</p>
        <button className="download-btn" onClick={handleDownloadPDF}>
          <FaDownload/> Download PDF
        </button>
      </div>

      <div className="chart-grid" ref={statsRef}>
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
        <div className="chart-card">
          <h3>Category Distribution (Pie)</h3>
          <div style={{ height: 300 }}>
            {(() => {
              const total = stats.category_distribution.reduce((sum, item) => sum + item.value, 0);
              return (
                <ResponsivePie
                  data={stats.category_distribution.map(item => ({
                    id: item.category,
                    label: item.category,
                    value: item.value
                  }))}
                  margin={{ top: 30, right: 40, bottom: 80, left: 60 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  colors={{ scheme: "paired" }}
                  borderWidth={1}
                  borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                  radialLabelsSkipAngle={10}
                  radialLabelsTextXOffset={6}
                  radialLabelsTextColor="#333333"
                  radialLabelsLinkOffset={0}
                  radialLabelsLinkDiagonalLength={16}
                  radialLabelsLinkHorizontalLength={24}
                  radialLabelsLinkStrokeWidth={1}
                  radialLabelsLinkColor={{ from: "color" }}
                  slicesLabelsSkipAngle={10}
                  slicesLabelsTextColor="#333333"
                  slicesLabelsText={({ datum }) => `${((datum.value / total) * 100).toFixed(1)}%`}
                  animate={true}
                  motionStiffness={90}
                  motionDamping={15}
                  tooltip={({ datum }) => (
                    <div
                      style={{
                        background: "#333",
                        color: "#00ffb3",
                        padding: "6px 10px",
                        borderRadius: "5px",
                      }}
                    >
                      <strong>{datum.label}</strong>
                      <br />
                      Value: {datum.value.toLocaleString()}
                      <br />
                      Share: {((datum.value / total) * 100).toFixed(1)}%
                    </div>
                  )}
                />
              );
            })()}
          </div>
        </div>
        <div className="chart-card">
          <h3>Category Performance Comparison</h3>
          <div style={{ height: 300 }}>
            <ResponsiveBar
              data={categoryPerformanceData}
              keys={["sales", "profit"]}
              indexBy="category"
              margin={{ top: 30, right: 40, bottom: 80, left: 60 }}
              padding={0.3}
              colors={{ scheme: "set2" }}
              tooltip={({ indexValue, value, id }) => (
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
                  {id}: {value.toLocaleString()}
                </div>
              )}
              axisBottom={{ tickRotation: -45 }}
              axisLeft={{ tickSize: 5, tickPadding: 5, format: value => value.toLocaleString() }}
            />
          </div>
        </div>
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
