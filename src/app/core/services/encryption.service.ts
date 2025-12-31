import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

/**
 * Encryption Service
 * Provides client-side encryption for sensitive medical documents
 * Uses AES-256 symmetric encryption
 */
@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  /**
   * Encrypt a file using AES-256
   * @param file - File to encrypt
   * @param key - Encryption key (derived from user password or secure storage)
   * @returns Encrypted data as base64 string
   */
  async encryptFile(file: File, key: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
    const encrypted = CryptoJS.AES.encrypt(wordArray, key);
    return encrypted.toString();
  }

  /**
   * Decrypt file data
   * @param encryptedData - Encrypted base64 string
   * @param key - Decryption key
   * @returns Decrypted data as Blob
   */
  decryptFile(encryptedData: string, key: string, mimeType: string = 'application/pdf'): Blob {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const typedArray = this.convertWordArrayToUint8Array(decrypted);
    return new Blob([typedArray], { type: mimeType });
  }

  /**
   * Encrypt text data
   */
  encryptText(text: string, key: string): string {
    return CryptoJS.AES.encrypt(text, key).toString();
  }

  /**
   * Decrypt text data
   */
  decryptText(encryptedText: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Generate a secure key from user password
   * Uses PBKDF2 for key derivation
   */
  deriveKeyFromPassword(password: string, salt: string = 'arogya-vault-salt'): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
  }

  /**
   * Generate a random encryption key
   */
  generateRandomKey(): string {
    return CryptoJS.lib.WordArray.random(256 / 8).toString();
  }

  /**
   * Hash data (for integrity checks)
   */
  hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * Convert CryptoJS WordArray to Uint8Array
   */
  private convertWordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;
    const u8 = new Uint8Array(sigBytes);

    for (let i = 0; i < sigBytes; i++) {
      u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }

    return u8;
  }
}
