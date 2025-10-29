import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../api';
import './Dashboard.css';
import StatCard from "../../components/StatCard.jsx";
import Loading from "../../components/Loading";
import { useAuth } from '../../contexts/AuthContext';
import { abbreviateNumber, formatCurrency } from '../../utils/numberUtils';

const Dashboard = () => {
  const { userPlan } = useAuth();
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
  const PLAN_LEVELS = {free: 1, basic: 2, premium: 3};
  const navigate = useNavigate();

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
        api.get("/total_sales"),
        api.get("/total_profit"),
        api.get("/avg_rating"),
        api.get("/total_orders"),
        api.get("/total_quantity"),
        api.get("/highest_selling_product"),
        api.get("/highest_profit_product"),
        api.get("/avg_discount"),
        api.get("/revenue_growth"),
        api.get("/profit_margin"),
        api.get("/avg_order_value"),
        api.get("/top_category"),
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
      const productsResponse = await api.get("/top_profit_products", { params: { limit: 5 } });
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
  }, [fetchStats, fetchTopProducts, userPlan]);

  const formattedDateTime = currentDateTime.toLocaleDateString('en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + currentDateTime.toLocaleTimeString();

  const statItems = [
  { icon: "💰", title: "Total Sales", value: `₹ ${abbreviateNumber(stats.totalSales || 0)}`, fullValue: formatCurrency(stats.totalSales || 0), minPlan: 'free'},
  { icon: "📈", title: "Total Profit", value: `₹ ${abbreviateNumber(stats.totalProfit || 0)}`, fullValue: formatCurrency(stats.totalProfit || 0), minPlan: 'free' },
  { icon: "📦", title: "Total Orders", value: `${(stats.totalOrders || 0).toLocaleString('en-IN')}`, minPlan: 'free' },
  { icon: "📊", title: "Total Quantity", value: `${(stats.totalQuantity || 0).toLocaleString('en-IN')}`, minPlan: 'free' },
  { icon: "⭐", title: "Average Rating", value: `${(stats.avgRating || 0).toFixed(1)}/5`, minPlan: 'basic' },
  { icon: "🛒", title: "Average Order Value", value: `₹ ${abbreviateNumber(stats.avgOrderValue || 0)}`, fullValue: formatCurrency(stats.avgOrderValue || 0), minPlan: 'basic' },
  { icon: "🏬", title: "Top Category", value: stats.topCategory || "N/A", minPlan: 'basic' },
  { icon: "💸", title: "Avg Discount Given", value: `₹ ${abbreviateNumber(stats.avgDiscount || 0)}`, fullValue: formatCurrency(stats.avgDiscount || 0), minPlan: 'basic' },
  { icon: "🔥", title: "Top Selling Product", value: stats.highestSellingProduct?.productName || "N/A", minPlan: 'premium' },
  { icon: "🏆", title: "Top Profit Product", value: stats.highestProfitProduct?.productName || "N/A", minPlan: 'premium' },
  { icon: "📊", title: "Profit Margin", value: `${(stats.profitMargin || 0).toFixed(2)}%`, minPlan: 'premium' },
  { icon: "💹", title: "Revenue Growth", value: `${(stats.revenueGrowth || 0).toFixed(1)}%`, minPlan: 'premium' }
];


  return (
    <div className="dashboard-page">
      <div className="page-heading-container">
        <h1>Welcome! Here's your Sales Summary</h1>
        <p>{formattedDateTime}</p>
      </div>

      <section className="stats-grid">
        {loadingStats ? (
          <div className="loading-center">
            <Loading size={50} />
          </div>
        ) : (
          statItems.map((item, index) => {
            const hasAccess = PLAN_LEVELS[userPlan] >= PLAN_LEVELS[item.minPlan];
            return (
              <div key={index} className={`card-wrapper ${!hasAccess ? 'dashboard-locked' : ''}`}>
                <StatCard icon={item.icon} title={item.title} value={item.value} fullValue={item.fullValue} />
                {!hasAccess && (
                  <div className="lock-overlay">
                    <p>{item.title}</p>
                    <span className="lock-icon">🔒</span>
                    <p>Upgrade to {item.minPlan.charAt(0).toUpperCase() + item.minPlan.slice(1)}</p>
                    <button className="upgrade-btn" onClick={() => navigate("/dashboard/plans")}>
                      Upgrade Now
                    </button>
                  </div>
                )}
              </div>
            );
          })
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
                  <td>₹ {p.productPrice.toLocaleString('en-IN')}</td>
                  <td>{p.quantity}</td>
                  <td>₹ {p.sellingPrice.toLocaleString('en-IN')}</td>
                  <td>{p.ratings}</td>
                  <td>{p.soldDate}</td>
                  <td>₹ {p.profit.toLocaleString('en-IN')}</td>
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
