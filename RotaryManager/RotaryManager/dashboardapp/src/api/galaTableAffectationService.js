import axiosInstance from './axiosConfig';

export const getAffectationsByGala = async (galaId) => {
  const response = await axiosInstance.get(`/api/gala-table-affectations/gala/${galaId}`);
  return response.data;
};

export const getAffectationsByTable = async (tableId) => {
  const response = await axiosInstance.get(`/api/gala-table-affectations/table/${tableId}`);
  return response.data;
};

export const getAffectation = async (id) => {
  const response = await axiosInstance.get(`/api/gala-table-affectations/${id}`);
  return response.data;
};

export const createAffectation = async (affectationData) => {
  // attend { GalaTableId, GalaInvitesId }
  const response = await axiosInstance.post(`/api/gala-table-affectations`, affectationData);
  return response.data;
};

export const updateAffectation = async (id, affectationData) => {
  // attend { GalaTableId? }
  const response = await axiosInstance.put(`/api/gala-table-affectations/${id}`, affectationData);
  return response.data;
};

export const deleteAffectation = async (id) => {
  const response = await axiosInstance.delete(`/api/gala-table-affectations/${id}`);
  return response.data;
};

export const bulkCreateAffectations = async (affectations) => {
  // attend { Affectations: [ { GalaTableId, GalaInvitesId }, ... ] }
  const response = await axiosInstance.post(`/api/gala-table-affectations/bulk-create`, { Affectations: affectations });
  return response.data;
};

export const repartitionAutomatique = async (galaId) => {
  const response = await axiosInstance.post(`/api/gala-table-affectations/gala/${galaId}/repartition-automatique`);
  return response.data;
}; 