import React from "react";
import { Link, Outlet } from "react-router-dom";
import './dashboard.css'; 

const SidebarLayout = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h6 className="logo">DashBoardManager</h6>
        <nav>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/dashboard/addproduct">Add Product</Link></li>
            <li><Link to="/dashboard/statistics">Statistic</Link></li>
            <li><Link to="/dashboard/products">Product</Link></li>
            <li><Link to="/dashboard/customers">Customer</Link></li>
            <li><Link to="/dashboard/settings">Settings</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Main content changes depending on route */}
      <main className="main-content">
        <Outlet /> {/* This is where page content will render */}
      </main>
    </div>
  );
};

export default SidebarLayout;