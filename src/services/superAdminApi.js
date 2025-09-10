import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || (
  process.env.NODE_ENV === 'production'
    ? '/api'  // Utilise le proxy en production
    : 'https://mon-api-aspnet.onrender.com/api' // Fallback pour le développement
);

// Créer une instance axios avec configuration d'authentification
const createAuthenticatedApi = (token) => {
  return axios.create({
    baseURL: API_BASE,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });
};

// Fonction helper pour obtenir le token depuis localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Écoles
export const fetchSchools = (params) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/ecoles', { params });
};

export const fetchSchoolDetails = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${id}`);
};

export const fetchSchoolStats = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${id}/statistiques`);
};

export const exportSchoolsExcel = () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/ecoles/export-excel', { responseType: 'blob' });
};

// Utilisateurs
export const fetchUsers = (params) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/users', { params });
};

export const fetchUserDetails = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/users/${id}`);
};

export const createUser = (data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.post('/users', data);
};

export const updateUser = (id, data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.put(`/users/${id}`, data);
};

export const deleteUser = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.delete(`/users/${id}`);
};

export const exportUsersExcel = () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/users/export-excel', { responseType: 'blob' });
};

// Classes
export const fetchClasses = (params) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/classes', { params });
};

export const fetchClassDetails = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/classes/${id}`);
};

export const createClass = (data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.post('/classes', data);
};

export const updateClass = (id, data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.put(`/classes/${id}`, data);
};

export const deleteClass = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.delete(`/classes/${id}`);
};

export const exportClassesExcel = () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/classes/export-excel', { responseType: 'blob' });
};

// Élèves
export const fetchStudents = (params) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/enfants', { params });
};

export const fetchStudentDetails = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/enfants/${id}`);
};

export const createStudent = (data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.post('/enfants', data);
};

export const updateStudent = (id, data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.put(`/enfants/${id}`, data);
};

export const deleteStudent = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.delete(`/enfants/${id}`);
};

export const exportStudentsExcel = () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/enfants/export-excel', { responseType: 'blob' });
};

// Pédagogie - Bulletins
export const fetchBulletins = (params) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/bulletins', { params });
};

export const fetchBulletinDetails = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/bulletins/${id}`);
};

export const createBulletin = (data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.post('/bulletins', data);
};

export const updateBulletin = (id, data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.put(`/bulletins/${id}`, data);
};

export const deleteBulletin = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.delete(`/bulletins/${id}`);
};

export const exportBulletinsExcel = () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/bulletins/export-excel', { responseType: 'blob' });
};

// Pédagogie - Emplois du temps
export const fetchEmplois = (params) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/emplois', { params });
};

export const fetchEmploiDetails = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/emplois/${id}`);
};

export const createEmploi = (data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.post('/emplois', data);
};

export const updateEmploi = (id, data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.put(`/emplois/${id}`, data);
};

export const deleteEmploi = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.delete(`/emplois/${id}`);
};

export const exportEmploisExcel = () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/emplois/export-excel', { responseType: 'blob' });
};

// Pédagogie - Cahiers de liaison
export const fetchCahiers = (params) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/cahier-liaison', { params });
};

export const fetchCahierDetails = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/cahier-liaison/${id}`);
};

export const createCahier = (data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.post('/cahier-liaison', data);
};

export const updateCahier = (id, data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.put(`/cahier-liaison/${id}`, data);
};

export const deleteCahier = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.delete(`/cahier-liaison/${id}`);
};

export const exportCahiersExcel = () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/cahier-liaison/export-excel', { responseType: 'blob' });
};

// Communication - Annonces
export const fetchAnnonces = (params) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/annonces', { params });
};

export const fetchAnnonceDetails = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/annonces/${id}`);
};

export const createAnnonce = (data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.post('/annonces', data);
};

export const updateAnnonce = (id, data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.put(`/annonces/${id}`, data);
};

export const deleteAnnonce = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.delete(`/annonces/${id}`);
};

export const exportAnnoncesExcel = () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/annonces/export-excel', { responseType: 'blob' });
};

// Communication - Messages
export const fetchMessages = (params) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/messages', { params });
};

export const fetchMessageDetails = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/messages/${id}`);
};

export const createMessage = (data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.post('/messages', data);
};

export const updateMessage = (id, data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.put(`/messages/${id}`, data);
};

export const deleteMessage = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.delete(`/messages/${id}`);
};

export const exportMessagesExcel = () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/messages/export-excel', { responseType: 'blob' });
};

// Communication - Notifications
export const fetchNotifications = (params) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/notifications', { params });
};

export const fetchNotificationDetails = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/notifications/${id}`);
};

export const createNotification = (data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.post('/notifications', data);
};

export const updateNotification = (id, data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.put(`/notifications/${id}`, data);
};

export const deleteNotification = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.delete(`/notifications/${id}`);
};

export const exportNotificationsExcel = () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/notifications/export-excel', { responseType: 'blob' });
};

// Activités
export const fetchActivities = (params) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/activites', { params });
};

export const fetchActivityDetails = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/activites/${id}`);
};

export const createActivity = (data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.post('/activites', data);
};

export const updateActivity = (id, data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.put(`/activites/${id}`, data);
};

export const deleteActivity = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.delete(`/activites/${id}`);
};

export const exportActivitiesExcel = () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/activites/export-excel', { responseType: 'blob' });
};

// Finances - Paiements
export const fetchPayments = (params) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/paiements', { params });
};

export const fetchPaymentDetails = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/paiements/${id}`);
};

export const createPayment = (data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.post('/paiements', data);
};

export const updatePayment = (id, data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.put(`/paiements/${id}`, data);
};

export const deletePayment = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.delete(`/paiements/${id}`);
};

export const exportPaymentsExcel = () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/paiements/export-excel', { responseType: 'blob' });
};

// Finances - Factures (Invoices)
export const fetchInvoices = (params) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/factures', { params });
};

export const fetchInvoiceDetails = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/factures/${id}`);
};

export const createInvoice = (data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.post('/factures', data);
};

export const updateInvoice = (id, data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.put(`/factures/${id}`, data);
};

export const deleteInvoice = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.delete(`/factures/${id}`);
};

export const exportInvoicesExcel = () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/factures/export-excel', { responseType: 'blob' });
};

// Finances - Rapports financiers
export const fetchFinancialReports = (params) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/rapports-financiers', { params });
};

export const fetchReportDetails = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/rapports-financiers/${id}`);
};

export const createReport = (data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.post('/rapports-financiers', data);
};

export const updateReport = (id, data) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.put(`/rapports-financiers/${id}`, data);
};

export const deleteReport = (id) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.delete(`/rapports-financiers/${id}`);
};

export const exportReportsExcel = () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get('/rapports-financiers/export-excel', { responseType: 'blob' });
};

// Legacy functions for backward compatibility
export const fetchClassSchedules = (ecoleId, classId) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/classes/${classId}/emplois`);
};

export const downloadSchedule = (ecoleId, classId, emploiId) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/classes/${classId}/emplois/${emploiId}/telecharger`, { responseType: 'blob' });
};

export const fetchStudentBulletins = (ecoleId, studentId) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/enfants/${studentId}/bulletins`);
};

export const downloadBulletin = (ecoleId, studentId, bulletinId) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/enfants/${studentId}/bulletins/${bulletinId}/telecharger`, { responseType: 'blob' });
};

export const fetchStudentLiaison = (ecoleId, studentId) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/enfants/${studentId}/cahier-liaison`);
};

export const fetchAnnouncements = (ecoleId, params) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/annonces`, { params });
};

export const fetchAnnouncementDetails = (ecoleId, annonceId) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/annonces/${annonceId}`);
};

export const fetchAnnouncementStats = (ecoleId) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/annonces/statistiques`);
};

export const fetchAnnouncementTypes = (ecoleId) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/annonces/types`);
};

export const fetchActivitiesCalendar = (ecoleId) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/activites/calendrier`);
};

export const fetchNextActivities = (ecoleId) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/activites/prochaines`);
};

export const fetchActivitiesStats = (ecoleId) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/activites/statistiques`);
};

export const fetchPaymentsStats = (ecoleId) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/paiements/statistiques`);
};

export const fetchPaymentTypes = (ecoleId) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/paiements/types`);
};

export const fetchPaymentModes = (ecoleId) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/paiements/modes`);
};

export const fetchPaymentStatuses = (ecoleId) => {
  const token = getToken();
  const api = createAuthenticatedApi(token);
  return api.get(`/ecoles/${ecoleId}/paiements/statuts`);
};

// Dashboard - Récupérer les statistiques générales
export const fetchDashboardStats = async () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);

  try {
    console.log('Récupération des statistiques du dashboard...');

    // Récupérer les données en parallèle
    const [
      personnelResponse,
      classesResponse,
      studentsResponse,
      preInscriptionsResponse
    ] = await Promise.allSettled([
      api.get('/users', { params: { page: 1, pageSize: 1000 } }),
      api.get('/classes', { params: { page: 1, pageSize: 1000 } }),
      api.get('/enfants', { params: { page: 1, pageSize: 1000 } }),
      api.get('/pre-inscriptions', { params: { page: 1, pageSize: 1000 } })
    ]);

    // Traiter les résultats
    const personnel = personnelResponse.status === 'fulfilled' ?
      (personnelResponse.value.data.items || personnelResponse.value.data || []) : [];

    const classes = classesResponse.status === 'fulfilled' ?
      (classesResponse.value.data.items || classesResponse.value.data || []) : [];

    const students = studentsResponse.status === 'fulfilled' ?
      (studentsResponse.value.data.items || studentsResponse.value.data || []) : [];

    const preInscriptions = preInscriptionsResponse.status === 'fulfilled' ?
      (preInscriptionsResponse.value.data.items || preInscriptionsResponse.value.data || []) : [];

    // Calculer les statistiques
    const stats = {
      totalEleves: Array.isArray(students) ? students.length : 0,
      totalPersonnel: Array.isArray(personnel) ? personnel.filter(p => p.role !== 'Parent').length : 0,
      totalClasses: Array.isArray(classes) ? classes.length : 0,
      totalPreInscriptions: Array.isArray(preInscriptions) ? preInscriptions.length : 0,
      preInscriptionsEnAttente: Array.isArray(preInscriptions) ?
        preInscriptions.filter(p => p.statut === 'En attente' || p.status === 'pending').length : 0
    };

    console.log('Statistiques calculées:', stats);
    return { success: true, data: stats };

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return {
      success: false,
      error: error.message,
      data: {
        totalEleves: 0,
        totalPersonnel: 0,
        totalClasses: 0,
        totalPreInscriptions: 0,
        preInscriptionsEnAttente: 0
      }
    };
  }
};

// Dashboard - Récupérer les communications récentes
export const fetchRecentCommunications = async () => {
  const token = getToken();
  const api = createAuthenticatedApi(token);

  try {
    console.log('Récupération des communications récentes...');

    // Récupérer les annonces et messages du cahier de liaison
    const [
      recentAnnouncements,
      recentCahierMessages
    ] = await Promise.allSettled([
      api.get('/ecoles/2/annonces', { params: { page: 1, pageSize: 3 } }),
      api.get('/ecoles/2/cahier-liaison', { params: { page: 1, pageSize: 3 } })
    ]);

    const communications = [];

    // Ajouter les annonces récentes
    if (recentAnnouncements.status === 'fulfilled') {
      const announcements = recentAnnouncements.value.data || [];
      announcements.forEach(announcement => {
        communications.push({
          id: `announcement-${announcement.id}`,
          type: 'annonce',
          title: announcement.titre,
          description: announcement.contenu?.substring(0, 80) + (announcement.contenu?.length > 80 ? '...' : ''),
          date: announcement.datePublication || announcement.createdAt,
          author: announcement.createdByNom || 'Administration',
          typeLabel: announcement.type || 'information'
        });
      });
    }

    // Ajouter les messages du cahier de liaison récents
    if (recentCahierMessages.status === 'fulfilled') {
      const messages = recentCahierMessages.value.data.items || recentCahierMessages.value.data || [];
      messages.forEach(message => {
        communications.push({
          id: `cahier-${message.id}`,
          type: 'cahier',
          title: `Message: ${message.objet || 'Sans objet'}`,
          description: message.contenu?.substring(0, 80) + (message.contenu?.length > 80 ? '...' : ''),
          date: message.dateEnvoi || message.createdAt,
          author: message.expediteurNom || 'Expéditeur',
          typeLabel: 'cahier de liaison'
        });
      });
    }

    // Trier par date (plus récent en premier) et limiter à 2
    communications.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentCommunications = communications.slice(0, 2);

    console.log('Communications récentes récupérées:', recentCommunications);
    return { success: true, data: recentCommunications };

  } catch (error) {
    console.error('Erreur lors de la récupération des communications récentes:', error);
    return { success: false, error: error.message, data: [] };
  }
};