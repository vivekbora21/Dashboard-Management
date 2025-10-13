import React from 'react';
import { ClipLoader } from 'react-spinners';

const Loading = ({ size = 50, color = "#3498db" }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <ClipLoader size={size} color={color} />
    </div>
  );
};

export default Loading;
