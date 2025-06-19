import React, { ReactNode, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthContextType } from '../contexts/AuthContext.d';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ClubsPage from '../pages/ClubsPage';
import CommissionsPage from '../pages/CommissionsPage';
import CommissionClubPage from '../pages/CommissionClubPage';
import CommissionAssignmentPage from '../pages/CommissionAssignmentPage';
import MembersPage from '../pages/MembersPage';
import MandatsPage from '../pages/MandatsPage';
import ComitesPage from '../pages/ComitesPage';
import ComiteMembresPage from '../pages/ComiteMembresPage';
import MembresComitePage from '../pages/MembresComitePage';
import CommissionClubAssignmentMemberPage from '../pages/CommissionClubAssignmentMemberPage';
import SettingsPage from '../pages/SettingsPage';
import CommissionClubAssignmentPage from '../pages/CommissionClubAssignmentPage';
import GestionCommissionsPage from '../pages/GestionCommissionsPage';
import AffectationComitePage from '../pages/AffectationComitePage';
import TypeReunionPage from '../pages/TypeReunion/TypeReunionPage';
import TypeReunionReunionsPage from '../pages/TypeReunion/TypeReunionReunionsPage';
import EvenementsPage from '../pages/EvenementsPage';
import EvenementDocuments from '../pages/EvenementDocuments';
import EvenementImages from '../pages/EvenementImages';
import EvenementBudget from '../pages/EvenementBudget';
import EvenementRecette from '../pages/EvenementRecette';
import Cotisations from '../pages/Cotisations';
import PaiementsCotisationsPage from '../pages/PaiementsCotisationsPage';
import ReunionPage from '../pages/ReunionPage';
import ReunionDocumentsPage from '../pages/ReunionDocumentsPage';
import ListePresencePage from '../pages/ListePresence/ListePresencePage';
import OrdreDuJourPage from '../pages/OrdreDuJourPage';
import FonctionRolesResponsabilitesPage from '../pages/FonctionRolesResponsabilitesPage';
import FonctionEcheancesPage from '../pages/FonctionEcheancesPage';
import TypeDocumentPage from '../pages/TypeDocumentPage';
import DocumentsPage from '../pages/DocumentsPage';
import TypeBudgetPage from '../pages/TypeBudgetPage';
import CategoryBudgetPage from '../pages/CategoryBudgetPage';
import SousCategoryBudgetPage from '../pages/SousCategoryBudgetPage';
import RubriqueBudgetPage from '../pages/RubriqueBudgetPage';
import RubriqueBudgetRealisePage from '../pages/RubriqueBudgetRealisePage';
import CategoriesPage from '../pages/CategoriesPage';
import InviteReunionPage from '../pages/InviteReunionPage';
import GalasPage from '../pages/GalasPage';
import GalaInvitesPage from '../pages/GalaInvitesPage';
import GalaTableAffectationPage from '../pages/GalaTableAffectationPage';
import GalaTicketPage from '../pages/GalaTicketPage';
import GalaTombolaPage from '../pages/GalaTombolaPage';
import GalaTablesPage from '../pages/GalaTablesPage';
import CompteRenduPage from '../pages/CompteRenduPage';
const FonctionsPage = lazy(() => import('../pages/FonctionsPage'));

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth() as AuthContextType;
  
  if (!isAuthenticated()) {
    // Redirection immédiate vers la page de login
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth() as AuthContextType;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated() ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!isAuthenticated() ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
        
        <Route element={<PrivateRoute><Outlet /></PrivateRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/membres" element={<MembersPage />} />
          <Route path="/mandats" element={<MandatsPage />} />
          <Route path="/galas" element={<GalasPage />} />
          <Route path="/gala-tables" element={<GalaTablesPage />} />
          <Route path="/gala-tickets" element={<GalaTicketPage />} />
          <Route path="/gala-tombolas" element={<GalaTombolaPage />} />
          <Route path="/fonctions" element={
            <Suspense fallback={<div>Chargement...</div>}>
              <FonctionsPage />
            </Suspense>
          } />
          <Route path="/fonctions/roles-responsabilites" element={<FonctionRolesResponsabilitesPage />} />
          <Route path="/fonctions/echeances" element={<FonctionEcheancesPage />} />
          <Route path="/fonctions/cotisations" element={<Cotisations />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/types" element={<TypeDocumentPage />} />
          <Route path="/documents/categories" element={<CategoriesPage />} />
          <Route path="/types-budget" element={<TypeBudgetPage />} />
          <Route path="/types-document" element={<TypeDocumentPage />} />
          <Route path="/commissions" element={<CommissionsPage />} />
          <Route path="/commissions/:commissionId" element={<CommissionClubPage />} />
          <Route path="/commissions/:commissionId/affectation" element={<CommissionAssignmentPage />} />
          <Route path="/comites" element={<ComitesPage />} />
          <Route path="/comites/:comiteId/membres" element={<ComiteMembresPage />} />
          <Route path="/membres-comite" element={<MembresComitePage />} />
          <Route path="/commissions/affecter-club" element={<CommissionClubAssignmentPage />} />
          <Route path="/gestion-commissions" element={<GestionCommissionsPage />} />
          <Route path="/affectation-comite" element={<AffectationComitePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/clubs/:clubId/types-reunion" element={<TypeReunionPage />} />
          <Route path="/clubs/:clubId/types-reunion/:typeId/reunions" element={<TypeReunionReunionsPage />} />
          <Route path="/clubs/:clubId/reunions" element={<ReunionPage />} />
          <Route path="/clubs/:clubId/documents" element={<ReunionDocumentsPage />} />
          <Route path="/clubs/:clubId/reunions/:reunionId/presences" element={<ListePresencePage />} />
          <Route path="/clubs/:clubId/liste-presence" element={<ListePresencePage />} />
          <Route path="/clubs/:clubId/compte-rendu" element={<CompteRenduPage />} />
          <Route path="/evenements" element={<EvenementsPage />} />
          <Route path="/evenement-documents" element={<EvenementDocuments />} />
          <Route path="/evenement-images" element={<EvenementImages />} />
          <Route path="/evenement-budget" element={<EvenementBudget />} />
          <Route path="/evenement-recettes" element={<EvenementRecette />} />
          <Route path="/cotisations" element={<Cotisations />} />
          <Route path="/paiements-cotisations" element={<PaiementsCotisationsPage />} />
          <Route path="/clubs/:clubId/ordres-du-jour" element={<OrdreDuJourPage />} />
          <Route path="/clubs/:clubId/categories-budget" element={<CategoryBudgetPage />} />
          <Route path="/clubs/:clubId/sous-categories-budget" element={<SousCategoryBudgetPage />} />
          <Route path="/rubriques-budget" element={<RubriqueBudgetPage />} />
          <Route path="/realisations-budget" element={<RubriqueBudgetRealisePage />} />
          <Route
            path="/clubs/:clubId/invites-reunion"
            element={
              <PrivateRoute>
                <InviteReunionPage />
              </PrivateRoute>
            }
          />
          <Route path="/gala-invites" element={<GalaInvitesPage />} />
          <Route path="/gala-table-affectations" element={<GalaTableAffectationPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes; 