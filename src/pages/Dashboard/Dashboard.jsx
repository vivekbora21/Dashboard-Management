import React, { useEffect, useState, useCallback } from "react";
import api from '../../api';
import './Dashboard.css';
import StatCard from "../../components/StatCard.jsx";
import Loading from "../../components/Loading";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    avgRating: 0,
    totalOrders: 0,
    totalQuantity: 0,
    highestSellingProduct: null,
    highestProfitProduct: null,
    avgDiscount: 0,
    revenueGrowth: 0,
    profitMargin: 0,
    avgOrderValue: 0,
    topCategory: null
  });
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [
        totalSalesRes,
        totalProfitRes,
        avgRatingRes,
        totalOrdersRes,
        totalQuantityRes,
        highestSellingRes,
        highestProfitRes,
        avgDiscountRes,
        revenueGrowthRes,
        profitMarginRes,
        avgOrderValueRes,
        topCategoryRes,
      ] = await Promise.all([
        api.get("/kpi/total_sales"),
        api.get("/kpi/total_profit"),
        api.get("/kpi/avg_rating"),
        api.get("/kpi/total_orders"),
        api.get("/kpi/total_quantity"),
        api.get("/kpi/highest_selling_product"),
        api.get("/kpi/highest_profit_product"),
        api.get("/kpi/avg_discount"),
        api.get("/kpi/revenue_growth"),
        api.get("/kpi/profit_margin"),
        api.get("/kpi/avg_order_value"),
        api.get("/kpi/top_category"),
      ]);

      setStats({
        totalSales: totalSalesRes.data.value,
        totalProfit: totalProfitRes.data.value,
        avgRating: avgRatingRes.data.value,
        totalOrders: totalOrdersRes.data.value,
        totalQuantity: totalQuantityRes.data.value,
        highestSellingProduct: highestSellingRes.data,
        highestProfitProduct: highestProfitRes.data,
        avgDiscount: avgDiscountRes.data.value,
        revenueGrowth: revenueGrowthRes.data.value,
        profitMargin: profitMarginRes.data.value,
        avgOrderValue: avgOrderValueRes.data.value,
        topCategory: topCategoryRes.data.value,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchTopProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const productsResponse = await api.get("/kpi/top_profit_products", { params: { limit: 5 } });
      setProducts(productsResponse.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchTopProducts();

    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchStats, fetchTopProducts]);

  const formattedDateTime = currentDateTime.toLocaleDateString('en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + currentDateTime.toLocaleTimeString();

  const statItems = [
  { icon: "💰", title: "Total Sales", value: `₹ ${(stats.totalSales || 0).toLocaleString('en-IN')}` },
  { icon: "📈", title: "Total Profit", value: `₹ ${(stats.totalProfit || 0).toLocaleString('en-IN')}` },
  { icon: "📊", title: "Profit Margin", value: `${(stats.profitMargin || 0).toFixed(2)}%` },
  { icon: "💹", title: "Revenue Growth", value: `${(stats.revenueGrowth || 0).toFixed(1)}%` },
  { icon: "📊", title: "Total Quantity", value: `${(stats.totalQuantity || 0).toLocaleString('en-IN')}` },
  { icon: "⭐", title: "Average Rating", value: `${(stats.avgRating || 0).toFixed(1)}/5` },
  { icon: "🛒", title: "Average Order Value", value: `₹ ${(stats.avgOrderValue || 0).toLocaleString('en-IN')}` },
  { icon: "🏬", title: "Top Category", value: stats.topCategory || "N/A" },
  { icon: "💸", title: "Avg Discount Given", value: `₹ ${(stats.avgDiscount || 0).toLocaleString('en-IN')}` },
  { icon: "🔥", title: "Top Selling Product", value: stats.highestSellingProduct?.productName || "N/A" },
  { icon: "📦", title: "Total Orders", value: `${(stats.totalOrders || 0).toLocaleString('en-IN')}` },
  { icon: "🏆", title: "Top Profit Product", value: stats.highestProfitProduct?.productName || "N/A" },
];


  return (
    <div className="dashboard-page">
      <div className="page-heading-container">
        <h1>Welcome! Here's your Sales Summary</h1>
        <p>{formattedDateTime}</p>
      </div>

      <section className="stats-grid">
        {loadingStats ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <Loading size={50} />
          </div>
        ) : (
          statItems.map((item, index) => (
            <StatCard key={index} icon={item.icon} title={item.title} value={item.value.charAt(0).toUpperCase() + item.value.slice(1)} />
          ))
        )}
      </section>

      <section className="products-table">
        <div className="products-header">
          <h4>Top 5 Sales based on Profits</h4>
        </div>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Product Category</th>
              <th>Product Price (₹)</th>
              <th>Quantity</th>
              <th>Selling Price (₹)</th>
              <th>Ratings</th>
              <th>Selling Date</th>
              <th>Total Profits (₹)</th>
            </tr>
          </thead>
          <tbody>
            {loadingProducts ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  <Loading size={30} />
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>{p.productName.charAt(0).toUpperCase() + p.productName.slice(1)}</td>
                  <td>{p.productCategory}</td>
                  <td>{p.productPrice.toLocaleString('en-IN')} ₹</td>
                  <td>{p.quantity}</td>
                  <td>{p.sellingPrice.toLocaleString('en-IN')} ₹</td>
                  <td>{p.ratings}</td>
                  <td>{p.soldDate}</td>
                  <td>{p.profit.toLocaleString('en-IN')} ₹</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Dashboard;
