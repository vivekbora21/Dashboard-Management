import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import './SidebarLayout.css';
import Loading from '../../components/Loading';
import { BiLogOut } from 'react-icons/bi';
import { Menu, X, LayoutDashboard, Plus, BarChart3, Package, User, CreditCard } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

const SidebarLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, loggingOut, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login');
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/dashboard/addproduct", label: "Add Product", icon: Plus },
    { path: "/dashboard/statistics", label: "Statistic", icon: BarChart3 },
    { path: "/dashboard/products", label: "Product", icon: Package },
    { path: "/dashboard/profile", label: "Profile", icon: User },
    { path: "/dashboard/plans", label: "Plans", icon: CreditCard },
  ];

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h6 className="logo" onClick={()=> navigate('/dashboard')}>{!isCollapsed ? 'SalesManager' : "SM"}</h6>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
        <nav>
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className={location.pathname === item.path ? "active" : ""}>
                  <Link to={item.path}>
                    <Icon size={20} />
                    {!isCollapsed && <span class="sidebar_name">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="login-dtl">
          {!isCollapsed && (
            <>
              <div className="user-name">User: {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}</div>
            </>
          )}
        </div>
        <div className="logout-section">
          <button onClick={handleLogoutClick} className="logout-btn" disabled={loggingOut}>
            {loggingOut ? <Loading size={20} /> : (isCollapsed ? <BiLogOut/> : 'Logout')}
          </button>
        </div>
      </aside>

      <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <Outlet />
      </main>
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        message="Are you sure you want to log out?"
        confirmText="Logout"
        cancelText="Cancel"
      />
    </div>
  );
};

export default SidebarLayout;
