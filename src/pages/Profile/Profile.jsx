import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api';
import './Profile.css';
import { FaUserEdit } from 'react-icons/fa';

const Profile = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setUser({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        phone: response.data.phone
      });
    } catch (error) {
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "firstName":
        if (!value.trim()) error = "First name is required";
        break;

      case "lastName":
        if (!value.trim()) error = "Last name is required";
        break;

      case "phone":
        if (!value.trim()) error = "Phone number is required";
        else if (!/^[0-9\s\-\(\)\+]+$/.test(value)) error = "Phone number can only contain digits, spaces, -, (, ), +";
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      if (!/^[0-9\s\-\(\)\+]*$/.test(value)) return;
    }

    setUser(prev => ({
      ...prev,
      [name]: value
    }));

    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/user/profile', user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='customers-content'>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className='customers-content'>
      <h1> <FaUserEdit/> User Profile</h1>
      <form onSubmit={handleSubmit} className='profile-form'>
        <div className='form-group'>
          <label htmlFor='firstName'>First Name</label>
          <input
            type='text'
            id='firstName'
            name='firstName'
            value={user.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={errors.firstName ? 'error' : ''}
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>
        <div className='form-group'>
          <label htmlFor='lastName'>Last Name</label>
          <input
            type='text'
            id='lastName'
            name='lastName'
            value={user.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={errors.lastName ? 'error' : ''}
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
        </div>
        <div className='form-group'>
          <label htmlFor='email'>Email</label>
          <input
            type='email'
            id='email'
            name='email'
            value={user.email}
            disabled
          />
        </div>
        <div className='form-group'>
          <label htmlFor='phone'>Phone</label>
          <input
            type='text'
            id='phone'
            name='phone'
            value={user.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>
        <button type='submit' disabled={saving || Object.values(errors).some(error => error)} className='save-btn'>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
