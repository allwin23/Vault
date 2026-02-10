import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SecurityEvent {
  id: string;
  type: 'auth_failure' | 'session_timeout' | 'vault_error' | 'security_violation' | 'api_error';
  message: string;
  timestamp: Date;
  details?: Record<string, any>;
}

interface SecurityContextType {
  events: SecurityEvent[];
  addSecurityEvent: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;
  getEvents: (type?: SecurityEvent['type']) => SecurityEvent[];
  isSecure: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isSecure, setIsSecure] = useState(true);

  const addSecurityEvent = (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setEvents(prev => [securityEvent, ...prev]);

    // Update security status based on event type
    if (event.type === 'security_violation' || event.type === 'auth_failure') {
      setIsSecure(false);
    }

    // Log security events (in production, send to security service)
    console.warn('Security Event:', securityEvent);
  };

  const clearEvents = () => {
    setEvents([]);
    setIsSecure(true);
  };

  const getEvents = (type?: SecurityEvent['type']) => {
    if (type) {
      return events.filter(event => event.type === type);
    }
    return events;
  };

  // Monitor for suspicious activity
  useEffect(() => {
    const recentEvents = events.filter(
      event => Date.now() - event.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    const authFailures = recentEvents.filter(event => event.type === 'auth_failure').length;
    const securityViolations = recentEvents.filter(event => event.type === 'security_violation').length;

    // Multiple failures indicate potential attack
    if (authFailures >= 3 || securityViolations >= 1) {
      setIsSecure(false);
    } else if (authFailures === 0 && securityViolations === 0) {
      setIsSecure(true);
    }
  }, [events]);

  const value: SecurityContextType = {
    events,
    addSecurityEvent,
    clearEvents,
    getEvents,
    isSecure,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}