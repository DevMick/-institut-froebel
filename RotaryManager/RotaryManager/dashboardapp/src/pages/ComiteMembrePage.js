import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { getComiteMembres, createComiteMembre, updateComiteMembre, deleteComiteMembre, getMembresDisponibles } from '../api/comiteMembreService';
import { getFonctions } from '../api/fonctionService';

const ComiteMembrePage = () => {
  const { clubId, comiteId } = useParams();
  const [comiteMembres, setComiteMembres] = useState([]);
  const [membresDisponibles, setMembresDisponibles] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [form, setForm] = useState({
    membreId: '',
    fonctionId: ''
  });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'form' or 'list'
  const [comiteInfo, setComiteInfo] = useState(null);
  const [statistiques, setStatistiques] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (clubId && comiteId) {
      fetchComiteMembres();
      fetchMembresDisponibles();
      fetchFonctions();
    }
  }, [clubId, comiteId]);

  const fetchComiteMembres = async () => {
    try {
      const data = await getComiteMembres(clubId, comiteId);
      setComiteMembres(data.membres);
      setComiteInfo(data.comite);
      setStatistiques(data.statistiques);
    } catch (error) {
      setError('Erreur lors de la récupération des membres du comité');
      setComiteMembres([]);
    }
  };

  const fetchMembresDisponibles = async () => {
    try {
      const data = await getMembresDisponibles(clubId, comiteId);
      setMembresDisponibles(data);
    } catch (error) {
      setError('Erreur lors de la récupération des membres disponibles');
    }
  };

  const fetchFonctions = async () => {
    try {
      const data = await getFonctions();
      setFonctions(data);
    } catch (error) {
      setError('Erreur lors de la récupération des fonctions');
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (editId) {
        await updateComiteMembre(clubId, comiteId, editId, form);
        setMessage('Membre mis à jour avec succès');
      } else {
        await createComiteMembre(clubId, comiteId, form);
        setMessage('Membre ajouté avec succès');
      }
      setForm({ membreId: '', fonctionId: '' });
      setEditId(null);
      fetchComiteMembres();
      fetchMembresDisponibles();
    } catch (error) {
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (membre) => {
    setForm({
      membreId: membre.membreId,
      fonctionId: membre.fonctionId
    });
    setEditId(membre.id);
    setActiveTab('form');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer ce membre du comité ?')) {
      try {
        await deleteComiteMembre(clubId, comiteId, id);
        setMessage('Membre retiré avec succès');
        fetchComiteMembres();
        fetchMembresDisponibles();
      } catch (error) {
        setError(error.message || 'Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      <Sidebar />
      <main 
        className="flex-1 w-full transition-all duration-300 bg-gray-100 min-h-screen overflow-x-hidden" 
        style={{ marginLeft: isMobile ? '0' : 'var(--sidebar-width, 16rem)' }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestion des membres du comité</h1>
              {comiteInfo && (
                <p className="text-gray-600 mt-1">
                  {comiteInfo.nom} - Mandat {comiteInfo.mandatAnnee}
                </p>
              )}
            </div>
            <Link 
              to="/comites" 
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FaArrowLeft className="mr-2" />
              Retour aux comités
            </Link>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Statistiques */}
          {statistiques && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-700">Total des membres</h3>
                <p className="text-2xl font-bold text-blue-600">{statistiques.totalMembres}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-700">Fonctions représentées</h3>
                <p className="text-2xl font-bold text-blue-600">{statistiques.fonctionsRepresentees}</p>
              </div>
            </div>
          )}

          {/* Onglets */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => { setActiveTab('form'); setEditId(null); setForm({ membreId: '', fonctionId: '' }); }}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'form'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ajouter un membre
                </button>
                <button
                  onClick={() => setActiveTab('list')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'list'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Liste des membres
                </button>
              </nav>
            </div>
          </div>

          {/* Formulaire */}
          {activeTab === 'form' && (
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="membreId" className="block text-sm font-medium text-gray-700">
                    Membre
                  </label>
                  <select
                    id="membreId"
                    name="membreId"
                    value={form.membreId}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un membre</option>
                    {membresDisponibles.map((membre) => (
                      <option key={membre.id} value={membre.id}>
                        {membre.nomComplet}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="fonctionId" className="block text-sm font-medium text-gray-700">
                    Fonction
                  </label>
                  <select
                    id="fonctionId"
                    name="fonctionId"
                    value={form.fonctionId}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une fonction</option>
                    {fonctions.map((fonction) => (
                      <option key={fonction.id} value={fonction.id}>
                        {fonction.nomFonction}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Enregistrement...' : editId ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste */}
          {activeTab === 'list' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Membre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fonction
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comiteMembres.map((membre) => (
                    <tr key={membre.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {membre.nomCompletMembre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {membre.emailMembre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {membre.nomFonction}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(membre)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(membre.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Retirer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ComiteMembrePage; 