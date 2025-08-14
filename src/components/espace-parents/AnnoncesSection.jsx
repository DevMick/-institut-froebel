import React, { useEffect, useState, useCallback } from 'react';
import { fetchAnnoncesParEcole, fetchEnfantsParent } from '../../services/espaceParentsApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import AnnonceCard from '../ui/AnnonceCard';
import { Search, Filter, ChevronLeft, ChevronRight, Users, School } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnnoncesSection = () => {
  const { token, user } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [enfants, setEnfants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Récupérer les enfants du parent connecté
  const fetchEnfants = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetchEnfantsParent(token);
      if (res.success) {
        setEnfants(res.data);
        console.log('Enfants récupérés:', res.data);
      } else {
        console.error('Erreur lors de la récupération des enfants:', res.message);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des enfants:', error);
    }
  }, [token]);

  // Filtrer les annonces selon les enfants du parent
  const filterAnnoncesForParent = (annoncesData, enfantsData) => {
    if (!enfantsData || enfantsData.length === 0) {
      return annoncesData;
    }

    // Récupérer les IDs des classes des enfants du parent
    const classesIds = enfantsData.map(enfant => enfant.classeId).filter(Boolean);
    console.log('Classes des enfants:', classesIds);

    // Filtrer les annonces :
    // - Si classeId est null : annonce générale (pour tous)
    // - Si classeId correspond à une classe d'un enfant : annonce spécifique
    const filteredAnnonces = annoncesData.filter(annonce => {
      const isGenerale = annonce.classeId === null || annonce.classeId === undefined;
      const isForEnfantClasse = classesIds.includes(annonce.classeId);

      console.log(`Annonce "${annonce.titre}": classeId=${annonce.classeId}, isGenerale=${isGenerale}, isForEnfantClasse=${isForEnfantClasse}`);

      return isGenerale || isForEnfantClasse;
    });

    console.log(`Annonces filtrées: ${filteredAnnonces.length}/${annoncesData.length}`);
    return filteredAnnonces;
  };

  const fetchData = useCallback(async () => {
    if (!token || enfants.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Extraire l'école ID du token JWT
      let ecoleId = 2; // Fallback par défaut

      if (token) {
        try {
          // Décoder le token JWT pour extraire l'école ID
          const payload = JSON.parse(atob(token.split('.')[1]));
          ecoleId = parseInt(payload.school_id) || 2;
          console.log('École ID extraite du token:', ecoleId);
        } catch (e) {
          console.warn('Impossible de décoder le token, utilisation de l\'école ID par défaut');
        }
      }

      console.log('Récupération des annonces pour l\'école:', ecoleId);

      const res = await fetchAnnoncesParEcole(token, ecoleId, page, 10, typeFilter, search);
      if (res.success) {
        // Filtrer les annonces selon les enfants du parent
        const filteredAnnonces = filterAnnoncesForParent(res.data.items, enfants);
        setAnnonces(filteredAnnonces);
        setTotalPages(res.data.totalPages);
      } else {
        setError(res.message || 'Erreur lors du chargement des annonces.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
      setError('Erreur lors du chargement des annonces.');
    }

    setLoading(false);
  }, [token, enfants, page, typeFilter, search]);

  // Récupérer les enfants au chargement du composant
  useEffect(() => {
    fetchEnfants();
  }, [fetchEnfants]);

  // Récupérer les annonces quand les enfants sont chargés
  useEffect(() => {
    if (enfants.length > 0) {
      fetchData();
    }
  }, [fetchData, enfants]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Annonces</h1>

        {/* Informations sur les enfants et le filtrage */}
        {enfants.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-blue-600" size={20} />
              <h3 className="font-semibold text-blue-800">Annonces pour vos enfants</h3>
            </div>
            <div className="text-sm text-blue-700">
              <p className="mb-2">Vous voyez les annonces générales et celles spécifiques aux classes de :</p>
              <div className="flex flex-wrap gap-2">
                {enfants.map((enfant, index) => (
                  <span key={enfant.id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    <School size={12} />
                    {enfant.prenom} {enfant.nom} ({enfant.classe})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher une annonce..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Tous les types</option>
                <option value="generale">Générale</option>
                <option value="cantine">Cantine</option>
                <option value="activite">Activité</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Rechercher
            </button>
          </form>
        </div>

        {loading ? (
          <LoadingSpinner className="mt-8" />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded text-center">
            {error}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {annonces.map((annonce) => (
                <AnnonceCard key={annonce.id} annonce={annonce} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} sur {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
};

export default AnnoncesSection; 