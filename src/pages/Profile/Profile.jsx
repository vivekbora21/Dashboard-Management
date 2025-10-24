
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api';
import './Profile.css';
import { FaUserEdit, FaEdit, FaTimes } from 'react-icons/fa';
import ProfileField from '../../components/ProfileField';
import Loading from '../../components/Loading';

const Profile = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [originalUser, setOriginalUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const profileFields = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: false, disabled: true },
    { name: 'phone', label: 'Phone', type: 'text', required: true, maxLength: 10 }
  ];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      const userData = {
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        phone: response.data.phone
      };
      setUser(userData);
      setOriginalUser(userData);
    } catch {
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

      case "phone":
        if (!value) error = "Phone number is required";
        else if (value.length !== 10)
          error = "Phone number must be exactly 10 digits";
        else if (!/^[0-9]+$/.test(value))
          error = "Phone number can only contain numbers";
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      if (!/^[0-9]*$/.test(value)) return;
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
      setOriginalUser(user);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setUser(originalUser);
    setErrors({});
    setTouched({});
    setIsEditing(false);
  };

  if (loading) {
    return <Loading overlay />;
  }

  return (
    <div className='customers-content'>
      <div className="page-heading-container">
        <h1> <FaUserEdit/> User Profile</h1>
      </div>
      {!isEditing ? (
        <div className='profile-view'>
          {profileFields.map(field => (
            <div key={field.name} className='profile-field'>
              <label>{field.label}:</label>
              <span>{user[field.name]}</span>
            </div>
          ))}
          <button onClick={handleEdit} className='edit-btn'>
            <FaEdit /> Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className='profile-form'>
          {profileFields.map(field => (
            <ProfileField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type}
              value={user[field.name]}
              onChange={field.disabled ? undefined : handleChange}
              onBlur={field.disabled ? undefined : handleBlur}
              error={errors[field.name]}
              required={field.required}
              disabled={field.disabled}
              maxLength={field.maxLength}
            />
          ))}
          <div className='button-group'>
            <button type='submit' disabled={saving || Object.values(errors).some(error => error)} className='save-btn'>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type='button' onClick={handleCancel} className='cancel-btn'>
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;
