import React, { useState, useEffect, useRef, useMemo, lazy } from "react";
import api from "../../api.js";
import "./Statistics.css";
import { FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ChartWrapper from "./components/ChartWrapper";
import Loading from "../../components/Loading";

const chartImports = {
  salesTrend: lazy(() => import("./components/SalesTrendChart")),
  dailySales: lazy(() => import("./components/DailySalesChart")),
  categoryDistribution: lazy(() => import("./components/CategoryDistributionChart")),
  categoryPerformance: lazy(() => import("./components/CategoryPerformanceChart")),
  profitPerProduct: lazy(() => import("./components/ProfitPerProductChart")),
  topProducts: lazy(() => import("./components/TopProductsChart")),
  profitPerCategory: lazy(() => import("./components/ProfitPerCategoryChart")),
  avgRatings: lazy(() => import("./components/AvgRatingsChart")),
};

const TIME_PERIODS = { DAY: "day", WEEK: "week", MONTH: "month", YEAR: "year", ALL: "all" };

const Statistics = () => {
  const { userPlan } = useAuth();
  const navigate = useNavigate();
  const statsRef = useRef();
  const [stats, setStats] = useState(null);

  const PLAN_LEVELS = { free: 1, basic: 2, premium: 3 };

  const chartConfig = [
    { key: "salesTrend", title: "Monthly Sales & Profit Trend", plan: "free" },
    { key: "dailySales", title: "Daily Sales Count", plan: "free" },
    { key: "categoryDistribution", title: "Category Distribution", plan: "basic" },
    { key: "categoryPerformance", title: "Category Performance Comparison", plan: "basic" },
    { key: "profitPerProduct", title: "Profit per Product", plan: "basic" },
    { key: "topProducts", title: "Top 5 Selling Products", plan: "premium" },
    { key: "profitPerCategory", title: "Profit per Category", plan: "premium" },
    { key: "avgRatings", title: "Average Ratings per Category", plan: "premium" },
  ];

  const [timeFilters, setTimeFilters] = useState(() =>
    chartConfig.reduce((acc, c) => {
      acc[c.key] = TIME_PERIODS.ALL;
      return acc;
    }, {})
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoints = [
          "sales-trend",
          "daily-sales",
          "profit-per-product",
          "top-products",
          "profit-per-category",
          "avg-ratings",
          "category-distribution",
        ];
        const responses = await Promise.allSettled(
          endpoints.map((ep) => {
            const key = ep.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
            return api.get(`/statistics/${ep}?period=${timeFilters[key] || "all"}`);
          })
        );
        const [salesTrend, dailySales, profitPerProduct, topProducts, profitPerCategory, avgRatings, categoryDistribution] =
          responses.map((r) => (r.status === "fulfilled" ? r.value.data : []));

        setStats({
          sales_trend: salesTrend,
          daily_sales: dailySales,
          profit_per_product: profitPerProduct,
          top_products: topProducts,
          profit_per_category: profitPerCategory,
          avg_ratings: avgRatings,
          category_distribution: categoryDistribution,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };
    fetchStats();
  }, [timeFilters]);

  const handleTimeFilterChange = (chartType, period) =>
    setTimeFilters((prev) => ({ ...prev, [chartType]: period }));

  const mapData = {
    salesTrend: (d) => d.map((i) => ({ month: i.month, sales: i.sales, profit: i.profit })),
    dailySales: (d) => d.map((i) => ({ soldDate: i.soldDate, quantity: i.quantity })),
    categoryPerformance: (d, s) =>
      s.category_distribution?.map((cat) => ({
        category: cat.category,
        sales: cat.value,
        profit: s.profit_per_category?.find((p) => p.productCategory === cat.category)?.profit || 0,
      })) || [],
    default: (d) => d,
  };

  const processedData = useMemo(() => {
    if (!stats) return {};
    return {
      salesTrend: mapData.salesTrend(stats.sales_trend || []),
      dailySales: mapData.dailySales(stats.daily_sales || []),
      categoryPerformance: mapData.categoryPerformance(stats, stats),
      profitPerProduct: mapData.default(stats.profit_per_product || []),
      topProducts: mapData.default(stats.top_products || []),
      profitPerCategory: mapData.default(stats.profit_per_category || []),
      avgRatings: mapData.default(stats.avg_ratings || []),
      categoryDistribution: mapData.default(stats.category_distribution || []),
    };
  }, [stats]);

  const handleDownloadPDF = async () => {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
    const canvas = await html2canvas(statsRef.current, { scale: 2, backgroundColor: "#fff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight * 0.95);
    pdf.save("statistics.pdf");
  };

  if (!stats) return <Loading overlay />;

  const hasData = Object.values(stats).some((d) => Array.isArray(d) && d.length);
  if (!hasData)
    return (
      <div className="statistics-page">
        <div className="page-heading-container">
          <h1>📊 Statistical Analytics</h1>
          <p>All your important statistics at a glance</p>
        </div>
        <div className="no-data-message">
          <h2>No Products Added Yet</h2>
          <p>Please add some products to view statistics and charts.</p>
          <button className="add-btn" onClick={() => navigate("/dashboard/addproduct")}>
            Add Product
          </button>
        </div>
      </div>
    );

  return (
    <div className="statistics-page">
      <div className="page-heading-container">
        <h1>📊 Statistical Analytics</h1>
        <p>All your important statistics at a glance</p>
      </div>

      <button className="download-btn" onClick={handleDownloadPDF}>
        <FaDownload /> Download PDF
      </button>

      <div className="chart-grid" ref={statsRef}>
        {chartConfig.map(({ key, title, plan }) => {
          const ChartComponent = chartImports[key];
          return (
            <ChartWrapper
              key={key}
              title={title}
              chartType={key}
              currentFilter={timeFilters[key]}
              onTimeFilterChange={handleTimeFilterChange}
              requiredPlan={plan}
            >
              <ChartComponent data={processedData[key]} timeFilter={timeFilters[key]} />
            </ChartWrapper>
          );
        })}
      </div>
    </div>
  );
};

export default Statistics;
