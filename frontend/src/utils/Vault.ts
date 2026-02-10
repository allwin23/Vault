/**
 * SECURITY-CRITICAL: Client-side vault for encrypted token storage
 * 
 * This vault implements the identity layer of the application:
 * - Receives tokens from backend after PII detection
 * - Stores encrypted token→value mappings
 * - Acts as privacy boundary between tokenized content and actual values
 * - Never exposes mappings or allows raw token access
 * 
 * Encryption: AES-256-GCM
 * Key Derivation: PBKDF2 (SHA-256, >=100k iterations)
 * Storage: IndexedDB (encrypted at rest)
 * Memory: Decrypted values cached in-memory only
 * 
 * Future: LLMs, chat, documents operate on tokenized data.
 * Vault rehydrates identity only when rendering.
 */

import { VaultStats } from './types';

interface EncryptedToken {
  ciphertext: Uint8Array;
  iv: Uint8Array;
  authTag: Uint8Array;
}

export class Vault {
  // SECURITY: Private fields - never expose these
  private cryptoKey: CryptoKey | null = null;
  private cache: Map<string, string> = new Map();
  private sessionId: string = '';
  private dbName: string = 'VaultSim-Vault';
  private storeName: string = 'tokens';
  private ready: boolean = false;
  private listeners: (() => void)[] = [];

  // PBKDF2 parameters - non-negotiable for security
  private readonly PBKDF2_ITERATIONS = 100_000;
  private readonly PBKDF2_HASH = 'SHA-256';

  // AES-GCM parameters
  private readonly GCM_TAG_LENGTH = 128; // bits
  private readonly GCM_IV_SIZE = 12; // bytes (96 bits recommended for GCM)

  /**
   * Initialize vault with session credentials
   * Derives encryption key from sessionId + challenge
   * Opens IndexedDB for persistent storage
   * 
   * @param sessionId - Server-provided session identifier
   * @param challenge - Cryptographic challenge from server
   * @throws Error if initialization fails
   */
  async initialize(sessionId: string, challenge: string): Promise<void> {
    if (this.ready) {
      console.warn('[Vault] Already initialized, skipping re-initialization');
      return;
    }

    if (!sessionId || !challenge) {
      throw new Error('[Vault] Session ID and challenge required for initialization');
    }

    this.sessionId = sessionId;

    try {
      // SECURITY: Derive encryption key from session credentials
      this.cryptoKey = await this.deriveKey(sessionId, challenge);

      // SECURITY: Initialize encrypted IndexedDB storage
      await this.initializeDatabase();

      this.ready = true;
      console.log('[Vault] Initialization complete - vault ready');
      this.notifyListeners();
    } catch (error) {
      this.ready = false;
      throw new Error(`[Vault] Initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Add listener for readiness changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Derive AES-256 encryption key using PBKDF2
   * 
   * SECURITY CRITICAL:
   * - Uses PBKDF2 with SHA-256 and 100k iterations
   * - Key never exported/extractable
   * - Derived from sessionId + challenge
   */
  private async deriveKey(sessionId: string, challenge: string): Promise<CryptoKey> {
    try {
      const encoder = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(challenge),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      // SECURITY: Salt = sessionId + challenge as requirement
      const salt = encoder.encode(sessionId + challenge);

      return await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          hash: this.PBKDF2_HASH,
          salt: salt,
          iterations: this.PBKDF2_ITERATIONS,
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false, // NOT extractable
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      throw new Error(`[Vault] Key derivation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Initialize IndexedDB for encrypted token storage
   * SECURITY: Verifies database is created before proceeding
   */
  private initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(new Error('IndexedDB open failed'));
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          reject(new Error('IndexedDB object store not ready'));
        }
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'token' });
        }
      };
    });
  }

  /**
   * Store multiple tokens from API response in one operation
   * Automatically encrypts each value before storage
   * 
   * SECURITY: This is the critical ingestion point for tokens
   * Frontend MUST call this immediately after receiving tokens from API,
   * before rendering ANY text containing those tokens.
   * 
   * @param tokenMap - Object with token identifiers as keys, values as plaintext
   */
  async storeFromTokenMap(tokenMap: Record<string, string>): Promise<void> {
    if (!this.ready || !this.cryptoKey) {
      throw new Error('[Vault] Vault not ready - initialize first');
    }

    try {
      const tokens = Object.entries(tokenMap);
      for (const [token, value] of tokens) {
        await this.store(token, value);
      }
      console.log(`[Vault] Stored ${tokens.length} tokens from API response`);
    } catch (error) {
      throw new Error(`[Vault] Token map storage failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Encrypt and store a single token value
   * 
   * SECURITY: 
   * - Generates random IV for each value
   * - Uses AES-256-GCM for authenticated encryption
   * - Stores only ciphertext + IV + auth tag (no plaintext)
   * - Caches decrypted value in memory only
   * 
   * @param token - Token identifier (e.g., TOKEN_xxxxx)
   * @param value - Plain value to encrypt and store
   */
  async store(token: string, value: string): Promise<void> {
    if (!this.ready || !this.cryptoKey) {
      throw new Error('[Vault] Vault not ready - initialize first');
    }

    try {
      // Validate token format
      if (!this.isValidTokenFormat(token)) {
        throw new Error(`Invalid token format: ${token}`);
      }

      // SECURITY: Generate random IV for each encryption
      const iv = window.crypto.getRandomValues(new Uint8Array(this.GCM_IV_SIZE));

      // SECURITY: Encrypt using AES-256-GCM
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        this.cryptoKey,
        new TextEncoder().encode(value)
      );

      // SECURITY: Extract auth tag from GCM result
      const encryptedData = new Uint8Array(encrypted);
      const authTagStart = encryptedData.length - (this.GCM_TAG_LENGTH / 8);
      const ciphertext = encryptedData.slice(0, authTagStart);
      const authTag = encryptedData.slice(authTagStart);

      // SECURITY: Store encrypted representation
      const encryptedToken: EncryptedToken = {
        ciphertext,
        iv,
        authTag,
      };

      // SECURITY: Store in IndexedDB (at rest)
      await this.storeToIndexedDB(token, encryptedToken);

      // SECURITY: Cache decrypted value in memory (for performance)
      this.cache.set(token, value);
    } catch (error) {
      throw new Error(`[Vault] Token storage failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Retrieve decrypted token value from vault
   * 
   * SECURITY:
   * - Checks cache first (memory-only decrypted values)
   * - Falls back to IndexedDB + decryption on cache miss
   * - Returns only the value, never the full mapping
   * - Validates token exists before accessing
   * 
   * @param token - Token identifier to retrieve
   * @returns Decrypted value, or null if token not found
   */
  async retrieve(token: string): Promise<string | null> {
    if (!this.ready || !this.cryptoKey) {
      throw new Error('[Vault] Vault not ready - initialize first');
    }

    try {
      // SECURITY: Check cache first (memory-only decrypted values)
      if (this.cache.has(token)) {
        return this.cache.get(token) || null;
      }

      // SECURITY: Validate token exists in vault
      if (!await this.hasToken(token)) {
        return null;
      }

      // SECURITY: Retrieve encrypted representation from IndexedDB
      const encryptedToken = await this.retrieveFromIndexedDB(token);
      if (!encryptedToken) return null;

      // SECURITY: Decrypt using stored IV and auth tag
      const decrypted = await this.decryptToken(encryptedToken);

      // SECURITY: Cache result for performance
      this.cache.set(token, decrypted);

      return decrypted;
    } catch (error) {
      console.error(`[Vault] Token retrieval failed for ${token}`);
      return null;
    }
  }

  /**
   * Retrieve multiple token values in batch
   * More efficient than calling retrieve() multiple times
   * 
   * @param tokens - Array of token identifiers
   * @returns Object mapping tokens to decrypted values (null for missing)
   */
  async retrieveBatch(tokens: string[]): Promise<Record<string, string | null>> {
    const results: Record<string, string | null> = {};

    // SECURITY: Retrieve in sequence (not parallel) to avoid timing attacks
    for (const token of tokens) {
      results[token] = await this.retrieve(token);
    }

    return results;
  }

  /**
   * Check if token exists in vault (without decrypting)
   * 
   * @param token - Token identifier to check
   * @returns True if token is stored
   */
  async hasToken(token: string): Promise<boolean> {
    if (!this.ready) return false;

    try {
      return await this.checkTokenInIndexedDB(token);
    } catch {
      return false;
    }
  }

  /**
   * Decrypt token data using stored encryption parameters
   * 
   * SECURITY: This is where ciphertext becomes plaintext in memory
   * Value exists only for the duration of this operation
   * Caller must handle carefully (don't log, don't expose)
   */
  private async decryptToken(encrypted: EncryptedToken): Promise<string> {
    if (!this.cryptoKey) {
      throw new Error('[Vault] CryptoKey not available');
    }

    // SECURITY: Reconstruct full ciphertext with auth tag for GCM
    const ciphertextArray = new Uint8Array(
      encrypted.ciphertext.length + encrypted.authTag.length
    );
    ciphertextArray.set(encrypted.ciphertext, 0);
    ciphertextArray.set(encrypted.authTag, encrypted.ciphertext.length);

    // Convert to ArrayBuffer for Web Crypto API
    const fullCiphertext = ciphertextArray.buffer.slice(
      ciphertextArray.byteOffset,
      ciphertextArray.byteOffset + ciphertextArray.byteLength
    );

    try {
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: encrypted.iv.buffer.slice(encrypted.iv.byteOffset, encrypted.iv.byteOffset + encrypted.iv.byteLength) as unknown as ArrayBuffer },
        this.cryptoKey,
        fullCiphertext
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      throw new Error(`[Vault] Decryption failed - auth tag verification failed or corrupted data`);
    }
  }

  /**
   * Get vault statistics (safe to expose)
   * SECURITY: Never includes actual values or mappings
   */
  async getStats(): Promise<VaultStats> {
    const tokenCount = await this.getTokenCount();
    const estimatedSize = tokenCount * 256; // Rough estimate: 256 bytes per encrypted token

    return {
      tokenCount,
      sessionId: this.sessionId,
      cacheSize: this.cache.size,
      encryptedSize: this.formatBytes(estimatedSize),
      isReady: this.ready,
    };
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Securely wipe all vault data
   * 
   * SECURITY CRITICAL: Called on session termination or logout
   * - Clears IndexedDB completely
   * - Destroys CryptoKey reference
   * - Empties in-memory cache
   * - Nulls all critical references
   */
  async wipe(): Promise<void> {
    try {
      // SECURITY: Clear IndexedDB
      await this.clearIndexedDB();

      // SECURITY: Destroy key (can't be explicitly destroyed in WebCrypto, but nullify reference)
      this.cryptoKey = null;

      // SECURITY: Clear cache
      this.cache.clear();

      // SECURITY: Reset state
      this.sessionId = '';
      this.ready = false;
      this.notifyListeners();

      console.log('[Vault] Wipe complete - vault cleared');
    } catch (error) {
      console.error('[Vault] Wipe failed:', error);
      throw error;
    }
  }

  /**
   * Check if vault is ready for operations
   */
  isReady(): boolean {
    return this.ready;
  }

  // ============ IndexedDB Operations ============

  private storeToIndexedDB(token: string, encrypted: EncryptedToken): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);

        store.put({
          token,
          ciphertext: Array.from(encrypted.ciphertext),
          iv: Array.from(encrypted.iv),
          authTag: Array.from(encrypted.authTag),
          storedAt: new Date().toISOString(),
        });

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private retrieveFromIndexedDB(token: string): Promise<EncryptedToken | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const getRequest = store.get(token);

        getRequest.onsuccess = () => {
          const data = getRequest.result;
          if (!data) {
            resolve(null);
          } else {
            resolve({
              ciphertext: new Uint8Array(data.ciphertext),
              iv: new Uint8Array(data.iv),
              authTag: new Uint8Array(data.authTag),
            });
          }
        };
        getRequest.onerror = () => reject(getRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private checkTokenInIndexedDB(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const countRequest = store.count(token);

        countRequest.onsuccess = () => {
          resolve(countRequest.result > 0);
        };
        countRequest.onerror = () => reject(countRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private getTokenCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const countRequest = store.count();

        countRequest.onsuccess = () => {
          resolve(countRequest.result);
        };
        countRequest.onerror = () => reject(countRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private clearIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
          resolve();
        };
        clearRequest.onerror = () => reject(clearRequest.error);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ============ Validation ============

  /**
   * Validate token format matches expected pattern
   * Prevents injection attacks and malformed tokens
   */
  private isValidTokenFormat(token: string): boolean {
    // Expected format: TOKEN_[alphanumeric]
    const tokenRegex = /^TOKEN_[a-zA-Z0-9]+$/;
    return tokenRegex.test(token);
  }
}

/**
 * Global vault singleton instance
 * Access via useVault() hook - never access directly
 */
let vaultInstance: Vault | null = null;

export function getVault(): Vault {
  if (!vaultInstance) {
    vaultInstance = new Vault();
  }
  return vaultInstance;
}

export function setVault(vault: Vault): void {
  vaultInstance = vault;
}
