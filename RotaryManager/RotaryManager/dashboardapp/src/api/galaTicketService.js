import axiosInstance from './axiosConfig';

const galaTicketService = {
  // Récupérer tous les tickets d'un gala
  getTicketsByGala: async (galaId, recherche = null) => {
    try {
      console.log('Fetching tickets for gala:', galaId);
      const response = await axiosInstance.get(`/api/gala-tickets/gala/${galaId}`, {
        params: { recherche }
      });
      console.log('Tickets response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  },

  // Récupérer tous les tickets d'un membre
  getTicketsByMembre: async (membreId) => {
    try {
      const response = await axiosInstance.get(`/api/gala-tickets/membre/${membreId}`);
      return response;
    } catch (error) {
      console.error('Error fetching member tickets:', error);
      throw error;
    }
  },

  // Récupérer un ticket spécifique
  getTicket: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/gala-tickets/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },

  // Créer un nouveau ticket
  createTicket: async (ticketData) => {
    try {
      const response = await axiosInstance.post(`/api/gala-tickets`, ticketData);
      return response;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  // Mettre à jour un ticket
  updateTicket: async (id, ticketData) => {
    try {
      const response = await axiosInstance.put(`/api/gala-tickets/${id}`, ticketData);
      return response;
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  },

  // Supprimer un ticket
  deleteTicket: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/gala-tickets/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  },

  // Récupérer les statistiques des tickets d'un gala
  getStatistiquesTicketsByGala: async (galaId) => {
    try {
      const response = await axiosInstance.get(`/api/gala-tickets/gala/${galaId}/statistiques`);
      return response;
    } catch (error) {
      console.error('Error fetching ticket statistics:', error);
      throw error;
    }
  },

  // Récupérer les top vendeurs d'un gala
  getTopVendeurs: async (galaId, limit = 10) => {
    try {
      const response = await axiosInstance.get(`/api/gala-tickets/gala/${galaId}/top-vendeurs`, {
        params: { limit }
      });
      return response;
    } catch (error) {
      console.error('Error fetching top sellers:', error);
      throw error;
    }
  },

  // Créer plusieurs tickets en masse
  createBulkTickets: async (ticketsData) => {
    try {
      const response = await axiosInstance.post(`/api/gala-tickets/bulk-create`, ticketsData);
      return response;
    } catch (error) {
      console.error('Error creating bulk tickets:', error);
      throw error;
    }
  }
};

export default galaTicketService; 