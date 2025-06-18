import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClubMembers, deleteMember } from '../api/memberService';

const MemberManager = ({ onEdit }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Récupérer le clubId depuis le localStorage
  const storedUser = localStorage.getItem('user');
  let clubId = null;
  if (storedUser) {
    try {
      clubId = JSON.parse(storedUser).clubId;
    } catch {}
  }

  useEffect(() => {
    if (clubId) {
      fetchMembers(clubId);
    } else {
      setError("Impossible de récupérer le clubId. Veuillez vous reconnecter.");
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [clubId]);

  const fetchMembers = async (clubId) => {
    setLoading(true);
    try {
      const data = await getClubMembers(clubId);
      setMembers(data);
      setError(null);
    } catch (err) {
      setError('Impossible de charger les membres. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return;
    try {
      const response = await deleteMember(clubId, id);
      if (response.success) {
        setMembers(members.filter(member => member.id !== id));
        setSuccess('Membre supprimé avec succès');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la suppression du membre');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <h2 className="text-2xl font-bold text-gray-800">Nos membres</h2>
        <Link 
          to="#"
          onClick={e => { e.preventDefault(); document.querySelectorAll('button[role="tab"]')[0].click(); }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Nouveau membre
        </Link>
      </div>
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.length > 0 ? members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 group">
                    <td className="px-4 py-4 whitespace-nowrap font-semibold text-gray-900">{member.firstName} {member.lastName}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{member.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{member.phoneNumber || 'Non spécifié'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1 rounded font-semibold"
                          onClick={() => onEdit(member)}
                        >
                          Modifier
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded font-semibold"
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      Aucun membre n'a été ajouté à votre club
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManager; 