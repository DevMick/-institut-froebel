import React, { useEffect, useState, useCallback } from 'react';
import { fetchDashboard } from '../../services/espaceParentsApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import NotificationBadge from '../ui/NotificationBadge';
import { formatDate } from '../../utils/dateUtils';
import { User, Users, Bell, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardSection = () => {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchDashboard(token);
    if (res.success) {
      setData(res.data);
    } else {
      setError(res.message || 'Erreur lors du chargement du dashboard.');
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // polling 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return <LoadingSpinner className="mt-12" />;
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mt-6 text-center animate-pulse">
        {error}
      </div>
    );
  }
  if (!data) return null;

  const { utilisateur, enfants, notifications } = data;

  return (
    <>
      <Link
        to="/vie-scolaire"
        className="inline-flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        Retour à la Vie scolaire
      </Link>
      <section className="w-full max-w-full overflow-x-hidden grid grid-cols-1 md:grid-cols-2 gap-4 mx-2 md:mx-0 max-w-3xl md:max-w-none mx-auto animate-fade-in">
        {/* Card Bienvenue */}
        <div className="bg-white rounded-xl shadow p-3 md:p-5 flex flex-col gap-2 border border-gray-100 w-full min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <User className="text-emerald-600" size={24} />
            <h2 className="text-base md:text-lg font-bold text-gray-800">Bienvenue, {utilisateur.nomComplet}</h2>
          </div>
          <div className="text-gray-600 text-sm md:text-base">{utilisateur.email}</div>
          <div className="text-emerald-700 font-semibold text-xs md:text-sm mt-1">{utilisateur.ecoleNom}</div>
        </div>
        {/* Card Mes Enfants */}
        <div className="bg-white rounded-xl shadow p-3 md:p-5 flex flex-col gap-2 border border-gray-100 w-full min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-emerald-600" size={24} />
            <h2 className="text-base md:text-lg font-bold text-gray-800">Mes Enfants</h2>
          </div>
          {enfants && enfants.length > 0 ? (
            <ul className="space-y-1">
              {enfants.map((enf) => (
                <li key={enf.id} className="text-gray-700 text-sm flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{enf.prenom} {enf.nom}</span>
                  <span className="bg-emerald-50 text-emerald-700 rounded px-2 py-0.5 text-xs ml-2">{enf.classe}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-sm">Aucun enfant trouvé</div>
          )}
        </div>
        {/* Card Notifications */}
        <div className="bg-white rounded-xl shadow p-3 md:p-5 flex flex-col gap-2 border border-gray-100 w-full min-w-0 relative">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="text-emerald-600" size={24} />
            <h2 className="text-base md:text-lg font-bold text-gray-800">Notifications</h2>
            <NotificationBadge count={notifications.messagesNonLus} />
          </div>
          <div className="text-sm md:text-base text-gray-700 font-medium mb-1">Messages non lus : <span className="text-emerald-600 font-bold">{notifications.messagesNonLus}</span></div>
          <div className="mt-2">
            <div className="text-xs md:text-sm text-gray-500 font-semibold mb-1">Dernières annonces :</div>
            {notifications.dernieresAnnonces && notifications.dernieresAnnonces.length > 0 ? (
              <ul className="space-y-1">
                {notifications.dernieresAnnonces.map((ann) => (
                  <li key={ann.id} className="flex items-center gap-2 text-gray-700 flex-wrap">
                    <Megaphone className="text-blue-500" size={14} />
                    <span className="font-medium">{ann.titre}</span>
                    <span className="text-xs text-gray-400 ml-2">{formatDate(ann.datePublication)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 text-xs">Aucune annonce récente</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default DashboardSection; 