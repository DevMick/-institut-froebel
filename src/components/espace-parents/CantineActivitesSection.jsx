import React, { useEffect, useState, useCallback } from 'react';
import { fetchCantine, fetchActivites } from '../../services/espaceParentsApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import { formatDate, formatMonth } from '../../utils/dateUtils';
import { formatPrixFCFA } from '../../utils/formatters';
import { ChevronLeft, ChevronRight, Calendar, Utensils, Clock, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const CantineActivitesSection = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('cantine');
  const [cantineData, setCantineData] = useState(null);
  const [activitesData, setActivitesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemaine, setSelectedSemaine] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMois, setSelectedMois] = useState(new Date().toISOString().slice(0, 7));

  const fetchCantineData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchCantine(token, selectedSemaine);
    if (res.success) {
      setCantineData(res.data);
    } else {
      setError(res.message || 'Erreur lors du chargement des menus.');
    }
    setLoading(false);
  }, [token, selectedSemaine]);

  const fetchActivitesData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchActivites(token, selectedMois);
    if (res.success) {
      setActivitesData(res.data);
    } else {
      setError(res.message || 'Erreur lors du chargement des activités.');
    }
    setLoading(false);
  }, [token, selectedMois]);

  useEffect(() => {
    if (activeTab === 'cantine') {
      fetchCantineData();
    } else {
      fetchActivitesData();
    }
  }, [activeTab, fetchCantineData, fetchActivitesData]);

  const changeSemaine = (direction) => {
    const date = new Date(selectedSemaine);
    date.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedSemaine(date.toISOString().split('T')[0]);
  };

  const changeMois = (direction) => {
    const date = new Date(selectedMois + '-01');
    date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedMois(date.toISOString().slice(0, 7));
  };

  return (
    <section className="w-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Cantine & Activités</h1>
      
      <Link
        to="/vie-scolaire"
        className="inline-flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        Retour à la Vie scolaire
      </Link>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('cantine')}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'cantine'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Utensils className="inline mr-2" size={20} />
          Cantine
        </button>
        <button
          onClick={() => setActiveTab('activites')}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'activites'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="inline mr-2" size={20} />
          Activités
        </button>
      </div>

      {loading ? (
        <LoadingSpinner className="mt-8" />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded text-center">
          {error}
        </div>
      ) : (
        <>
          {activeTab === 'cantine' && cantineData && (
            <div className="space-y-6">
              {/* Navigation semaine */}
              <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
                <button
                  onClick={() => changeSemaine('prev')}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <h3 className="text-lg font-semibold text-gray-800">
                  Semaine du {formatDate(cantineData.semaineDebut)} au {formatDate(cantineData.semaineFin)}
                </h3>
                <button
                  onClick={() => changeSemaine('next')}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Menus */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {cantineData.menusSemaine.map((menu, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-4">
                    <div className="text-center mb-3">
                      <div className="font-semibold text-gray-800">
                        {new Date(menu.dateMenu).toLocaleDateString('fr-FR', { weekday: 'long' })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(menu.dateMenu)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-700">{menu.menu}</div>
                      <div className="text-emerald-600 font-semibold">
                        {formatPrixFCFA(menu.prix)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Informations */}
              <div className="bg-emerald-50 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-800 mb-2">Informations pratiques</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="text-emerald-600" size={16} />
                    <span>Horaires : {cantineData.informations.horairesService}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="text-emerald-600" size={16} />
                    <span>Contact : {cantineData.informations.contact}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-emerald-700">
                  {cantineData.informations.allergiesInfo}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activites' && activitesData && (
            <div className="space-y-6">
              {/* Navigation mois */}
              <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
                <button
                  onClick={() => changeMois('prev')}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <h3 className="text-lg font-semibold text-gray-800">
                  {activitesData.mois}
                </h3>
                <button
                  onClick={() => changeMois('next')}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Liste des activités */}
              <div className="space-y-4">
                {activitesData.activites.map((activite) => (
                  <div key={activite.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-lg mb-2">{activite.nom}</h4>
                        <p className="text-gray-600 mb-3">{activite.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="text-emerald-600" size={16} />
                            <span>{formatDate(activite.dateDebut)} - {formatDate(activite.dateFin)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="text-emerald-600" size={16} />
                            <span>{activite.lieu}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="text-emerald-600" size={16} />
                            <span>{activite.classeConcernee}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default CantineActivitesSection; 