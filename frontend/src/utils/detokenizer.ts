/**
 * UNIVERSAL DETOKENIZER
 * 
 * Global utility for replacing tokens with decrypted values anywhere in the UI
 * 
 * Usage:
 * - Detect tokens in text
 * - Retrieve values from vault (without exposing token mapping)
 * - Replace tokens seamlessly in UI
 * 
 * Usable in:
 * - Chat UI
 * - Document viewer
 * - Table renderer
 * - Search results
 * - Notifications
 * - History timeline
 * - Any component rendering tokenized content
 * 
 * SECURITY: Never exposes token mappings or allows direct access to vault
 */

import { getVault } from './Vault';

interface DetokenizationResult {
  text: string;
  tokensFound: string[];
  tokensDetokenized: string[];
  tokensMissing: string[];
}

class Detokenizer {
  // Token pattern: TOKEN_[identifier]
  private readonly tokenPattern = /TOKEN_[a-zA-Z0-9]+/g;
  private readonly singleTokenPattern = /^TOKEN_[a-zA-Z0-9]+$/;

  /**
   * Detect if text contains any tokens
   * SECURITY: Only returns boolean, not token list
   * 
   * @param text - Text to scan
   * @returns True if tokens present
   */
  hasTokens(text: string): boolean {
    return this.tokenPattern.test(text);
  }

  /**
   * Extract all unique tokens from text (without values)
   * SECURITY: Returns token list only, not mapping
   * Used for pre-loading cache
   * 
   * @param text - Text to scan
   * @returns Array of unique tokens found
   */
  extractTokens(text: string): string[] {
    const tokens = text.match(this.tokenPattern) || [];
    return [...new Set(tokens)]; // Remove duplicates
  }

  /**
   * Process text: replace all tokens with decrypted values
   * 
   * SECURITY:
   * - Detects tokens in text
   * - Retrieves values from vault individually
   * - Replaces tokens inline
   * - Never exposes token→value mapping
   * - Missing tokens left as-is (safe fallback)
   * - Errors don't expose token structure
   * 
   * @param text - Text containing tokens
   * @returns Text with tokens replaced by values
   */
  async process(text: string): Promise<string> {
    if (!text) return '';

    const vault = getVault();
    if (!vault.isReady()) {
      console.warn('[Detokenizer] Vault not ready - returning text with tokens visible');
      return text;
    }

    try {
      // Extract unique tokens
      const tokens = this.extractTokens(text);
      if (tokens.length === 0) {
        return text; // No tokens, return as-is
      }

      // SECURITY: Retrieve values for all tokens
      const values = await vault.retrieveBatch(tokens);

      // Replace tokens with values
      let processed = text;
      for (const token of tokens) {
        const value = values[token];
        if (value) {
          // SECURITY: Use literal replacement to prevent regex attacks
          processed = processed.split(token).join(value);
        }
        // Missing tokens left as-is (safe fallback)
      }

      return processed;
    } catch (error) {
      console.error('[Detokenizer] Processing failed, returning original text');
      return text; // Fail gracefully
    }
  }

  /**
   * Process array of texts in batch
   * More efficient than calling process() multiple times
   * 
   * @param texts - Array of texts to process
   * @returns Array of detokenized texts (same length and order)
   */
  async processArray(texts: string[]): Promise<string[]> {
    const results: string[] = [];

    // SECURITY: Process sequentially to avoid cache thrashing
    for (const text of texts) {
      results.push(await this.process(text));
    }

    return results;
  }

  /**
   * Process streaming chunks (for real-time chat, streaming responses)
   * Buffers and processes complete tokens only
   * 
   * @param chunk - New text chunk received
   * @param buffer - Previous incomplete buffer
   * @returns { processed: fully-processed text, buffer: remaining incomplete }
   */
  async processStream(
    chunk: string,
    buffer: string = ''
  ): Promise<{ processed: string; buffer: string }> {
    const combined = buffer + chunk;

    // Detect if we have potential tokens that might be cut off
    // Tokens are TOKEN_[alphanumeric]
    const lastPotentialToken = combined.lastIndexOf('TOKEN_');
    if (lastPotentialToken === -1) {
      return { processed: combined, buffer: '' };
    }

    // We buffer from the last 'TOKEN_' to the end to ensure we don't cut a token in half
    // If the token is already finished (followed by non-alphanumeric), we can process it
    const afterToken = combined.substring(lastPotentialToken + 6);
    const incompleteTokenMatch = afterToken.match(/^[a-zA-Z0-9]*/);
    const incompleteTokenLength = incompleteTokenMatch ? incompleteTokenMatch[0].length : 0;

    if (lastPotentialToken + 6 + incompleteTokenLength < combined.length) {
      // The token is definitely finished because there's text after the alphanumeric part
      return { processed: await this.process(combined), buffer: '' };
    } else {
      // Buffer the potential token part
      const safeToProcess = combined.substring(0, lastPotentialToken);
      const remainingBuffer = combined.substring(lastPotentialToken);
      return { processed: await this.process(safeToProcess), buffer: remainingBuffer };
    }
  }

  /**
   * Detailed detokenization with full reporting
   * SECURITY: Returns no token mappings, only status
   * 
   * @param text - Text to process
   * @returns Result object with text, token counts, status
   */
  async processDetailed(text: string): Promise<DetokenizationResult> {
    if (!text) {
      return {
        text: '',
        tokensFound: [],
        tokensDetokenized: [],
        tokensMissing: [],
      };
    }

    const vault = getVault();
    if (!vault.isReady()) {
      return {
        text,
        tokensFound: this.extractTokens(text),
        tokensDetokenized: [],
        tokensMissing: this.extractTokens(text),
      };
    }

    try {
      const tokensFound = this.extractTokens(text);
      if (tokensFound.length === 0) {
        return {
          text,
          tokensFound: [],
          tokensDetokenized: [],
          tokensMissing: [],
        };
      }

      const values = await vault.retrieveBatch(tokensFound);

      const tokensDetokenized: string[] = [];
      const tokensMissing: string[] = [];

      let processed = text;
      for (const token of tokensFound) {
        const value = values[token];
        if (value) {
          tokensDetokenized.push(token);
          processed = processed.split(token).join(value);
        } else {
          tokensMissing.push(token);
        }
      }

      return {
        text: processed,
        tokensFound,
        tokensDetokenized,
        tokensMissing,
      };
    } catch (error) {
      return {
        text,
        tokensFound: this.extractTokens(text),
        tokensDetokenized: [],
        tokensMissing: this.extractTokens(text),
      };
    }
  }

  /**
   * Validate token format without retrieving
   * Useful for input validation
   */
  isValidToken(token: string): boolean {
    return this.singleTokenPattern.test(token);
  }
}

/**
 * Global detokenizer singleton instance
 * Access via getDetokenizer()
 */
let detokenizerInstance: Detokenizer | null = null;

export function getDetokenizer(): Detokenizer {
  if (!detokenizerInstance) {
    detokenizerInstance = new Detokenizer();
  }
  return detokenizerInstance;
}

export type { DetokenizationResult };
