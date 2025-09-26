import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import './dashboard.css';

const SidebarLayout = () => {
  const location = useLocation();

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h6 className="logo">DashBoardManager</h6>
        <nav>
          <ul>
            <li className={location.pathname === "/dashboard" ? "active" : ""}><Link to="/dashboard">Dashboard</Link></li>
            <li className={location.pathname === "/dashboard/addproduct" ? "active" : ""}><Link to="/dashboard/addproduct">Add Product</Link></li>
            <li className={location.pathname === "/dashboard/statistics" ? "active" : ""}><Link to="/dashboard/statistics">Statistic</Link></li>
            <li className={location.pathname === "/dashboard/products" ? "active" : ""}><Link to="/dashboard/products">Product</Link></li>
            <li className={location.pathname === "/dashboard/customers" ? "active" : ""}><Link to="/dashboard/customers">Customer</Link></li>
            <li className={location.pathname === "/dashboard/settings" ? "active" : ""}><Link to="/dashboard/settings">Settings</Link></li>
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