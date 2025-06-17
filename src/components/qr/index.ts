/**
 * QR Components - Rotary Club Mobile
 * Export des composants QR Code
 */

export { QRScanner } from './QRScanner';
export { QRGenerator } from './QRGenerator';

export default {
  QRScanner: require('./QRScanner').QRScanner,
  QRGenerator: require('./QRGenerator').QRGenerator,
};
