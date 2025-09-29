import React, { useState } from 'react'
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './LoginForm.css';

const Login = ({ onSwitchToSignup }) => {
  const [formData, setFormData] = useState({email: '',password: ''})
  const navigate = useNavigate();
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validateField = (name, value) => {
    let error = ''
    
    switch (name) {
      case 'email':
        if (!value) error = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address'
        break
        
      case 'password':
        if (!value) error = 'Password is required'
        break
        
      default:
        break
    }
    
    return error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({...formData,[name]: value})

    if (touched[name]) {
      const error = validateField(name, value)
      setErrors({...errors,[name]: error})
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    
    setTouched({...touched,[name]: true})
    
    const error = validateField(name, value)
    setErrors({...errors,[name]: error})
  }

  const validateForm = () => {
    const newErrors = {}
    const newTouched = {}
    
    Object.keys(formData).forEach(key => {
      newTouched[key] = true
      newErrors[key] = validateField(key, formData[key])
    })
    
    setTouched(newTouched)
    setErrors(newErrors)
    
    return !Object.values(newErrors).some(error => error)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await api.post("/login/", formData);

        console.log("Login response:", response.data);
        toast.success("Login successful!");

        setFormData({ email: "", password: "" });
        setErrors({});
        setTouched({});

        navigate("/dashboard");

      } catch (error) {
        console.error(error.response?.data);
        toast.error(error.response?.data?.detail || "Login failed");
      }
    }
  };

  return (
    <div className="login-auth-container">
      <h1>Login</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="login-form-group">
          <label htmlFor="email">Email <span>*</span></label>
          <input type="email" id="email" name="email" value={formData.email}
            onChange={handleChange} onBlur={handleBlur} className={errors.email ? 'login-error' : ''}
            required
          />
          {errors.email && <span className="login-error-message">{errors.email}</span>}
        </div>

        <div className="login-form-group">
          <label htmlFor="password">Password <span>*</span></label>
          <input type="password" id="password" name="password" value={formData.password}
            onChange={handleChange} onBlur={handleBlur} className={errors.password ? 'login-error' : ''}
            required
          />
          {errors.password && <span className="login-error-message">{errors.password}</span>}
        </div>
        <div style={{ paddingBottom: '20px', fontSize: '14px' }}>
          <a className="login-link" href="#">Forgot Password</a>
        </div>


        <button type="submit" className="login-login-btn">Login</button>
      </form>

      <div className="login-switch-auth">
        <p>Don't have an account? <span className="login-link" onClick={() => navigate("/signup")}>Sign Up</span></p>
      </div>
    </div>
  )
}

export default Login