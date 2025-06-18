import React from 'react';
import { useNavigate } from 'react-router-dom';
import AffecterMembreCommissionForm from '../components/AffecterMembreCommissionForm';

const CommissionClubAssignmentMemberPage = () => {
  const navigate = useNavigate();
  // Récupérer le clubId depuis le localStorage (user connecté)
  let clubId = null;
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      clubId = JSON.parse(storedUser).clubId;
    } catch {}
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-2xl">
        <AffecterMembreCommissionForm
          clubId={clubId}
          onSuccess={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default CommissionClubAssignmentMemberPage; 