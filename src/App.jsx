import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Presentation from './pages/Presentation';
import Schools from './pages/Schools';
import Contact from './pages/Contact';
import LaTulipe from './pages/LaTulipe';
import Cycles from './pages/Cycles';
import VieScolaire from './pages/VieScolaire';
import AdmissionsPage from './pages/AdmissionsPage';
import EspaceParentsPage from './pages/EspaceParentsPage';
import LoginPage from './pages/LoginPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

function App() {
  // Nettoyage forcé du localStorage au démarrage de l'application
  useEffect(() => {
    const forceCleanLocalStorage = () => {
      console.log('Nettoyage forcé du localStorage au démarrage...');
      // Nettoyer complètement toutes les données d'authentification
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('school');
      console.log('localStorage nettoyé avec succès');
    };

    forceCleanLocalStorage();
  }, []);
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Pages avec le layout global */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/presentation" element={<Presentation />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
          {/* Pages La Tulipe avec leur propre header/footer */}
          <Route path="/la-tulipe" element={<LaTulipe />} />
          <Route path="/cycles" element={<Cycles />} />
          <Route path="/vie-scolaire" element={<VieScolaire />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          {/* Page de connexion */}
          <Route path="/login" element={<LoginPage />} />
          {/* Espace Parents avec son propre layout */}
          <Route path="/espace-parents/*" element={<EspaceParentsPage />} />
          {/* Page SuperAdmin - Protégée par authentification */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute requiredRole="SuperAdmin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 