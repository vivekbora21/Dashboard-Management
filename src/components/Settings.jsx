import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.info("Settings page is in development mode, Please visit after some time");
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000); 
  }, [navigate]);

  return (
    <div>
      <p>
        <p></p>
        <h1>Coming soon...</h1>
      </p>
    </div>
  );
};

export default Settings;

