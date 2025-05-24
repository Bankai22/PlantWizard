
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center my-10">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      <p className="mt-4 text-lg font-medium text-primary-dark font-sans">Loading plant wisdom...</p>
    </div>
  );
};

export default LoadingSpinner;
