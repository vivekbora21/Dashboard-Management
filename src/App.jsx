import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Signup from './components/Signup/SignupForm';
import Login from './components/Login/LoginForm';
import Dashboard from './components/Dashboard/dashboard.jsx';
import AddProduct from './components/AddProduct/AddProduct.jsx';
import SidebarLayout from './components/SideBar/SidebarLayout.jsx';
import Products from './components/ProductList/Products.jsx';
import Customers from './components/Profile/Customers.jsx';
import Statistics from './components/Statistics/Statistics.jsx';
import NotFound from './components/Invalid/NotFound.jsx';
import './components/AppStyle.css'

function App() {
  return (
    <Router>
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
      <ToastContainer />
    </Router>
  );
}

export default App;