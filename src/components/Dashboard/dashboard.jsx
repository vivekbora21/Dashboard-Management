import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from '../../api';
import './dashboard.css';
import StatCard from "../StatCard.jsx";

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
    avgDiscount: 0
  });
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const fetchStats = useCallback(async () => {
    try {
      const [
        totalSalesRes,
        totalProfitRes,
        avgRatingRes,
        totalOrdersRes,
        totalQuantityRes,
        highestSellingRes,
        highestProfitRes,
        avgDiscountRes
      ] = await Promise.all([
        api.get("/kpi/total_sales"),
        api.get("/kpi/total_profit"),
        api.get("/kpi/avg_rating"),
        api.get("/kpi/total_orders"),
        api.get("/kpi/total_quantity"),
        api.get("/kpi/highest_selling_product"),
        api.get("/kpi/highest_profit_product"),
        api.get("/kpi/avg_discount")
      ]);

      setStats({
        totalSales: totalSalesRes.data.value,
        totalProfit: totalProfitRes.data.value,
        avgRating: avgRatingRes.data.value,
        totalOrders: totalOrdersRes.data.value,
        totalQuantity: totalQuantityRes.data.value,
        highestSellingProduct: highestSellingRes.data,
        highestProfitProduct: highestProfitRes.data,
        avgDiscount: avgDiscountRes.data.value
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  const fetchTopProducts = useCallback(async () => {
    try {
      const productsResponse = await api.get("/kpi/top_profit_products", { params: { limit: 5 } });
      setProducts(productsResponse.data);
    } catch (error) {
      console.error("Error fetching products:", error);
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
    { icon: "💰", title: "Total Sales", value: `₹ ${stats.totalSales.toLocaleString('en-IN')}` },
    { icon: "📈", title: "Total Profit", value: `₹ ${stats.totalProfit.toLocaleString('en-IN')}` },
    { icon: "📦", title: "Total Orders", value: stats.totalOrders.toLocaleString('en-IN') },
    { icon: "⭐", title: "Average Rating", value: `${stats.avgRating.toFixed(1)}/5` },
    { icon: "🛒", title: "Total Quantity Sold", value: stats.totalQuantity.toLocaleString('en-IN') },
    { icon: "🏆", title: "Top Profit Product", value: stats.highestProfitProduct?.productName || "N/A" },
    { icon: "🔥", title: "Top Selling Product", value: stats.highestSellingProduct?.productName || "N/A" },
    { icon: "💸", title: "Avg Discount Given", value: `₹ ${stats.avgDiscount.toLocaleString('en-IN')}` },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Welcome! Here's your Dashboard summary</h1>
        <p>{formattedDateTime}</p>
      </div>

      <section className="stats-grid">
        {statItems.map((item, index) => (
          <StatCard key={index} icon={item.icon} title={item.title} value={item.value.charAt(0).toUpperCase() + item.value.slice(1)} />
        ))}
      </section>

      <section className="products-table">
        <div className="products-header">
          <h4>Top 5 Products based on Profits</h4>
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
            {products.map((p) => (
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
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Dashboard;
