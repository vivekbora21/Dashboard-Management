import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from '../../api';
import './SidebarLayout.css';

const SidebarLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/logout/');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h6 className="logo">DashBoardManager</h6>
        <nav>
          <ul>
            <li className={location.pathname === "/dashboard" ? "active" : ""}><Link to="/dashboard">Dashboard</Link></li>
            <li className={location.pathname === "/dashboard/addproduct" ? "active" : ""}><Link to="/dashboard/addproduct">Add Product</Link></li>
            <li className={location.pathname === "/dashboard/statistics" ? "active" : ""}><Link to="/dashboard/statistics">Statistic</Link></li>
            <li className={location.pathname === "/dashboard/products" ? "active" : ""}><Link to="/dashboard/products">Product</Link></li>
            <li className={location.pathname === "/dashboard/customers" ? "active" : ""}><Link to="/dashboard/customers">Customer</Link></li>
          </ul>
        </nav>
        <div className="logout-section">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;