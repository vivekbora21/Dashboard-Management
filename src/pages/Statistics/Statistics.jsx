import React, { useState, useEffect, useRef, useMemo, lazy } from "react";
import api from "../../api.js";
import "./Statistics.css";
import { FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ChartWrapper from "./components/ChartWrapper";
import Loading from "../../components/Loading";
import { toast } from "react-toastify";

const chartImports = {
  salesTrend: lazy(() => import("./components/SalesTrendChart")),
  dailySales: lazy(() => import("./components/DailySalesChart")),
  categoryDistribution: lazy(() => import("./components/CategoryDistributionChart")),
  categoryPerformance: lazy(() => import("./components/CategoryPerformanceChart")),
  profitPerProduct: lazy(() => import("./components/ProfitPerProductChart")),
  topProducts: lazy(() => import("./components/TopProductsChart")),
  profitPerCategory: lazy(() => import("./components/ProfitPerCategoryChart")),
  avgRatings: lazy(() => import("./components/AvgRatingsChart")),
  revenueProfitMarginTrend: lazy(() => import("./components/RevenueProfitMarginChart")),
  avgProfitMarginPerCategory: lazy(() => import("./components/AvgProfitMarginChart")),
};

const TIME_PERIODS = { DAY: "day", WEEK: "week", MONTH: "month", YEAR: "year", ALL: "all" };

const Statistics = () => {
  const { userPlan } = useAuth();
  const navigate = useNavigate();
  const statsRef = useRef();
  const [stats, setStats] = useState(null);
  const [chartsReady, setChartsReady] = useState(false);

  const PLAN_LEVELS = { free: 1, basic: 2, premium: 3 };

  const chartConfig = [
    { key: "salesTrend", title: "Monthly Sales & Profit Trend", plan: "free" },
    { key: "dailySales", title: "Daily Sales Count", plan: "free" },
    { key: "topProducts", title: "Top 5 Selling Products", plan: "free" },
    { key: "categoryDistribution", title: "Category Distribution", plan: "basic" },
    { key: "categoryPerformance", title: "Category Performance Comparison", plan: "basic" },
    { key: "profitPerProduct", title: "Profit per Product", plan: "basic" },
    { key: "profitPerCategory", title: "Profit per Category", plan: "basic" },
    { key: "avgRatings", title: "Average Ratings per Category", plan: "premium" },
    { key: "revenueProfitMarginTrend", title: "Revenue & Profit Margin Trend", plan: "premium" },
    { key: "avgProfitMarginPerCategory", title: "Average Profit Margin per Category", plan: "premium" },
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
          "revenue-profit-margin-trend",
          "avg-profit-margin-per-category",
        ];

        const responses = await Promise.allSettled(
          endpoints.map((ep) => {
            const key = ep.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
            return api.get(`/statistics/${ep}?period=${timeFilters[key] || "all"}`);
          })
        );

        const [
          salesTrend,
          dailySales,
          profitPerProduct,
          topProducts,
          profitPerCategory,
          avgRatings,
          categoryDistribution,
          revenueProfitMarginTrend,
          avgProfitMarginPerCategory,
        ] = responses.map((r) => (r.status === "fulfilled" ? r.value.data : []));

        setStats({
          sales_trend: salesTrend,
          daily_sales: dailySales,
          profit_per_product: profitPerProduct,
          top_products: topProducts,
          profit_per_category: profitPerCategory,
          avg_ratings: avgRatings,
          category_distribution: categoryDistribution,
          revenue_profit_margin_trend: revenueProfitMarginTrend,
          avg_profit_margin_per_category: avgProfitMarginPerCategory,
        });

        setTimeout(() => setChartsReady(true), 1500);
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
      revenueProfitMarginTrend: mapData.default(stats.revenue_profit_margin_trend || []),
      avgProfitMarginPerCategory: mapData.default(stats.avg_profit_margin_per_category || []),
    };
  }, [stats]);

  const handleDownloadPDF = async () => {
    if (userPlan === 'free') {
      toast.info("Upgrade to a higher plan to download statistics PDF");
      return;
    }

    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    const pdf = new jsPDF("p", "mm", "a4");
    const userLevel = PLAN_LEVELS[userPlan] || PLAN_LEVELS.free;
    const chartElements = Array.from(statsRef.current.querySelectorAll(".chart-wrapper"));

    const chartsPerPage = 4;
    const marginX = 10;
    const marginY = 10;
    const spacingX = 5;
    const spacingY = 8;
    const chartWidth = (pdf.internal.pageSize.getWidth() - marginX * 2 - spacingX) / 2;
    const chartHeight = (pdf.internal.pageSize.getHeight() - marginY * 2 - spacingY) / 2;

    let chartIndex = 0;
    for (let i = 0; i < chartElements.length; i++) {
      const chartEl = chartElements[i];
      const requiredPlan = chartConfig[i]?.plan || "free";
      const requiredLevel = PLAN_LEVELS[requiredPlan];
      if (requiredLevel > userLevel) continue;

      await new Promise((r) => setTimeout(r, 300));

      const canvas = await html2canvas(chartEl, {
        scale: 2,
        backgroundColor: "#fff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const row = Math.floor((chartIndex % chartsPerPage) / 2);
      const col = chartIndex % 2;

      const posX = marginX + col * (chartWidth + spacingX);
      const posY = marginY + row * (chartHeight + spacingY);

      pdf.addImage(imgData, "PNG", posX, posY, chartWidth, chartHeight);

      chartIndex++;

      if (chartIndex % chartsPerPage === 0 && i < chartElements.length - 1) {
        pdf.addPage();
      }
    }

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

      <button
        className="download-btn"
        onClick={handleDownloadPDF}
        disabled={!chartsReady}
      >
        <FaDownload /> {chartsReady ? "Download PDF" : "Preparing Charts..."}
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
