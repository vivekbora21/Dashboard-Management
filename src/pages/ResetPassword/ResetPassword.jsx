import React, { useState } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResetPassword.css'; // Assuming you have a CSS file

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = location.state?.reset_token || '';

  const validatePassword = (password) => {
    if (!password) return 'New password is required';
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return '';
  };

  const validateConfirmPassword = (confirm) => {
    if (!confirm) return 'Confirm password is required';
    if (confirm !== newPassword) return 'Passwords do not match';
    return '';
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    const error = validatePassword(value);
    setErrors({ ...errors, newPassword: error });
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    const error = validateConfirmPassword(value);
    setErrors({ ...errors, confirmPassword: error });
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reset-password/', { reset_token: resetToken, new_password: newPassword });
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={handleNewPasswordChange}
            onBlur={() => handleBlur('newPassword')}
            className={errors.newPassword ? 'reset-error' : ''}
            required
          />
          {errors.newPassword && touched.newPassword && <span className="reset-error-message">{errors.newPassword}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            onBlur={() => handleBlur('confirmPassword')}
            className={errors.confirmPassword ? 'reset-error' : ''}
            required
          />
          {errors.confirmPassword && touched.confirmPassword && <span className="reset-error-message">{errors.confirmPassword}</span>}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      <p>
        <button onClick={() => navigate('/login')} className="link-button">
          Back to Login
        </button>
      </p>
    </div>
  );
};

export default ResetPassword;
