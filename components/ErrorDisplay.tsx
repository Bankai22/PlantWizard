
import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md my-6" role="alert">
      <p className="font-bold font-sans">Oops! Something went wrong.</p>
      <p className="font-sans">{message}</p>
    </div>
  );
};

export default ErrorDisplay;
