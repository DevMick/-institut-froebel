import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import { getComiteMembres, addComiteMembre, removeComiteMembre, getMembresDisponibles } from '../api/comiteMembreService';
import { fonctionService } from '../api/fonctionService';
import { getMandats } from '../api/mandatService';

const ComiteMembresPage = () => {
  const { comiteId } = useParams();
  const [membres, setMembres] = useState([]);
  const [membresDisponibles, setMembresDisponibles] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [mandats, setMandats] = useState([]);
  const [comiteInfo, setComiteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('affecter'); // 'affecter' ou 'liste'
  const [form, setForm] = useState({
    membreId: '',
    fonctionId: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setUserInfo(userObj);
      } catch (e) {
        console.error('Erreur lors de la récupération des informations utilisateur:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (userInfo?.clubId && comiteId) {
      fetchData();
    }
  }, [userInfo, comiteId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les membres actuels du comité
      const comiteResponse = await getComiteMembres(userInfo.clubId, comiteId);
      setMembres(comiteResponse.Membres || []);
      setComiteInfo(comiteResponse.Comite);

      // Récupérer les membres disponibles
      const disponiblesResponse = await getMembresDisponibles(userInfo.clubId, comiteId);
      setMembresDisponibles(disponiblesResponse || []);

      // Récupérer les fonctions
      const fonctionsResponse = await fonctionService.getFonctions();
      setFonctions(fonctionsResponse || []);

      // Récupérer les mandats
      const mandatsResponse = await getMandats(userInfo.clubId);
      setMandats(mandatsResponse || []);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      await addComiteMembre(userInfo.clubId, comiteId, form);
      setSuccess('Membre ajouté avec succès au comité');
      setForm({ membreId: '', fonctionId: '' });
      fetchData();
      setActiveTab('liste');
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'ajout du membre");
    }
  };

  const handleRemoveMembre = async (membreComiteId) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer ce membre du comité ?')) {
      try {
        setError(null);
        setSuccess(null);

        await removeComiteMembre(userInfo.clubId, comiteId, membreComiteId);
        setSuccess('Membre retiré avec succès du comité');
        fetchData();
      } catch (err) {
        setError(err.message || 'Une erreur est survenue lors du retrait du membre');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="text-center">Chargement...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 flex justify-center">
        <div className="w-full max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {comiteInfo?.Nom || 'Comité'}
            </h1>
            <Link 
              to="/comites" 
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FaArrowLeft className="mr-2" />
              Retour aux comités
            </Link>
          </div>

          {/* Onglets */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('affecter')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'affecter'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Affecter un membre
                </button>
                <button
                  onClick={() => setActiveTab('liste')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'liste'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Liste des affectations
                </button>
              </nav>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}

          {activeTab === 'affecter' ? (
            <div className="flex justify-center">
              <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg mt-8">
                <h2 className="text-xl font-bold mb-6 text-center">Affecter un membre au comité</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Membre
                    </label>
                    <select
                      value={form.membreId}
                      onChange={(e) => setForm(f => ({ ...f, membreId: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Sélectionner un membre</option>
                      {membresDisponibles.map((membre) => (
                        <option key={membre.Id} value={membre.Id}>
                          {membre.NomComplet}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fonction
                    </label>
                    <select
                      value={form.fonctionId}
                      onChange={(e) => setForm(f => ({ ...f, fonctionId: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Sélectionner une fonction</option>
                      {fonctions.map((fonction) => (
                        <option key={fonction.id} value={fonction.id}>
                          {fonction.nomFonction}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer transition-colors duration-200"
                    >
                      Affecter le membre
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Membre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fonction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mandat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de nomination
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {membres && membres.length > 0 ? (
                      membres.map((membre) => (
                        <tr key={membre.Id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {membre.NomCompletMembre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {membre.NomFonction}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {membre.MandatPeriodeComplete}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(membre.DateNomination).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleRemoveMembre(membre.Id)}
                              className="text-red-600 hover:text-red-900 cursor-pointer transition-colors duration-200"
                            >
                              Retirer
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          Aucun membre dans ce comité
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ComiteMembresPage;