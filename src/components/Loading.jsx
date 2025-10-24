import React from 'react';
import { ClipLoader } from 'react-spinners';

const Loading = ({ size = 50, color = "#3498db", overlay = false }) => {
  if (overlay) {
    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(5px)',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ClipLoader size={size} color={color} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <ClipLoader size={size} color={color} />
    </div>
  );
};

export default Loading;
