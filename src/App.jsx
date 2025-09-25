import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Signup from './components/SignupForm';
import Login from './components/LoginForm';
import Dashboard from './components/dashboard.jsx';
import AddProduct from './components/AddProduct.jsx';
import SidebarLayout from './components/SidebarLayout.jsx';
import './components/AppStyle.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<SidebarLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="addproduct" element={<AddProduct />} />
        </Route>
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
