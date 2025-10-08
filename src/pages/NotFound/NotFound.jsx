import React from 'react';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/dashboard">Go back to Home</a>
    </div>
  );
};

export default NotFound;
