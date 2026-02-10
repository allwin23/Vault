/**
 * API Client Layer
 * 
 * Implements backend API contracts exactly as specified
 * Automatically stores tokens from responses via vault.storeFromTokenMap()
 * 
 * Contracts:
 * - POST /api/auth/session - Create new session
 * - GET /api/auth/session - Get session status
 * - DELETE /api/auth/session - Terminate session
 * - POST /api/sanitize/text - Sanitize text
 * - POST /api/sanitize/pdf - Sanitize PDF
 * - GET /api/sanitize/outputs - Get outputs
 * - GET /api/health - Health check
 */

import { getVault } from '../utils/Vault';
import { createProcessingId } from './generateProcessingId';

// ============ Type Definitions ============

export interface SessionCreateResponse {
  session_id: string;
  challenge: string;
  expires_in: number;
}

export interface SessionStatusResponse {
  session_id: string;
  session_data: {
    created_at: string;
    last_active: string;
    requests: number;
  };
  pipeline_status: 'idle' | 'running' | 'error';
  ttl_seconds: number;
  active: boolean;
}

export interface SanitizeTextRequest {
  text: string;
}

export interface SanitizeTextResponse {
  sanitized_text: string;
  tokens: Record<string, string>;
  engine: string;
}

export interface SanitizePdfResponse {
  pdf_bytes: ArrayBuffer;
  tokens: Record<string, string>;
  pages: number;
  processing_time_sec: number;
  gemini_calls: number;
  text?: string;
}

export interface SanitizedOutput {
  session_id: string;
  input_type: 'text' | 'pdf';
  tokenized_content: string;
  engine: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  tokens: Record<string, string>;
  engine: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
}

export interface DebateTranscriptItem {
  agent: string;
  text: string;
}

export interface DebateResponse {
  session_id: string;
  transcript: DebateTranscriptItem[];
}

export interface HistoricalDebatesResponse {
  session_id: string;
  debates: {
    id: string;
    session_id: string;
    transcript: DebateTranscriptItem[];
    created_at: string;
  }[];
}

// ============ API Client ============

class ApiClient {
  private apiUrl: string;

  constructor() {
    const rawUrl = import.meta.env.VITE_API_URL || 'https://geminihackathon26-production.up.railway.app/api';

    // If local dev proxy is enabled (VITE_API_URL=/api), we must usage relative paths
    // Otherwise, we use the absolute URL for production
    if (rawUrl === '/api') {
      this.apiUrl = ''; // let request() append /api/...
    } else {
      // Normalize: remove trailing slash and /api suffix so we can join cleanly
      this.apiUrl = rawUrl.replace(/\/$/, '').replace(/\/api$/, '');
    }

    console.log(`[API] Initialized. Base: "${this.apiUrl}". Health check: "${this.apiUrl}/api/health"`);
  }

  /**
   * Helper: Make API request with proper error handling
   */
  private async request<T>(
    method: string,
    endpoint: string,
    options?: {
      body?: Record<string, unknown> | FormData;
      headers?: Record<string, string>;
      sessionId?: string;
      processingId?: string;
      responseType?: 'json' | 'arraybuffer';
    }
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers: Record<string, string> = options?.headers || {};

    if (options?.sessionId) {
      headers['X-Session-ID'] = options.sessionId;
    }

    if (options?.processingId) {
      headers['X-Processing-ID'] = options.processingId;
    }

    if (options?.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (options?.body) {
      if (options.body instanceof FormData) {
        fetchOptions.body = options.body;
      } else {
        fetchOptions.body = JSON.stringify(options.body);
      }
    }

    console.log(`[API] ${method} ${url}`);

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        let errorMsg = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData.detail) errorMsg = errData.detail;
        } catch (e) { /* ignore */ }
        throw new Error(errorMsg);
      }

      if (options?.responseType === 'arraybuffer') {
        // We need the data AND headers for PDF, so we return a combined object
        const buffer = await response.arrayBuffer();
        return {
          data: buffer,
          headers: response.headers
        } as unknown as T;
      }

      return response.json() as Promise<T>;
    } catch (error) {
      console.error(`[API] Request failed:`, error);
      throw error;
    }
  }

  /**
   * Create new session
   * Returns session ID and challenge for key derivation
   */
  async createSession(): Promise<SessionCreateResponse> {
    const response = await this.request<SessionCreateResponse>(
      'POST',
      '/api/auth/session'
    );

    console.log('[API] Session created:', {
      sessionId: response.session_id,
      expiresIn: response.expires_in,
    });

    return response;
  }

  /**
   * Get current session status
   */
  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
    return this.request<SessionStatusResponse>(
      'GET',
      `/api/auth/session`,
      { sessionId }
    );
  }

  /**
   * Terminate session
   * SECURITY: Frontend should call vault.wipe() before this
   */
  async terminateSession(sessionId: string): Promise<void> {
    await this.request<{ message: string }>(
      'DELETE',
      `/api/auth/session`,
      { sessionId }
    );
  }

  /**
   * Sanitize raw text
   */
  async sanitizeText(
    sessionId: string,
    processingId: string,
    text: string
  ): Promise<SanitizeTextResponse> {
    const response = await this.request<SanitizeTextResponse>(
      'POST',
      '/api/sanitize/text',
      {
        body: { text },
        sessionId,
        processingId,
      }
    );

    // SECURITY: Immediately store tokens in vault
    if (response.tokens && Object.keys(response.tokens).length > 0) {
      const vault = getVault();
      if (vault.isReady()) {
        try {
          await vault.storeFromTokenMap(response.tokens);
          console.log(`[API] Stored ${Object.keys(response.tokens).length} tokens from text sanitization`);
        } catch (error) {
          console.error('[API] Token storage failed:', error);
          throw new Error('Failed to secure tokens');
        }
      }
    }

    return response;
  }

  /**
   * Sanitize PDF document
   * 
   * SECURITY CRITICAL:
   * 1. Streams PDF file to backend
   * 2. Backend extracts text, tokenizes, redacts PDF
   * 3. Returns redacted PDF + token map in headers
   * 4. Frontend MUST store tokens before processing PDF
   * 
   * @param sessionId - Active session ID
   * @param processingId - Unique ID for this operation
   * @param file - PDF file to sanitize
   */
  async sanitizePdf(
    sessionId: string,
    processingId: string,
    file: File
  ): Promise<SanitizePdfResponse> {
    const formData = new FormData();
    formData.append('file', file);

    console.log(`[API] Sanitizing PDF: ${file.name}`);

    const response = await this.request<{ data: ArrayBuffer; headers: Headers }>(
      'POST',
      '/api/sanitize/pdf',
      {
        body: formData,
        sessionId,
        processingId,
        responseType: 'arraybuffer',
      }
    );

    const pdfBytes = response.data;
    const headers = response.headers;

    // Extract token metadata from headers
    const tokensHeader = headers.get('X-Tokens') || '';
    const tokenIds = tokensHeader ? tokensHeader.split(',').filter(t => t) : [];
    const pages = parseInt(headers.get('X-Pages') || '0', 10);
    const processingTime = parseFloat(headers.get('X-Processing-Time') || '0');
    const geminiCalls = parseInt(headers.get('X-Gemini-Calls') || '0', 10);

    console.log(`[API] PDF result: ${pages} pages, ${tokenIds.length} tokens`);

    // Fetch actual text content + tokens if possible
    let tokens: Record<string, string> = {};
    let text = '';

    if (processingId) {
      try {
        const outputResponse = await this.getSanitizedOutputsByProcessingId(processingId, sessionId);
        const pdfOutput = outputResponse.outputs.find(o => o.input_type === 'pdf');

        if (pdfOutput && pdfOutput.tokenized_content) {
          text = pdfOutput.tokenized_content;

          // Attempt to parse as tokens map if backend sent map
          try {
            // Basic heuristic: check if it looks like JSON map
            if (text.trim().startsWith('{')) {
              const parsed = JSON.parse(text);
              if (parsed && typeof parsed === 'object') {
                tokens = parsed;
                // SECURITY: Store tokens in vault immediately
                const vault = getVault();
                if (vault.isReady() && Object.keys(tokens).length > 0) {
                  await vault.storeFromTokenMap(tokens);
                  console.log(`[API] Secured ${Object.keys(tokens).length} PDF tokens in vault`);
                }
              }
            }
          } catch (e) {
            // Ignore, likely just text content with [TOKENS] inline
          }
        }
      } catch (e) {
        console.error('[API] PDF output fetch error:', e);
      }
    }

    return {
      pdf_bytes: pdfBytes,
      tokens,
      pages,
      processing_time_sec: processingTime,
      gemini_calls: geminiCalls,
      text,
    };
  }

  /**
   * Get sanitized outputs by processing ID
   */
  async getSanitizedOutputsByProcessingId(
    processingId: string,
    sessionId?: string
  ): Promise<{ processing_id: string; outputs: SanitizedOutput[] }> {
    return this.request(
      'GET',
      `/api/sanitize/outputs/${processingId}`,
      { sessionId }
    );
  }

  /**
   * Get all sanitized outputs for session
   */
  async getSanitizedOutputsBySession(
    sessionId: string
  ): Promise<{ session_id: string; outputs: SanitizedOutput[] }> {
    return this.request(
      'GET',
      `/api/sanitize/outputs`,
      { sessionId }
    );
  }

  /**
   * Send chat message with PII detection and tokenization
   * 
   * SECURITY CRITICAL:
   * 1. Backend detects PII in chat messages
   * 2. Returns tokenized response + token map
   * 3. Frontend MUST immediately call vault.storeFromTokenMap(tokens)
   * 4. Only then render the detokenized response
   * 
   * @param sessionId - Active session ID
   * @param processingId - Unique ID for this operation
   * @param message - Chat message to send
   */
  async sendChat(
    sessionId: string,
    processingId: string,
    message: string
  ): Promise<ChatResponse> {
    const response = await this.request<ChatResponse>(
      'POST',
      '/api/chat',
      {
        body: { message },
        sessionId,
        processingId,
      }
    );

    // SECURITY: Immediately store tokens in vault
    if (response.tokens && Object.keys(response.tokens).length > 0) {
      const vault = getVault();
      if (vault.isReady()) {
        try {
          await vault.storeFromTokenMap(response.tokens);
          console.log(`[API] Stored ${Object.keys(response.tokens).length} tokens from chat response`);
        } catch (error) {
          console.error('[API] Token storage failed:', error);
          throw new Error('Failed to secure chat tokens');
        }
      }
    }

    return response;
  }

  /**
   * Run an AI Security Debate with streaming response
   */
  async runDebateStream(sessionId: string, onChunk: (chunk: string) => void): Promise<void> {
    const url = `${this.apiUrl}/api/debate/run/${sessionId}`;
    console.log(`[API] Starting debate stream: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Session-ID': sessionId,
        // 'Content-Type': 'application/json' // Removed to match non-streaming request which sends no body
      }
    });

    if (!response.ok) {
      let errorMsg = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errData = await response.json();
        if (errData.detail) errorMsg = errData.detail;
      } catch (e) { /* ignore lines */ }
      throw new Error(errorMsg);
    }

    if (!response.body) throw new Error('No response body for stream');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
      }
    } catch (err) {
      console.error("Stream reading failed", err);
      throw err;
    }
  }

  /**
   * Run an AI Security Debate for the session
   */
  async runDebate(sessionId: string): Promise<DebateResponse> {
    return this.request<DebateResponse>(
      'POST',
      `/api/debate/run/${sessionId}`,
      { sessionId }
    );
  }

  /**
   * Get historical debates for a session
   */
  async getHistoricalDebates(sessionId: string): Promise<HistoricalDebatesResponse> {
    return this.request<HistoricalDebatesResponse>(
      'GET',
      `/api/debate/session/${sessionId}`,
      { sessionId }
    );
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>(
      'GET',
      '/api/health'
    );
  }
}

/**
 * Global API client singleton
 */
let apiClient: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!apiClient) {
    apiClient = new ApiClient();
  }
  return apiClient;
}

/**
 * Generate unique processing ID for tracking operations
 * Re-export from centralized utility for backward compatibility
 * 
 * @deprecated Use createProcessingId() from generateProcessingId.ts instead
 */
export function generateProcessingId(): string {
  return createProcessingId();
}
