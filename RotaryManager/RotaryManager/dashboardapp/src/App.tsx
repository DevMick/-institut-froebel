import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ClubProvider } from './contexts/ClubContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import FonctionRolesResponsabilitesPage from './pages/FonctionRolesResponsabilitesPage';
import FonctionEcheancesPage from './pages/FonctionEcheancesPage';

function App() {
  return (
    <AuthProvider>
      <ClubProvider>
        <AppRoutes />
      </ClubProvider>
    </AuthProvider>
  );
}

export default App;
