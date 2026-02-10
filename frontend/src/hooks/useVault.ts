/**
 * useVault Hook
 * 
 * React hook for vault lifecycle management and access
 * 
 * Usage:
 * const { vault, ready, error, initialize, wipe } = useVault();
 * 
 * Provides:
 * - Vault initialization with session credentials
 * - Ready state management
 * - Error handling
 * - Session lifecycle control
 * - Cleanup on component unmount
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { Vault, getVault } from '../utils/Vault';

interface UseVaultResult {
  vault: Vault | null;
  ready: boolean;
  error: Error | null;
  initialize: (sessionId: string, challenge: string) => Promise<void>;
  wipe: () => Promise<void>;
  getStats: () => Promise<any>;
  storeFromTokenMap: (tokenMap: Record<string, string>) => Promise<void>;
  retrieve: (token: string) => Promise<string | null>;
  retrieveBatch: (tokens: string[]) => Promise<Record<string, string | null>>;
}

export function useVault(): UseVaultResult {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const vaultRef = useRef<Vault | null>(null);
  const initializingRef = useRef(false);

  // Get or create vault instance (singleton pattern)
  const getVaultInstance = useCallback(() => {
    if (!vaultRef.current) {
      vaultRef.current = getVault();
    }
    return vaultRef.current;
  }, []);



  // Initialize vault with session credentials
  const initialize = useCallback(async (sessionId: string, challenge: string) => {
    if (initializingRef.current) {
      console.warn('[useVault] Initialization already in progress');
      return;
    }

    try {
      initializingRef.current = true;
      setError(null);

      const vault = getVaultInstance();

      // Check if already initialized with same session
      if (vault.isReady()) {
        console.log('[useVault] Vault already ready, skipping initialization');
        setReady(true);
        return;
      }

      // Initialize vault with session credentials
      await vault.initialize(sessionId, challenge);
      setReady(true);

      console.log('[useVault] Vault initialized successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setReady(false);
      console.error('[useVault] Initialization failed:', error);
      throw error;
    } finally {
      initializingRef.current = false;
    }
  }, [getVaultInstance]);

  // Wipe vault on demand
  const wipe = useCallback(async () => {
    try {
      setError(null);

      const vault = getVaultInstance();
      if (vault.isReady()) {
        await vault.wipe();
      }

      setReady(false);
      console.log('[useVault] Vault wiped successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('[useVault] Wipe failed:', error);
      throw error;
    }
  }, [getVaultInstance]);

  // Get vault statistics
  const getStats = useCallback(async () => {
    const vault = getVaultInstance();
    if (!vault.isReady()) {
      throw new Error('Vault not initialized');
    }
    return await vault.getStats();
  }, [getVaultInstance]);

  // Store tokens from API response
  const storeFromTokenMap = useCallback(async (tokenMap: Record<string, string>) => {
    const vault = getVaultInstance();
    if (!vault.isReady()) {
      throw new Error('Vault not ready - initialize first');
    }
    await vault.storeFromTokenMap(tokenMap);
  }, [getVaultInstance]);

  // Retrieve single token value
  const retrieve = useCallback(async (token: string) => {
    const vault = getVaultInstance();
    if (!vault.isReady()) {
      throw new Error('Vault not ready - initialize first');
    }
    return await vault.retrieve(token);
  }, [getVaultInstance]);

  // Retrieve multiple token values
  const retrieveBatch = useCallback(async (tokens: string[]) => {
    const vault = getVaultInstance();
    if (!vault.isReady()) {
      throw new Error('Vault not ready - initialize first');
    }
    return await vault.retrieveBatch(tokens);
  }, [getVaultInstance]);

  // Check vault readiness on mount and subscribe to changes
  useEffect(() => {
    const vault = getVaultInstance();

    const updateReady = () => {
      const isReady = vault.isReady();
      setReady(isReady);
      if (isReady) {
        console.log('[useVault] Vault state updated to ready');
      }
    };

    // Initial check
    updateReady();

    // Subscribe to future changes
    const unsubscribe = vault.subscribe(updateReady);

    return unsubscribe;
  }, [getVaultInstance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Do not wipe on unmount - session persists across navigation
      // Only wipe on explicit logout/termination
      console.log('[useVault] Hook unmounting - vault preserved');
    };
  }, []);

  return {
    vault: vaultRef.current,
    ready,
    error,
    initialize,
    wipe,
    getStats,
    storeFromTokenMap,
    retrieve,
    retrieveBatch,
  };
}
