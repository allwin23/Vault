import { useState, useCallback } from 'react';
import { getDetokenizer, DetokenizationResult } from '../utils/detokenizer';

/**
 * useDetokenizer Hook
 * 
 * Provides universal detokenization capabilities to any component
 */
export function useDetokenizer() {
  const [loading, setLoading] = useState(false);
  const detokenizer = getDetokenizer();

  /**
   * Universal detokenize function
   * Integrates with global vault state
   */
  const detokenize = useCallback(async (text: string): Promise<string> => {
    setLoading(true);
    try {
      return await detokenizer.process(text);
    } finally {
      setLoading(false);
    }
  }, [detokenizer]);

  /**
   * Batch detokenize for efficiency
   */
  const detokenizeArray = useCallback(async (texts: string[]): Promise<string[]> => {
    setLoading(true);
    try {
      return await detokenizer.processArray(texts);
    } finally {
      setLoading(false);
    }
  }, [detokenizer]);

  /**
   * Get detailed detokenization stats
   */
  const detokenizeDetailed = useCallback(async (text: string): Promise<DetokenizationResult> => {
    setLoading(true);
    try {
      return await detokenizer.processDetailed(text);
    } finally {
      setLoading(false);
    }
  }, [detokenizer]);

  return {
    detokenize,
    detokenizeArray,
    detokenizeDetailed,
    loading,
    // Helpers
    hasTokens: detokenizer.hasTokens.bind(detokenizer),
    extractTokens: detokenizer.extractTokens.bind(detokenizer),
  };
}
