import React from 'react';

const LoadingSpinner = ({ size = 32, className = '' }) => (
  <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Chargement...">
    <svg
      className="animate-spin text-emerald-600"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  </div>
);

export default LoadingSpinner; 