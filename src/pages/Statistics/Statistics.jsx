import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from "react";
import api from "../../api.js";
import "./Statistics.css";
import { FaDownload } from "react-icons/fa";

const SalesTrendChart = lazy(() => import("./components/SalesTrendChart"));
const DailySalesChart = lazy(() => import("./components/DailySalesChart"));
const CategoryDistributionChart = lazy(() => import("./components/CategoryDistributionChart"));
const CategoryPerformanceChart = lazy(() =>import("./components/CategoryPerformanceChart"));
const ProfitPerProductChart = lazy(() =>import("./components/ProfitPerProductChart"));
const TopProductsChart = lazy(() => import("./components/TopProductsChart"));
const ProfitPerCategoryChart = lazy(() =>import("./components/ProfitPerCategoryChart"));
const AvgRatingsChart = lazy(() => import("./components/AvgRatingsChart"));

const ChartLoader = () => (
  <div
    style={{
      width: "100%",
      height: 300,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8fafc",
      borderRadius: "20px",
    }}
  >
    <div>Loading chart...</div>
  </div>
);

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const statsRef = useRef();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const responses = await Promise.allSettled([
          api.get("/statistics/sales-trend"),
          api.get("/statistics/daily-sales"),
          api.get("/statistics/profit-per-product"),
          api.get("/statistics/top-products"),
          api.get("/statistics/profit-per-category"),
          api.get("/statistics/avg-ratings"),
          api.get("/statistics/category-distribution"),
        ]);

        const [
          salesTrendRes,
          dailySalesRes,
          profitPerProductRes,
          topProductsRes,
          profitPerCategoryRes,
          avgRatingsRes,
          categoryDistributionRes,
        ] = responses.map((r) =>
          r.status === "fulfilled" ? r.value : { data: [] }
        );

        setStats({
          sales_trend: salesTrendRes.data,
          daily_sales: dailySalesRes.data,
          profit_per_product: profitPerProductRes.data,
          top_products: topProductsRes.data,
          profit_per_category: profitPerCategoryRes.data,
          avg_ratings: avgRatingsRes.data,
          category_distribution: categoryDistributionRes.data,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStats();
  }, []);

  const salesTrendData = useMemo(() => {
    if (!stats?.sales_trend) return [];
    return stats.sales_trend.map((item) => ({
      month: item.month,
      sales: item.sales,
      profit: item.profit,
    }));
  }, [stats?.sales_trend]);

  const dailySalesData = useMemo(() => {
    if (!stats?.daily_sales) return [];
    return stats.daily_sales.map((item) => ({
      soldDate: item.soldDate,
      quantity: item.quantity,
    }));
  }, [stats?.daily_sales]);

  const categoryPerformanceData = useMemo(() => {
    if (!stats?.category_distribution || !stats?.profit_per_category)
      return [];
    return stats.category_distribution.map((cat) => {
      const profitCat = stats.profit_per_category.find(
        (p) => p.productCategory === cat.category
      );
      return {
        category: cat.category,
        sales: cat.value,
        profit: profitCat ? profitCat.profit : 0,
      };
    });
  }, [stats?.category_distribution, stats?.profit_per_category]);

  const handleDownloadPDF = async () => {
    const { default: html2canvas } = await import("html2canvas");
    const { default: jsPDF } = await import("jspdf");

    const input = statsRef.current;
    const canvas = await html2canvas(input, {
      scale: 3,
      backgroundColor: "#fff",
      allowTaint: true,
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("statistics.pdf");
  };

  if (!stats) return <div className="loading">Loading statistics...</div>;

  return (
    <div className="statistics-page">
      <div className="page-header">
        <h1>📊 Statistical Analytics</h1>
        <p>All your important statistics at a glance</p>
        <button className="download-btn" onClick={handleDownloadPDF}>
          <FaDownload /> Download PDF
        </button>
      </div>

      <div className="chart-grid" ref={statsRef}>
        <div className="chart-card">
          <h3>Monthly Sales & Profit Trend</h3>
          <Suspense fallback={<ChartLoader />}>
            <SalesTrendChart data={salesTrendData} />
          </Suspense>
        </div>

        <div className="chart-card">
          <h3>Daily Sales Count</h3>
          <Suspense fallback={<ChartLoader />}>
            <DailySalesChart data={dailySalesData} />
          </Suspense>
        </div>

        <div className="chart-card">
          <h3>Category Distribution (Pie)</h3>
          <Suspense fallback={<ChartLoader />}>
            <CategoryDistributionChart data={stats.category_distribution} />
          </Suspense>
        </div>

        <div className="chart-card">
          <h3>Category Performance Comparison</h3>
          <Suspense fallback={<ChartLoader />}>
            <CategoryPerformanceChart data={categoryPerformanceData} />
          </Suspense>
        </div>

        <div className="chart-card">
          <h3>Profit per Product</h3>
          <Suspense fallback={<ChartLoader />}>
            <ProfitPerProductChart data={stats.profit_per_product} />
          </Suspense>
        </div>

        <div className="chart-card">
          <h3>Top 5 Selling Products</h3>
          <Suspense fallback={<ChartLoader />}>
            <TopProductsChart data={stats.top_products} />
          </Suspense>
        </div>

        <div className="chart-card">
          <h3>Profit per Category</h3>
          <Suspense fallback={<ChartLoader />}>
            <ProfitPerCategoryChart data={stats.profit_per_category} />
          </Suspense>
        </div>

        <div className="chart-card">
          <h3>Average Ratings per Category</h3>
          <Suspense fallback={<ChartLoader />}>
            <AvgRatingsChart data={stats.avg_ratings} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
