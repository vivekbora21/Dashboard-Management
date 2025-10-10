import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import './SidebarLayout.css';

const SidebarLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h6 className="logo">ProductManager</h6>
        <nav>
          <ul>
            <li className={location.pathname === "/dashboard" ? "active" : ""}><Link to="/dashboard">Dashboard</Link></li>
            <li className={location.pathname === "/dashboard/addproduct" ? "active" : ""}><Link to="/dashboard/addproduct">Add Product</Link></li>
            <li className={location.pathname === "/dashboard/statistics" ? "active" : ""}><Link to="/dashboard/statistics">Statistic</Link></li>
            <li className={location.pathname === "/dashboard/products" ? "active" : ""}><Link to="/dashboard/products">Product</Link></li>
            <li className={location.pathname === "/dashboard/profile" ? "active" : ""}><Link to="/dashboard/profile">Profile</Link></li>
            <li className={location.pathname === "/dashboard/plans" ? "active" : ""}><Link to="/dashboard/plans">Plans</Link></li>
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
