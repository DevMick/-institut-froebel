import React from 'react';

const colors = {
  success: 'bg-emerald-100 text-emerald-700 border-emerald-400',
  error: 'bg-red-100 text-red-700 border-red-400',
  info: 'bg-blue-100 text-blue-700 border-blue-400',
};

const ToastNotification = ({ type = 'info', message }) => (
  <div className={`border-l-4 p-4 my-2 rounded shadow ${colors[type] || colors.info}`}>
    {message}
  </div>
);

export default ToastNotification; 