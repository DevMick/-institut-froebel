/**
 * QR Service - Rotary Club Mobile
 * Service QR avec génération sécurisée, validation et anti-spoofing
 */

import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface QRData {
  version: string;
  type: 'rotary_presence' | 'rotary_event' | 'rotary_member';
  reunionId: string;
  clubId: string;
  timestamp: string; // ISO string
  expiry: string; // ISO string
  checksum: string;
  metadata: {
    reunionTitle?: string;
    location?: string;
    organizerId?: string;
    maxParticipants?: number;
  };
}

export interface QRValidationResult {
  valid: boolean;
  data?: QRData;
  error?: string;
  warnings?: string[];
}

export interface QRGenerationOptions {
  reunionId: string;
  clubId: string;
  reunionTitle: string;
  location: string;
  organizerId: string;
  validityMinutes?: number; // Défaut: 120 minutes
  maxParticipants?: number;
}

// Constants
const QR_VERSION = '1.0';
const DEFAULT_VALIDITY_MINUTES = 120; // 2 heures
const SECRET_KEY = 'rotary_qr_secret_2024'; // TODO: Utiliser une clé sécurisée depuis l'environnement
const STORAGE_KEYS = {
  QR_HISTORY: 'qr_history',
  QR_CACHE: 'qr_cache',
} as const;

class QRService {
  /**
   * Générer les données QR sécurisées
   */
  generateQRData(options: QRGenerationOptions): QRData {
    const now = new Date();
    const expiry = new Date(now.getTime() + (options.validityMinutes || DEFAULT_VALIDITY_MINUTES) * 60 * 1000);
    
    const baseData = {
      version: QR_VERSION,
      type: 'rotary_presence' as const,
      reunionId: options.reunionId,
      clubId: options.clubId,
      timestamp: now.toISOString(),
      expiry: expiry.toISOString(),
      metadata: {
        reunionTitle: options.reunionTitle,
        location: options.location,
        organizerId: options.organizerId,
        maxParticipants: options.maxParticipants,
      },
    };

    // Générer le checksum pour l'intégrité
    const checksum = this.generateChecksum(baseData);
    
    const qrData: QRData = {
      ...baseData,
      checksum,
    };

    // Sauvegarder dans l'historique
    this.saveToHistory(qrData, 'generated');

    return qrData;
  }

  /**
   * Valider les données QR
   */
  validateQRData(qrString: string): QRValidationResult {
    try {
      const data: QRData = JSON.parse(qrString);
      const warnings: string[] = [];

      // Vérification de la structure
      if (!this.isValidQRStructure(data)) {
        return {
          valid: false,
          error: 'Structure QR invalide',
        };
      }

      // Vérification de la version
      if (data.version !== QR_VERSION) {
        warnings.push(`Version QR non supportée: ${data.version}`);
      }

      // Vérification du type
      if (data.type !== 'rotary_presence') {
        return {
          valid: false,
          error: `Type QR non supporté: ${data.type}`,
        };
      }

      // Vérification de l'expiration
      const now = new Date();
      const expiry = new Date(data.expiry);
      if (now > expiry) {
        return {
          valid: false,
          error: 'QR Code expiré',
        };
      }

      // Vérification du timestamp (pas trop ancien)
      const timestamp = new Date(data.timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures
      if (now.getTime() - timestamp.getTime() > maxAge) {
        warnings.push('QR Code généré il y a plus de 24 heures');
      }

      // Vérification du checksum (anti-spoofing)
      const expectedChecksum = this.generateChecksum({
        version: data.version,
        type: data.type,
        reunionId: data.reunionId,
        clubId: data.clubId,
        timestamp: data.timestamp,
        expiry: data.expiry,
        metadata: data.metadata,
      });

      if (data.checksum !== expectedChecksum) {
        return {
          valid: false,
          error: 'QR Code corrompu ou falsifié',
        };
      }

      // Vérification anti-replay (éviter la réutilisation)
      if (this.isReplayAttack(data)) {
        return {
          valid: false,
          error: 'QR Code déjà utilisé récemment',
        };
      }

      // Sauvegarder dans l'historique
      this.saveToHistory(data, 'scanned');

      return {
        valid: true,
        data,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Format QR invalide',
      };
    }
  }

  /**
   * Chiffrer le payload QR (optionnel pour données sensibles)
   */
  encryptQRPayload(data: QRData): string {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Error encrypting QR payload:', error);
      throw new Error('Échec du chiffrement QR');
    }
  }

  /**
   * Déchiffrer le payload QR
   */
  decryptQRPayload(encryptedData: string): QRData {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error decrypting QR payload:', error);
      throw new Error('Échec du déchiffrement QR');
    }
  }

  /**
   * Parser un QR Code scanné
   */
  parseQRCode(qrString: string): QRValidationResult {
    // Essayer d'abord le format non chiffré
    let result = this.validateQRData(qrString);
    
    if (!result.valid) {
      // Essayer le format chiffré
      try {
        const decryptedData = this.decryptQRPayload(qrString);
        result = this.validateQRData(JSON.stringify(decryptedData));
      } catch (error) {
        // Garder l'erreur originale
      }
    }

    return result;
  }

  /**
   * Générer le checksum pour l'intégrité
   */
  private generateChecksum(data: Omit<QRData, 'checksum'>): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return CryptoJS.SHA256(dataString + SECRET_KEY).toString();
  }

  /**
   * Vérifier la structure QR
   */
  private isValidQRStructure(data: any): data is QRData {
    return (
      typeof data === 'object' &&
      typeof data.version === 'string' &&
      typeof data.type === 'string' &&
      typeof data.reunionId === 'string' &&
      typeof data.clubId === 'string' &&
      typeof data.timestamp === 'string' &&
      typeof data.expiry === 'string' &&
      typeof data.checksum === 'string' &&
      typeof data.metadata === 'object'
    );
  }

  /**
   * Détecter les attaques de replay
   */
  private isReplayAttack(data: QRData): boolean {
    // TODO: Implémenter la vérification anti-replay
    // Vérifier si ce QR a été utilisé récemment par le même utilisateur
    return false;
  }

  /**
   * Sauvegarder dans l'historique
   */
  private async saveToHistory(data: QRData, action: 'generated' | 'scanned'): Promise<void> {
    try {
      const historyItem = {
        id: `${action}_${Date.now()}`,
        action,
        data,
        timestamp: new Date().toISOString(),
      };

      const existingHistory = await AsyncStorage.getItem(STORAGE_KEYS.QR_HISTORY);
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      history.unshift(historyItem);
      
      // Limiter à 100 entrées
      if (history.length > 100) {
        history.splice(100);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.QR_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving QR history:', error);
    }
  }

  /**
   * Récupérer l'historique QR
   */
  async getQRHistory(): Promise<any[]> {
    try {
      const historyString = await AsyncStorage.getItem(STORAGE_KEYS.QR_HISTORY);
      return historyString ? JSON.parse(historyString) : [];
    } catch (error) {
      console.error('Error getting QR history:', error);
      return [];
    }
  }

  /**
   * Nettoyer l'historique expiré
   */
  async cleanupExpiredHistory(): Promise<void> {
    try {
      const history = await this.getQRHistory();
      const now = new Date();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours

      const filteredHistory = history.filter(item => {
        const itemDate = new Date(item.timestamp);
        return now.getTime() - itemDate.getTime() < maxAge;
      });

      await AsyncStorage.setItem(STORAGE_KEYS.QR_HISTORY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Error cleaning up QR history:', error);
    }
  }

  /**
   * Valider les permissions de scan
   */
  async validateScanPermissions(userId: string, qrData: QRData): Promise<boolean> {
    try {
      // TODO: Vérifier si l'utilisateur a le droit de scanner ce QR
      // - Membre du club
      // - Invité autorisé
      // - Organisateur
      return true;
    } catch (error) {
      console.error('Error validating scan permissions:', error);
      return false;
    }
  }

  /**
   * Générer un QR Code de test
   */
  generateTestQR(): QRData {
    return this.generateQRData({
      reunionId: 'test-reunion-' + Date.now(),
      clubId: 'test-club-001',
      reunionTitle: 'Réunion de test',
      location: 'Salle de test',
      organizerId: 'test-organizer',
      validityMinutes: 30,
      maxParticipants: 50,
    });
  }

  /**
   * Obtenir les statistiques QR
   */
  async getQRStats(): Promise<{
    totalGenerated: number;
    totalScanned: number;
    successRate: number;
    recentActivity: any[];
  }> {
    try {
      const history = await this.getQRHistory();
      const generated = history.filter(item => item.action === 'generated');
      const scanned = history.filter(item => item.action === 'scanned');
      
      const last7Days = history.filter(item => {
        const itemDate = new Date(item.timestamp);
        const now = new Date();
        return now.getTime() - itemDate.getTime() < 7 * 24 * 60 * 60 * 1000;
      });

      return {
        totalGenerated: generated.length,
        totalScanned: scanned.length,
        successRate: generated.length > 0 ? (scanned.length / generated.length) * 100 : 0,
        recentActivity: last7Days.slice(0, 10),
      };
    } catch (error) {
      console.error('Error getting QR stats:', error);
      return {
        totalGenerated: 0,
        totalScanned: 0,
        successRate: 0,
        recentActivity: [],
      };
    }
  }
}

// Instance singleton
export const qrService = new QRService();

export default qrService;
