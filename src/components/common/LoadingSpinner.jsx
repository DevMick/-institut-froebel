import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-600 border-opacity-30"></div>
  </div>
);

export default LoadingSpinner; 