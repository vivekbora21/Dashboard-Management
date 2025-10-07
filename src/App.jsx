import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './components/AppStyle.css';

// Lazy load components
const Signup = lazy(() => import('./components/Signup/SignupForm'));
const Login = lazy(() => import('./components/Login/LoginForm'));
const Dashboard = lazy(() => import('./components/Dashboard/dashboard.jsx'));
const AddProduct = lazy(() => import('./components/AddProduct/AddProduct.jsx'));
const SidebarLayout = lazy(() => import('./components/SideBar/SidebarLayout.jsx'));
const Products = lazy(() => import('./components/ProductList/Products.jsx'));
const Customers = lazy(() => import('./components/Profile/Customers.jsx'));
const Statistics = lazy(() => import('./components/Statistics/Statistics.jsx'));
const NotFound = lazy(() => import('./components/Invalid/NotFound.jsx'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/dashboard" element={<SidebarLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="addproduct" element={<AddProduct />} />
            <Route path="products" element={<Products />} />
            <Route path="customers" element={<Customers />} />
            <Route path="statistics" element={<Statistics />} />
          </Route>
        </Routes>
      </Suspense>
      <ToastContainer />
    </Router>
  );
}

export default App;