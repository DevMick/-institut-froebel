/**
 * Validation Utilities - Rotary Club Mobile
 * Fonctions de validation pour les formulaires
 */

/**
 * Valider un email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Valider un mot de passe
 * Minimum 8 caractères, au moins une majuscule, une minuscule et un chiffre
 */
export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Valider un numéro de téléphone
 * Format français ou international
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;
  const internationalRegex = /^\+[1-9]\d{1,14}$/;
  
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return phoneRegex.test(cleanPhone) || internationalRegex.test(cleanPhone);
};

/**
 * Valider un nom (prénom ou nom de famille)
 */
export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

/**
 * Valider une URL
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valider un code postal français
 */
export const validatePostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^[0-9]{5}$/;
  return postalCodeRegex.test(postalCode);
};

/**
 * Valider un numéro SIRET
 */
export const validateSiret = (siret: string): boolean => {
  const siretRegex = /^[0-9]{14}$/;
  return siretRegex.test(siret.replace(/\s/g, ''));
};

/**
 * Valider une date de naissance (âge minimum 16 ans)
 */
export const validateBirthDate = (date: Date): boolean => {
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    return age - 1 >= 16;
  }
  
  return age >= 16;
};

/**
 * Valider un montant (positif avec max 2 décimales)
 */
export const validateAmount = (amount: string): boolean => {
  const amountRegex = /^\d+(\.\d{1,2})?$/;
  const numAmount = parseFloat(amount);
  return amountRegex.test(amount) && numAmount > 0 && numAmount <= 999999.99;
};

/**
 * Valider un IBAN
 */
export const validateIban = (iban: string): boolean => {
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  return ibanRegex.test(cleanIban);
};

/**
 * Messages d'erreur de validation
 */
export const ValidationMessages = {
  EMAIL_INVALID: 'Format d\'email invalide',
  EMAIL_REQUIRED: 'L\'email est requis',
  PASSWORD_INVALID: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
  PASSWORD_REQUIRED: 'Le mot de passe est requis',
  PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas',
  PHONE_INVALID: 'Format de téléphone invalide',
  NAME_INVALID: 'Le nom doit contenir entre 2 et 50 caractères',
  NAME_REQUIRED: 'Le nom est requis',
  URL_INVALID: 'Format d\'URL invalide',
  POSTAL_CODE_INVALID: 'Code postal invalide (5 chiffres)',
  SIRET_INVALID: 'Numéro SIRET invalide (14 chiffres)',
  BIRTH_DATE_INVALID: 'Vous devez avoir au moins 16 ans',
  AMOUNT_INVALID: 'Montant invalide (maximum 999 999,99 €)',
  IBAN_INVALID: 'Format IBAN invalide',
  REQUIRED: 'Ce champ est requis',
  TOO_SHORT: 'Trop court',
  TOO_LONG: 'Trop long',
} as const;

/**
 * Fonction générique de validation avec message
 */
export const validate = (
  value: string,
  rules: Array<{
    validator: (value: string) => boolean;
    message: string;
  }>
): string | undefined => {
  for (const rule of rules) {
    if (!rule.validator(value)) {
      return rule.message;
    }
  }
  return undefined;
};

/**
 * Règles de validation prédéfinies
 */
export const ValidationRules = {
  required: (value: string) => value.trim().length > 0,
  email: validateEmail,
  password: validatePassword,
  phone: validatePhone,
  name: validateName,
  url: validateUrl,
  postalCode: validatePostalCode,
  siret: validateSiret,
  amount: validateAmount,
  iban: validateIban,
  minLength: (min: number) => (value: string) => value.length >= min,
  maxLength: (max: number) => (value: string) => value.length <= max,
  pattern: (regex: RegExp) => (value: string) => regex.test(value),
} as const;

/**
 * Validateur de formulaire complet
 */
export class FormValidator {
  private rules: Record<string, Array<{
    validator: (value: any) => boolean;
    message: string;
  }>> = {};

  addRule(
    field: string,
    validator: (value: any) => boolean,
    message: string
  ): FormValidator {
    if (!this.rules[field]) {
      this.rules[field] = [];
    }
    this.rules[field].push({ validator, message });
    return this;
  }

  validate(data: Record<string, any>): Record<string, string> {
    const errors: Record<string, string> = {};

    Object.keys(this.rules).forEach(field => {
      const value = data[field];
      const fieldRules = this.rules[field];

      for (const rule of fieldRules) {
        if (!rule.validator(value)) {
          errors[field] = rule.message;
          break; // Premier erreur seulement
        }
      }
    });

    return errors;
  }

  isValid(data: Record<string, any>): boolean {
    return Object.keys(this.validate(data)).length === 0;
  }
}

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateUrl,
  validatePostalCode,
  validateSiret,
  validateBirthDate,
  validateAmount,
  validateIban,
  ValidationMessages,
  ValidationRules,
  FormValidator,
  validate,
};
