import React, { useEffect, useState, useCallback } from 'react';
import { fetchCahierLiaison, markMessageLu } from '../../services/espaceParentsApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import MessageCard from '../ui/MessageCard';
import EnfantSelector from '../ui/EnfantSelector';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { staticCahierLiaison } from '../../data/staticCommunication';

const CahierLiaisonSection = () => {
  const { token, selectedEnfant } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [markingLu, setMarkingLu] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!selectedEnfant) return;
    setLoading(true);
    setError(null);
    const res = await fetchCahierLiaison(token, selectedEnfant.id, page, 10);
    if (res.success) {
      setMessages(res.data.items);
      setTotalPages(res.data.totalPages);
    } else {
      setError(res.message || 'Erreur lors du chargement des messages.');
    }
    setLoading(false);
  }, [token, selectedEnfant, page]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleMarkLu = async (messageId) => {
    setMarkingLu(messageId);
    const res = await markMessageLu(token, messageId);
    if (res.success) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, luParParent: true } : msg
      ));
    }
    setMarkingLu(null);
  };

  if (!selectedEnfant) {
    // Mode démo : afficher les messages statiques pour un enfant fictif
    const enfantDemo = { prenom: "Koffi", nom: "Diallo", classe: "CP1" };
    return (
      <section className="w-full max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Cahier de Liaison</h1>
          <span className="text-sm text-gray-700 font-medium">{enfantDemo.prenom} {enfantDemo.nom} ({enfantDemo.classe})</span>
        </div>
        <div className="space-y-2">
          {staticCahierLiaison.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onMarkLu={() => {}}
              loading={false}
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
          <h1 className="text-2xl font-bold text-gray-800">Cahier de Liaison</h1>
          <EnfantSelector />
        </div>
        {loading ? (
          <LoadingSpinner className="mt-8" />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded text-center">
            {error}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {messages.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  onMarkLu={handleMarkLu}
                  loading={markingLu === message.id}
                />
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

export default CahierLiaisonSection; 