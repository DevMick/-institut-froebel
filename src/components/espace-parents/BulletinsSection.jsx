import React, { useEffect, useState, useCallback } from 'react';
import { fetchBulletins, bulletinsTestData } from '../../services/espaceParentsApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import BulletinCard from '../ui/BulletinCard';
import EnfantSelector from '../ui/EnfantSelector';
import { Link } from 'react-router-dom';

const BulletinsSection = () => {
  const { token, selectedEnfant } = useAuth();
  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!selectedEnfant) return;
    setLoading(true);
    setError(null);
    const res = await fetchBulletins(token, selectedEnfant.id);
    if (res.success) {
      setBulletins(res.data);
    } else {
      setError(res.message || 'Erreur lors du chargement des bulletins.');
    }
    setLoading(false);
  }, [token, selectedEnfant]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownload = (nomFichier) => {
    // Simuler téléchargement (à remplacer par vrai téléchargement)
    console.log(`Téléchargement de ${nomFichier}`);
    // window.open(`/api/download/${nomFichier}`, '_blank');
  };

  if (!selectedEnfant) {
    // Mode démo : afficher les bulletins statiques pour un enfant fictif
    const enfantDemo = { prenom: "Koffi", nom: "Diallo", classe: "CP1" };
    return (
      <section className="w-full max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Bulletins</h1>
          <span className="text-sm text-gray-700 font-medium">{enfantDemo.prenom} {enfantDemo.nom} ({enfantDemo.classe})</span>
        </div>
        <div className="space-y-3">
          {bulletinsTestData.map((bulletin) => (
            <BulletinCard
              key={bulletin.id}
              bulletin={bulletin}
              onDownload={() => {}}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <Link
        to="/vie-scolaire"
        className="inline-flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        Retour à la Vie scolaire
      </Link>
      <section className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Bulletins</h1>
          <EnfantSelector />
        </div>
        
        {loading ? (
          <LoadingSpinner className="mt-8" />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded text-center">
            {error}
          </div>
        ) : (
          <div className="space-y-3">
            {bulletins.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Aucun bulletin disponible pour le moment.</p>
              </div>
            ) : (
              bulletins.map((bulletin) => (
                <BulletinCard
                  key={bulletin.id}
                  bulletin={bulletin}
                  onDownload={handleDownload}
                />
              ))
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default BulletinsSection; 