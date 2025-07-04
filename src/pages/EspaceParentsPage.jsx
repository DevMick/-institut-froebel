import React, { Suspense, lazy, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ParentSidebar from '../components/layout/ParentSidebar';
import ParentHeader from '../components/layout/ParentHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const DashboardSection = lazy(() => import('../components/espace-parents/DashboardSection'));
const CahierLiaisonSection = lazy(() => import('../components/espace-parents/CahierLiaisonSection'));
const AnnoncesSection = lazy(() => import('../components/espace-parents/AnnoncesSection'));
const BulletinsSection = lazy(() => import('../components/espace-parents/BulletinsSection'));
const CantineActivitesSection = lazy(() => import('../components/espace-parents/CantineActivitesSection'));

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // Temporairement désactivé pour les tests
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }
  
  return children;
};

const EspaceParentsLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar desktop */}
      <ParentSidebar />
      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="bg-white w-64 h-full shadow-xl animate-fade-in-up relative">
            <ParentSidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
          <div className="flex-1 bg-black bg-opacity-30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}
      <div className="parent-main-content flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-64 ml-0">
        <ParentHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-2 md:p-6 w-full pt-16 md:pt-6 pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const EspaceParentsPage = () => {
  return (
    <PrivateRoute>
      <Suspense fallback={<LoadingSpinner className="mt-16" />}>
        <Routes>
          <Route element={<EspaceParentsLayout />}>
            <Route index element={<DashboardSection />} />
            <Route path="cahier-liaison" element={<CahierLiaisonSection />} />
            <Route path="annonces" element={<AnnoncesSection />} />
            <Route path="bulletins" element={<BulletinsSection />} />
            <Route path="cantine-activites" element={<CantineActivitesSection />} />
          </Route>
        </Routes>
      </Suspense>
    </PrivateRoute>
  );
};

export default EspaceParentsPage; 