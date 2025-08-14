import React, { useEffect, useState, useCallback } from 'react';
import { fetchCahierLiaison, markMessageLu, fetchEnfantsParent } from '../../services/espaceParentsApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import MessageCard from '../ui/MessageCard';
import EnhancedMessageCard from '../ui/EnhancedMessageCard';
import EnfantSelector from '../ui/EnfantSelector';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { staticCahierLiaison } from '../../data/staticCommunication';

const CahierLiaisonSection = () => {
  const { token, selectedEnfant, user, updateEnfants } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [markingLu, setMarkingLu] = useState(null);
  const [loadingEnfants, setLoadingEnfants] = useState(false);

  // Récupérer les enfants du parent connecté
  const fetchEnfants = useCallback(async () => {
    if (!token || (user && user.enfants && user.enfants.length > 0)) return;

    setLoadingEnfants(true);
    const res = await fetchEnfantsParent(token);
    if (res.success) {
      updateEnfants(res.data);
    } else {
      console.error('Erreur lors de la récupération des enfants:', res.message);
    }
    setLoadingEnfants(false);
  }, [token, user, updateEnfants]);

  const fetchMessages = useCallback(async () => {
    if (!selectedEnfant) return;

    console.log('Récupération du cahier de liaison pour l\'enfant:', selectedEnfant);
    setLoading(true);
    setError(null);

    const res = await fetchCahierLiaison(token, selectedEnfant.id, page, 10);
    console.log('Réponse API cahier de liaison:', res);

    if (res.success) {
      if (res.data && res.data.items) {
        setMessages(res.data.items);
        setTotalPages(res.data.totalPages || 1);
        console.log('Messages chargés:', res.data.items.length);
      } else {
        console.log('Aucun message trouvé dans la réponse');
        setMessages([]);
        setTotalPages(1);
      }
    } else {
      console.error('Erreur API:', res.message);
      setError(res.message || 'Erreur lors du chargement des messages.');
    }
    setLoading(false);
  }, [token, selectedEnfant, page]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleMarkLu = async (messageId) => {
    if (!selectedEnfant) return;

    setMarkingLu(messageId);
    const res = await markMessageLu(token, messageId, selectedEnfant.id);
    if (res.success) {
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, luParParent: true } : msg
      ));
    } else {
      console.error('Erreur lors du marquage du message:', res.message);
    }
    setMarkingLu(null);
  };

  // Récupérer les enfants au chargement
  useEffect(() => {
    fetchEnfants();
  }, [fetchEnfants]);

  // Récupérer les messages quand un enfant est sélectionné
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  if (loadingEnfants) {
    return (
      <section className="w-full max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2">Récupération des enfants...</span>
        </div>
      </section>
    );
  }

  if (!user?.enfants || user.enfants.length === 0) {
    return (
      <section className="w-full max-w-2xl mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Cahier de Liaison</h1>
          <p className="text-gray-600">Aucun enfant trouvé pour ce parent.</p>
        </div>
      </section>
    );
  }

  if (!selectedEnfant) {
    return (
      <section className="w-full max-w-2xl mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Cahier de Liaison</h1>
          <div className="mb-6">
            <EnfantSelector />
          </div>
          <p className="text-gray-600">Veuillez sélectionner un enfant pour voir son cahier de liaison.</p>
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
      <section className="w-full max-w-4xl mx-auto">
        {/* En-tête amélioré */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">📚 Cahier de Liaison</h1>
              <p className="text-green-100">
                Suivez les messages et informations concernant la scolarité de votre enfant
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <EnfantSelector />
            </div>
          </div>
        </div>
        {loading ? (
          <LoadingSpinner className="mt-8" />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded text-center">
            {error}
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-300 mb-4">
                  <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun message</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Aucun message n'a été trouvé dans le cahier de liaison pour <span className="font-medium">{selectedEnfant?.prenom} {selectedEnfant?.nom}</span>.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Les nouveaux messages apparaîtront ici dès qu'ils seront publiés par l'école.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Statistiques des messages */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Cahier de liaison de {selectedEnfant?.prenom} {selectedEnfant?.nom}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Classe : <span className="font-medium">{selectedEnfant?.classe}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{messages.length}</div>
                      <div className="text-sm text-gray-600">
                        {messages.length === 1 ? 'message' : 'messages'}
                      </div>
                    </div>
                  </div>

                  {/* Indicateurs de statut */}
                  <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        {messages.filter(m => !m.luParParent).length} non lus
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        {messages.filter(m => m.luParParent).length} lus
                      </span>
                    </div>
                  </div>
                </div>

                {/* Liste des messages */}
                <div className="space-y-3">
                  {messages.map((message) => (
                    <EnhancedMessageCard
                      key={message.id}
                      message={message}
                      onMarkLu={handleMarkLu}
                      loading={markingLu === message.id}
                    />
                  ))}
                </div>
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8 p-4 bg-gray-50 rounded-xl">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ChevronLeft size={18} />
                  <span className="hidden sm:inline">Précédent</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Page</span>
                  <span className="px-3 py-1 bg-green-600 text-white rounded-lg font-medium">
                    {page}
                  </span>
                  <span className="text-sm text-gray-600">sur {totalPages}</span>
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
};

export default CahierLiaisonSection; 