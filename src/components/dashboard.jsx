import React, { useEffect, useState } from "react";
import axios from "axios";
import './dashboard.css'

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    // Fetch products from backend API
    axios.get("http://localhost:8000/products/")
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
      });

    // Update current date and time every second
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format the current date and time
  const formattedDateTime = currentDateTime.toLocaleDateString('en-US', 
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + currentDateTime.toLocaleTimeString();

  return (

    <div className="content">
      <header className="header">
        <h2>Dashboard Overview</h2>
        <div className="header-icons">
          <span>🔍</span>
          <span>🔔</span>
          <span>👤</span>
        </div>
      </header>

      {/* Welcome Message */}
      <div className="welcome">
        <h3>Welcome back! Here's your dashboard summary.</h3>
        <p>{formattedDateTime}</p>
      </div>

      {/* Stats Panel */}
      <section className="stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h4>Total Visitors</h4>
          <p className="stat-value">2,344</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <h4>Total Sales</h4>
          <p className="stat-value">$12,456.90</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <h4>Total Orders</h4>
          <p className="stat-value">156</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <h4>Customer Satisfaction</h4>
          <p className="stat-value">4.8/5</p>
        </div>
      </section>

      {/* Products Table */}
      <section className="products">
        <div className="products-header">
          <h4>Product</h4>
        </div>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Product Category</th>
              <th>Product Price</th>
              <th>Quantity</th>
              <th>Selling Price</th>
              <th>Discounts</th>
              <th>Ratings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.productName}</td>
                <td>{p.productCategory}</td>
                <td>{p.productPrice}</td>
                <td>{p.quantity}</td>
                <td>{p.sellingPrice}</td>
                <td>{p.discounts}</td>
                <td>{p.ratings}</td>
                <td>
                  <button className="action-btn edit">Edit</button>
                  <button className="action-btn delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Dashboard;
