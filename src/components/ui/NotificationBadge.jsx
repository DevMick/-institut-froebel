import React from 'react';

const NotificationBadge = ({ count }) => {
  if (!count || count < 1) return null;
  return (
    <span
      className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 animate-pulse shadow"
      aria-label={`${count} notifications non lues`}
    >
      {count}
    </span>
  );
};

export default NotificationBadge; 