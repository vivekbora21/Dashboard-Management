import React, { useState } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import './VerifyOTP.css'; 

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('OTP is required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/verify-otp/', { email, otp });
      toast.success('OTP verified');
      navigate('/reset-password', { state: { reset_token: response.data.reset_token } });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-otp-container">
      <h1>Verify OTP</h1>
      <p>Enter the OTP sent to {email}</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="otp">OTP</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
      <p>
        <button onClick={() => navigate('/forgot-password')} className="link-button">
          Back
        </button>
      </p>
    </div>
  );
};

export default VerifyOTP;
