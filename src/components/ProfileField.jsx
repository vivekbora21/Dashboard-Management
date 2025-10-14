import React from 'react';

const ProfileField = ({label, name, value, type = 'text', disabled = false, onChange, onBlur, error, required = false, className = '', maxLength}) => {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name}>{label}{required && <span>*</span>}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={error ? 'error' : ''}
        maxLength={maxLength}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default ProfileField;
