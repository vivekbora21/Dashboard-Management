import React, { useEffect, useState } from "react";
import api from '../api';
import './dashboard.css';

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

  useEffect(() => {
    api.get("/products/")
      .then(response => {
        const allProducts = response.data.map(p => {
          const discount = parseFloat(p.discounts) || 0;
          const profit = (p.quantity * p.sellingPrice) - (p.quantity * p.productPrice) - (p.quantity * discount);
          return { ...p, profit };
        });

        const totalSales = allProducts.reduce((sum, p) => sum + (p.sellingPrice * p.quantity), 0);
        const totalProfit = allProducts.reduce((sum, p) => sum + p.profit, 0);
        const totalRatings = allProducts.reduce((sum, p) => sum + (p.ratings || 0), 0);
        const avgRating = allProducts.length > 0 ? totalRatings / allProducts.length : 0;
        const totalOrders = allProducts.length;
        const totalQuantity = allProducts.reduce((sum, p) => sum + p.quantity, 0);
        const highestSellingProduct = allProducts.reduce((prev, curr) => 
          (curr.sellingPrice * curr.quantity) > (prev.sellingPrice * prev.quantity) ? curr : prev, allProducts[0]
        );
        const highestProfitProduct = allProducts.reduce((prev, curr) => curr.profit > prev.profit ? curr : prev, allProducts[0]);
        const avgDiscount = allProducts.reduce((sum, p) => sum + (parseFloat(p.discounts) || 0), 0) / allProducts.length;

        setStats({
          totalSales,
          totalProfit,
          avgRating,
          totalOrders,
          totalQuantity,
          highestSellingProduct,
          highestProfitProduct,
          avgDiscount
        });

        const topProducts = allProducts
          .sort((a, b) => b.profit - a.profit)
          .slice(0, 5);
        setProducts(topProducts);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
      });

    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedDateTime = currentDateTime.toLocaleDateString('en-US', 
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + currentDateTime.toLocaleTimeString();

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Welcome! Here's your dashboard summary</h1>
        <p>{formattedDateTime}</p>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <h4>Total Sales</h4>
          <p className="stat-value">₹ {stats.totalSales.toLocaleString('en-IN')}</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <h4>Total Profit</h4>
          <p className="stat-value">₹ {stats.totalProfit.toLocaleString('en-IN')}</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <h4>Total Orders</h4>
          <p className="stat-value">{stats.totalOrders.toLocaleString('en-IN')}</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <h4>Average Rating</h4>
          <p className="stat-value">{stats.avgRating.toFixed(1)}/5</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <h4>Total Quantity Sold</h4>
          <p className="stat-value">{stats.totalQuantity.toLocaleString('en-IN')}</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <h4>Top Profit Product</h4>
          <p className="stat-value">{stats.highestProfitProduct?.productName}</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <h4>Top Selling Product</h4>
          <p className="stat-value">{stats.highestSellingProduct?.productName}</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <h4>Avg Discount Given</h4>
          <p className="stat-value">₹ {stats.avgDiscount.toLocaleString('en-IN')}</p>
        </div>
      </section>

      {/* Top Products Table */}
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
                <td>{p.productName}</td>
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
