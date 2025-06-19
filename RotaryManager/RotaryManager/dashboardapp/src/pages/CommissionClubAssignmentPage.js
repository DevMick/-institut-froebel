import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import AffecterMembreCommissionForm from '../components/AffecterMembreCommissionForm';

const CommissionClubAssignmentPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [checkedUser, setCheckedUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const parsed = JSON.parse(userInfoStr);
        setUserInfo(parsed);
      } catch (e) {
        console.error("Erreur lors de la lecture des informations utilisateur:", e);
      }
    }
    setCheckedUser(true);
  }, []);

  if (!checkedUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!userInfo || !userInfo.clubId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-600 text-lg font-semibold">Aucune information de club trouvée. Veuillez vous reconnecter.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      <Sidebar />
      <main 
        className="flex-1 w-full transition-all duration-300 bg-gray-100 min-h-screen overflow-x-hidden" 
        style={{ marginLeft: isMobile ? '0' : 'var(--sidebar-width, 16rem)' }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Affectation des membres aux commissions</h1>
            <Link 
              to="/commissions" 
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FiArrowLeft className="mr-2" />
              Retour aux commissions
            </Link>
          </div>
          <AffecterMembreCommissionForm 
            clubId={userInfo.clubId}
            onSuccess={() => {
              // Optionnel : ajouter une logique après le succès de l'affectation
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default CommissionClubAssignmentPage; 