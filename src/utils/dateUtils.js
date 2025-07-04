import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return moment(dateStr).format('DD MMMM YYYY');
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return moment(dateStr).format('DD MMM YYYY à HH:mm');
};

export const formatMonth = (dateStr) => {
  if (!dateStr) return '';
  return moment(dateStr).format('MMMM YYYY');
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return moment(dateStr).format('HH:mm');
}; 