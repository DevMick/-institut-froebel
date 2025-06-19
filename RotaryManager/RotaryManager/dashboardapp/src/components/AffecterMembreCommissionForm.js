import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getClubMembers } from '../api/memberService';
import { getMandats } from '../api/mandatService';
import { getClubCommissionMembers, getCommissions } from '../api/commissionService';

const AffecterMembreCommissionForm = ({ clubId, onSuccess }) => {
  const { commissionClubId } = useParams();
  const [members, setMembers] = useState([]);
  const [mandats, setMandats] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [form, setForm] = useState({
    MembreId: '',
    MandatId: '',
    CommissionId: '',
    EstResponsable: false,
    DateNomination: '',
    Commentaires: ''
  });
  const [selectedMembre, setSelectedMembre] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('form');

  useEffect(() => {
    if (clubId && commissionClubId) {
      getClubMembers(clubId).then(setMembers);
      getMandats(clubId).then(data => {
        console.log('=== Données des mandats reçues ===');
        console.log('Mandats bruts:', data);
        if (data && data.length > 0) {
          console.log('Premier mandat:', data[0]);
          console.log('Date de début:', data[0].dateDebut);
          console.log('Date de fin:', data[0].dateFin);
        }
        setMandats(data);
      }).catch(() => setMandats([]));
      getCommissions().then(setCommissions).catch(() => setCommissions([]));
      getClubCommissionMembers(clubId, commissionClubId).then(data => {
        console.log('Affectations API:', data);
        setAffectations(data);
      }).catch(() => setAffectations([]));
    }
  }, [clubId, commissionClubId]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    if (!commissionClubId) {
      setError('ID de la commission non trouvé');
      setSubmitting(false);
      return;
    }
    try {
      // Appel API à adapter selon ta logique backend
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/clubs/${clubId}/commissions/${commissionClubId}/membres`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          membreId: selectedMembre,
          commissionId: form.CommissionId,
          mandatId: form.MandatId,
          estResponsable: form.EstResponsable,
          dateNomination: form.DateNomination ? new Date(form.DateNomination).toISOString() : null,
          commentaires: form.Commentaires
        })
      });
      if (!res.ok) {
        const errData = await res.text();
        throw new Error(errData || 'Erreur lors de l\'affectation');
      }
      setMessage('Membre affecté avec succès');
      setSelectedMembre('');
      setForm({ ...form, CommissionId: '', MandatId: '', EstResponsable: false, DateNomination: '', Commentaires: '' });
      // Rafraîchir la liste
      getClubCommissionMembers(clubId, commissionClubId).then(setAffectations);
      setActiveTab('list');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('form')}
            className={`py-3 px-4 font-medium text-sm border-b-2 ${activeTab === 'form' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >Affecter un membre</button>
          <button
            onClick={() => setActiveTab('list')}
            className={`py-3 px-4 font-medium text-sm border-b-2 ${activeTab === 'list' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >Liste des affectations</button>
        </nav>
      </div>
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{message}</div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>
      )}
      {activeTab === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-center">Affecter un membre à une commission</h2>
          <div>
            <label className="block font-semibold mb-1">Membre</label>
            <select
              value={selectedMembre}
              onChange={e => setSelectedMembre(e.target.value)}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Sélectionner un membre</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Commission</label>
            <select
              name="CommissionId"
              value={form.CommissionId}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Sélectionner une commission</option>
              {commissions.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Mandat</label>
            <select name="MandatId" value={form.MandatId} onChange={handleChange} required className="w-full border p-2 rounded">
              <option value="">Sélectionner un mandat</option>
              {mandats && mandats.map(m => {
                console.log('=== Affichage du mandat ===');
                console.log('Mandat:', m);
                console.log('Date de début:', m.dateDebut);
                console.log('Date de fin:', m.dateFin);
                return (
                  <option key={m.id} value={m.id}>
                    {m.annee} (du {m.dateDebut ? new Date(m.dateDebut).toLocaleDateString() : 'N/A'} au {m.dateFin ? new Date(m.dateFin).toLocaleDateString() : 'N/A'})
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="EstResponsable"
              checked={form.EstResponsable}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label className="font-semibold">Responsable de la commission</label>
          </div>
          <div>
            <label className="block font-semibold mb-1">Date de nomination</label>
            <input
              type="date"
              name="DateNomination"
              value={form.DateNomination}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Commentaires</label>
            <textarea
              name="Commentaires"
              value={form.Commentaires}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" disabled={submitting}>
              {submitting ? 'Affectation en cours...' : 'Affecter le membre'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Liste des affectations</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Membre</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mandat</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Responsable</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date de nomination</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Commentaires</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {affectations.membres && affectations.membres.length > 0 ? affectations.membres.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 group">
                      <td className="px-4 py-4 whitespace-nowrap font-semibold text-gray-900">{a.nomCompletMembre}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{a.nomCommission || ''}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{a.mandatAnnee || ''}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{a.estResponsable ? 'Oui' : 'Non'}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{a.dateNomination ? new Date(a.dateNomination).toLocaleDateString() : ''}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{a.commentaires || ''}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        Aucune affectation trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffecterMembreCommissionForm; 