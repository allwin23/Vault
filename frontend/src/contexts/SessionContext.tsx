import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useVault } from '../hooks/useVault';
import { useSecurity } from './SecurityContext';
import { InputValidator } from '../utils/validation';
import { getApiClient } from '../utils/api';
import { clearHistory } from '../utils/history';

interface Session {
  id: string | null;
  challenge: string | null;
  isActive: boolean;
  lastActivity: Date | null;
  startTime: Date | null;
  expiresAt: Date | null;
}

interface SessionContextType {
  session: Session;
  setSession: (session: Partial<Session>) => void;
  clearSession: () => void;
  initializeSession: (sessionId?: string, challenge?: string) => Promise<void>;
  isSessionValid: () => boolean;
  extendSession: () => void;
  getTimeRemaining: () => number;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const { vault, ready: vaultReady, initialize: initVault } = useVault();
  const { addSecurityEvent } = useSecurity();

  const [session, setSessionState] = useState<Session>({
    id: null,
    challenge: null,
    isActive: false,
    lastActivity: null,
    startTime: null,
    expiresAt: null,
  });

  const setSession = useCallback((updates: Partial<Session>) => {
    setSessionState(prev => ({
      ...prev,
      ...updates,
      lastActivity: new Date(),
    }));
  }, []);

  const extendSession = useCallback(() => {
    if (!session.isActive || !session.startTime) return;

    const newExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    setSessionState(prev => ({
      ...prev,
      expiresAt: newExpiresAt,
      lastActivity: new Date(),
    }));
  }, [session.isActive, session.startTime]);

  const getTimeRemaining = useCallback(() => {
    if (!session.expiresAt) return 0;
    return Math.max(0, session.expiresAt.getTime() - Date.now());
  }, [session.expiresAt]);

  const clearSession = useCallback(async () => {
    try {
      if (vaultReady && vault) {
        await vault.wipe();
      }
      clearHistory();
    } catch (error) {
      console.error('Failed to wipe vault:', error);
      addSecurityEvent({
        type: 'vault_error',
        message: `Vault wipe failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    setSessionState({
      id: null,
      challenge: null,
      isActive: false,
      lastActivity: null,
      startTime: null,
      expiresAt: null,
    });
  }, [vaultReady, vault, addSecurityEvent]);

  const initializeSession = useCallback(async (sessionId?: string, challenge?: string) => {
    try {
      console.log(`[Session] Attempting initialization. Current state active: ${session.isActive}`);
      // If IDs are provided (e.g. recovery), validate them. 
      // Otherwise, create a NEW session via API.

      let finalSessionId = sessionId;
      let finalChallenge = challenge;

      if (!finalSessionId || !finalChallenge) {
        try {
          console.log('[Session] Creating new session via API...');
          // Call Backend to create session
          const apiSession = await getApiClient().createSession();
          finalSessionId = apiSession.session_id;
          finalChallenge = apiSession.challenge;
          console.log(`[Session] API returned session_id: ${finalSessionId}`);
        } catch (apiError) {
          console.error("API Session Creation Failed:", apiError);
          throw new Error("Failed to create session on backend");
        }
      }

      // Validate inputs (double check even if from API)
      const sessionIdValidation = InputValidator.validateSessionId(finalSessionId!);
      if (!sessionIdValidation.isValid) {
        throw new Error(sessionIdValidation.error);
      }

      const challengeValidation = InputValidator.validateChallenge(finalChallenge!);
      if (!challengeValidation.isValid) {
        throw new Error(challengeValidation.error);
      }

      // Initialize Vault with these credentials
      await initVault(sessionIdValidation.sanitized!, challengeValidation.sanitized!);

      const now = new Date();
      // Default 30 min expiry
      const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

      setSessionState({
        id: sessionIdValidation.sanitized!,
        challenge: challengeValidation.sanitized!,
        isActive: true,
        lastActivity: now,
        startTime: now,
        expiresAt,
      });

      console.log(`[Session] SUCCESS: Initialized session ${sessionIdValidation.sanitized}`);

    } catch (error) {
      console.error('Failed to initialize session:', error);
      addSecurityEvent({
        type: 'auth_failure',
        message: `Session initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      throw error;
    }
  }, [initVault, addSecurityEvent, session.isActive]);

  const isSessionValid = () => {
    if (!session.id || !session.isActive || !session.lastActivity || !session.expiresAt) {
      return false;
    }

    // Check if session has expired
    const now = new Date().getTime();
    const expiresAt = session.expiresAt.getTime();

    if (now >= expiresAt) {
      addSecurityEvent({
        type: 'session_timeout',
        message: 'Session expired due to timeout',
        details: {
          sessionId: session.id.substring(0, 8) + '...',
          expiredAt: session.expiresAt.toISOString(),
        },
      });
      return false;
    }

    return true;
  };

  // Check session validity periodically and handle expiration
  useEffect(() => {
    const interval = setInterval(() => {
      if (session.isActive && !isSessionValid()) {
        clearSession();
      }
    }, 30000); // Check every 30 seconds for better security

    // Activity detection - extend session on user interaction
    const handleActivity = () => {
      if (session.isActive && isSessionValid()) {
        extendSession();
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearInterval(interval);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [session, isSessionValid]);

  // Warning before session expiration
  useEffect(() => {
    if (!session.expiresAt || !session.isActive) return;

    const checkExpiration = () => {
      const timeRemaining = getTimeRemaining();

      // Show warning 5 minutes before expiration
      if (timeRemaining > 0 && timeRemaining <= 5 * 60 * 1000) {
        console.warn(`Session expires in ${Math.ceil(timeRemaining / 60000)} minutes`);
      }

      // Force logout if expired
      if (timeRemaining <= 0) {
        clearSession();
      }
    };

    const warningInterval = setInterval(checkExpiration, 60000); // Check every minute

    return () => clearInterval(warningInterval);
  }, [session.expiresAt, session.isActive]);

  const value: SessionContextType = {
    session,
    setSession,
    clearSession,
    initializeSession,
    isSessionValid,
    extendSession,
    getTimeRemaining,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}