import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './components/AppStyle.css';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

const Signup = lazy(() => import('./pages/Signup/Signup'));
const Login = lazy(() => import('./pages/Login/Login'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword/ForgotPassword'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP/VerifyOTP'));
const ResetPassword = lazy(() => import('./pages/ResetPassword/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const AddProduct = lazy(() => import('./pages/AddProduct/AddProduct'));
const SidebarLayout = lazy(() => import('./layouts/SidebarLayout/SidebarLayout'));
const Products = lazy(() => import('./pages/Products/Products'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Statistics = lazy(() => import('./pages/Statistics/Statistics'));
const Plans = lazy(() => import('./pages/Plans/Plans'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><VerifyOTP /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="*" element={<NotFound />} />
          <Route path="/dashboard" element={<ProtectedRoute><SidebarLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="addproduct" element={<AddProduct />} />
            <Route path="products" element={<Products />} />
            <Route path="profile" element={<Profile />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="plans" element={<Plans />} />
          </Route>
        </Routes>
      </Suspense>
      <ToastContainer />
    </Router>
  );
}

export default App;