import React, { useEffect, useState } from "react";
import api from '../api';
import './dashboard.css'

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    avgRating: 0,
    totalOrders: 0
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

        setStats({ totalSales, totalProfit, avgRating, totalOrders });

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

    <div className="content">
      <div className="welcome">
        <h3>Welcome! Here's your dashboard summary.</h3>
        <p>{formattedDateTime}</p>
      </div>

      <section className="stats">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <h4>Total Sales</h4>
          <p className="stat-value">₹{stats.totalSales.toLocaleString('en-IN')}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <h4>Total Profit</h4>
          <p className="stat-value">₹{stats.totalProfit.toLocaleString('en-IN')}</p>
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
      </section>

      {/* Products Table */}
      <section className="products">
        <div className="products-header">
          <h4>Top 5 Products based on profits</h4>
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
