export const validateEmail = (email) =>
  /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

export const validatePhone = (phone) =>
  /^\+?\d{8,20}$/.test(phone.replace(/\s/g, ''));

export const isRequired = (value) => value && value.trim() !== ''; 