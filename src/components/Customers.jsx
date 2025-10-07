import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Customers.css';

const Customers = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.info("Customers page is in development mode, Please visit after some time");
    setTimeout(() => {
      navigate("/dashboard");
    }, 3000); 
  }, [navigate]);

  return (
    <div className='customers-content'>
      <p>
        <p></p>
        <h1>Coming soon...</h1>
      </p>
    </div>
  );
};

export default Customers;

