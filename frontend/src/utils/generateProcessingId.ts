/**
 * Processing ID Generator
 * 
 * Centralized utility for generating unique processing IDs
 * Used to track all API operations that require tokenization
 * 
 * CRITICAL: Each user action MUST generate a new processing_id:
 * - Text sanitization
 * - PDF upload and processing
 * - Chat message sending
 * - Any operation that returns tokens
 * 
 * SECURITY: Processing IDs are stored with tokens in the database
 * and used to retrieve tokenized outputs. They must be unique and
 * non-guessable to prevent token leakage between operations.
 */

/**
 * Generate a unique processing ID for tracking operations
 * Always uses UUID v4 format to match database schema requirements
 * 
 * Usage:
 * const processingId = createProcessingId();
 * 
 * Then include in ALL API requests that may generate tokens:
 * - sanitizeText(sessionId, processingId, text)
 * - sanitizePdf(sessionId, processingId, file)
 * - sendChat(sessionId, processingId, message)
 * 
 * SECURITY: Never reuse processing IDs between operations
 * Each user action must generate a fresh ID
 */
export function createProcessingId(): string {
  return crypto.randomUUID();
}

/**
 * Validate processing ID format
 * Ensures ID matches expected UUID v4 format
 * 
 * @param processingId - Processing ID to validate
 * @returns True if valid UUID v4 format
 */
export function isValidProcessingId(processingId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(processingId);
}

/**
 * Generate processing ID with validation
 * Creates ID and validates format before returning
 * 
 * @returns Validated processing ID
 * @throws Error if generated ID is invalid (should never happen)
 */
export function createValidProcessingId(): string {
  const processingId = createProcessingId();
  if (!isValidProcessingId(processingId)) {
    throw new Error('Generated processing ID failed validation');
  }
  return processingId;
}