import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ClubManager from '../components/ClubManager';

const ClubsPage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      <Sidebar />
      <main 
        className="flex-1 w-full transition-all duration-300 bg-gray-100 min-h-screen overflow-x-hidden" 
        style={{ marginLeft: isMobile ? '0' : 'var(--sidebar-width, 16rem)' }}
      >
        <ClubManager />
      </main>
    </div>
  );
};

export default ClubsPage; 