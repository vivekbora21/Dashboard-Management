import React, { useState, useRef } from "react";
import axios from "axios";
import api from "../../api";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './SignupForm.css';

const Signup = ({ onSwitchToLogin }) => {
  const inputRef = useRef(null)
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "firstName":
        if (!value.trim()) error = "First name is required";
        else if (value.length < 3)
          error = "First name must be at least 3 characters";
        else if (value.length > 20)
          error = "First name must be at max 20 characters";
        else if (!/^[a-zA-Z]+$/.test(value))
          error = "First name can only contain letters";
        break;

      case "lastName":
        if (!value.trim()) error = "Last name is required";
        else if (value.length < 3)
          error = "Last name must be at least 3 characters";
        else if (value.length > 20)
          error = "Last name must be at max 20 characters";
        else if (!/^[a-zA-Z]+$/.test(value))
          error = "Last name can only contain letters";
        break;

      case "email":
        if (!value) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Please enter a valid email address";
        break;

      case "phone":
        if (!value) error = "Phone number is required";
        else if (!/^\+?[\d\s-()]{10,}$/.test(value))
          error = "Please enter a valid phone number";
        break;

      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8)
          error = "Password must be at least 8 characters";
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value))
          error =
            "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        break;

      case "confirmPassword":
        if (!value) error = "Please confirm your password";
        else if (value !== formData.password) error = "Passwords do not match";
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;
    if (name === 'phone') {
      filteredValue = value.replace(/[^\d\s\-()\+]/g, '');
    }
    setFormData({...formData, [name]: filteredValue});

    const error = validateField(name, filteredValue);
    setErrors({...errors, [name]: error});

    if (name === 'password' && touched.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({...prev, confirmPassword: confirmError}));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched({...touched, [name]: true});
    const error = validateField(name, value);
    setErrors({...errors, [name]: error});
  };

  const validateForm = () => {
    const newErrors = {};
    const newTouched = {};

    Object.keys(formData).forEach((key) => {
      newTouched[key] = true;
      newErrors[key] = validateField(key, formData[key]);
    });

    setTouched(newTouched);
    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
      const payload = { ...formData };
      const response = await api.post("/signup/", payload);
      console.log(response.data);
      toast.success("Account created successfully!");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});
      setTouched({});
      navigate('/login');
      } catch (error) {
        console.log(error.response?.data);
        console.error("Error during signup:", error.response?.data?.detail || error.message);
        toast.error("Error during signup: " + (error.response?.data?.detail || error.message));
      }
    }
  };

  return (
    <div className="signup-auth-container">
      <h1>Create an Account</h1>

      <form onSubmit={handleSubmit} noValidate ref={inputRef}>
        <div className="signup-form-row">
          <div className="signup-form-group">
            <label htmlFor="firstName">First Name<span>*</span></label>
            <input type="text" id="firstName" name="firstName" value={formData.firstName}
              onChange={handleChange} onBlur={handleBlur} className={errors.firstName ? "signup-error" : ""}
              required
            />
            {errors.firstName && (<span className="signup-error-message">{errors.firstName}</span>)}
          </div>
          <div className="signup-form-group">
            <label htmlFor="lastName">Last Name<span>*</span></label>
            <input type="text" id="lastName" name="lastName" value={formData.lastName}
              onChange={handleChange} onBlur={handleBlur} className={errors.lastName ? "signup-error" : ""}
              required
            />
            {errors.lastName && (<span className="signup-error-message">{errors.lastName}</span>)}
          </div>
        </div>

        <div className="signup-form-row">
          <div className="signup-form-group">
            <label htmlFor="email">Email<span>*</span></label>
            <input type="email" id="email" name="email" value={formData.email}
              onChange={handleChange} onBlur={handleBlur} className={errors.email ? "signup-error" : ""}
              required
            />
            {errors.email && (<span className="signup-error-message">{errors.email}</span>)}
          </div>
          <div className="signup-form-group">
            <label htmlFor="phone">Phone Number<span>*</span></label>
            <input type="tel" id="phone" name="phone" value={formData.phone} maxLength={10}
              onChange={handleChange} onBlur={handleBlur} className={errors.phone ? "signup-error" : ""}
              required
            />
            {errors.phone && (<span className="signup-error-message">{errors.phone}</span>)}
          </div>
        </div>

        <div className="signup-form-row">
          <div className="signup-form-group">
            <label htmlFor="password">Password<span>*</span></label>
            <input type="password" id="password" name="password" value={formData.password}
              onChange={handleChange} onBlur={handleBlur} className={errors.password ? "signup-error" : ""}
              required
            />
            {errors.password && (<span className="signup-error-message">{errors.password}</span>)}
          </div>
          <div className="signup-form-group">
            <label htmlFor="confirmPassword">Confirm Password<span>*</span></label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword}
              onChange={handleChange} onBlur={handleBlur} className={errors.confirmPassword ? "signup-error" : ""}
              required
            />
            {errors.confirmPassword && (<span className="signup-error-message">{errors.confirmPassword}</span>)}
          </div>
        </div>

        <button type="submit" className="signup-signup-btn" disabled={Object.values(errors).some(error => error)}>Sign Up</button>
      </form>

      <div className="signup-switch-auth">
        <p>Already have an account?{" "}<span className="signup-link" onClick={() => navigate("/Login")}>Login</span></p>
      </div>
    </div>
  );
};

export default Signup;
