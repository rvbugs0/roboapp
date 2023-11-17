import React from 'react';
import './FullScreenLoader.css'; // Create this CSS file for styling

function FullScreenLoader({ isLoading }) {
  return (
    isLoading && (
      <div className="full-screen-loader">
        <div className="loader"></div>
      </div>
    )
  );
}

export default FullScreenLoader;
