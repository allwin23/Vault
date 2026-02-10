/**
 * Input Validation Utilities
 * 
 * Provides secure input validation for various data types
 * Prevents XSS, injection attacks, and malformed data
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

export class InputValidator {
  /**
   * Validate session ID format
   */
  static validateSessionId(sessionId: string): ValidationResult {
    if (!sessionId || typeof sessionId !== 'string') {
      return { isValid: false, error: 'Session ID is required' };
    }

    // Remove potential injection attempts
    const sanitized = sessionId.trim().replace(/[<>\"'&]/g, '');
    
    // Check minimum length and format
    if (sanitized.length < 8) {
      return { isValid: false, error: 'Session ID too short' };
    }

    if (sanitized.length > 256) {
      return { isValid: false, error: 'Session ID too long' };
    }

    // Allow alphanumeric, dash, underscore, and UUID format (with hyphens)
    const sessionIdPattern = /^[a-zA-Z0-9_-]+$/;
    const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    
    if (!sessionIdPattern.test(sanitized) && !uuidPattern.test(sanitized)) {
      return { isValid: false, error: 'Invalid session ID format' };
    }

    return { isValid: true, sanitized };
  }

  /**
   * Validate challenge/response string
   */
  static validateChallenge(challenge: string): ValidationResult {
    if (!challenge || typeof challenge !== 'string') {
      return { isValid: false, error: 'Challenge is required' };
    }

    const sanitized = challenge.trim().replace(/[<>\"'&]/g, '');
    
    if (sanitized.length < 16) {
      return { isValid: false, error: 'Challenge too short' };
    }

    if (sanitized.length > 1024) {
      return { isValid: false, error: 'Challenge too long' };
    }

    // Allow base64-like characters for cryptographic challenges
    const challengePattern = /^[a-zA-Z0-9+/=_-]+$/;
    if (!challengePattern.test(sanitized)) {
      return { isValid: false, error: 'Invalid challenge format' };
    }

    return { isValid: true, sanitized };
  }

  /**
   * Validate chat message content
   */
  static validateChatMessage(message: string): ValidationResult {
    if (!message || typeof message !== 'string') {
      return { isValid: false, error: 'Message is required' };
    }

    const sanitized = message.trim();
    
    if (sanitized.length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (sanitized.length > 10000) {
      return { isValid: false, error: 'Message too long (max 10,000 characters)' };
    }

    // Remove potentially dangerous HTML/JS
    const cleanMessage = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');

    return { isValid: true, sanitized: cleanMessage };
  }

  /**
   * Validate filename for upload
   */
  static validateFilename(filename: string): ValidationResult {
    if (!filename || typeof filename !== 'string') {
      return { isValid: false, error: 'Filename is required' };
    }

    const sanitized = filename.trim();
    
    if (sanitized.length === 0) {
      return { isValid: false, error: 'Filename cannot be empty' };
    }

    if (sanitized.length > 255) {
      return { isValid: false, error: 'Filename too long' };
    }

    // Remove path traversal attempts
    const cleanName = sanitized
      .replace(/\.\./g, '')
      .replace(/\//g, '_')
      .replace(/\\/g, '_')
      .replace(/[<>:\"|?*]/g, '');

    // Only allow alphanumerics, spaces, dots, hyphens, underscores
    const filenamePattern = /^[a-zA-Z0-9 .\-_]+$/;
    if (!filenamePattern.test(cleanName)) {
      return { isValid: false, error: 'Invalid filename format' };
    }

    return { isValid: true, sanitized: cleanName };
  }

  /**
   * Validate file size and type
   */
  static validateFile(file: File): ValidationResult {
    if (!file || !(file instanceof File)) {
      return { isValid: false, error: 'Invalid file' };
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 10MB limit' };
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not supported' };
    }

    return { isValid: true };
  }

  /**
   * Validate token format
   */
  static validateToken(token: string): ValidationResult {
    if (!token || typeof token !== 'string') {
      return { isValid: false, error: 'Token is required' };
    }

    const sanitized = token.trim().replace(/[<>\"'&]/g, '');
    
    if (sanitized.length === 0) {
      return { isValid: false, error: 'Token cannot be empty' };
    }

    // Token format: TOKEN_[alphanumeric]
    const tokenPattern = /^TOKEN_[a-zA-Z0-9]+$/;
    if (!tokenPattern.test(sanitized)) {
      return { isValid: false, error: 'Invalid token format' };
    }

    return { isValid: true, sanitized };
  }

  /**
   * Validate processing ID
   */
  static validateProcessingId(processingId: string): ValidationResult {
    if (!processingId || typeof processingId !== 'string') {
      return { isValid: false, error: 'Processing ID is required' };
    }

    const sanitized = processingId.trim().replace(/[<>\"'&]/g, '');
    
    if (sanitized.length < 8 || sanitized.length > 128) {
      return { isValid: false, error: 'Invalid processing ID length' };
    }

    // Allow alphanumeric, underscore, hyphen, and UUID format (with hyphens)
    const pattern = /^[a-zA-Z0-9_-]+$/;
    const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    
    if (!pattern.test(sanitized) && !uuidPattern.test(sanitized)) {
      return { isValid: false, error: 'Invalid processing ID format' };
    }

    return { isValid: true, sanitized };
  }

  /**
   * Generic string sanitizer
   */
  static sanitizeString(input: string, maxLength: number = 1000): ValidationResult {
    if (!input || typeof input !== 'string') {
      return { isValid: false, error: 'Invalid input' };
    }

    let sanitized = input.trim();
    
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // Remove potentially dangerous characters
    sanitized = sanitized
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control characters
      .replace(/[\uFFFE\uFFFF]/g, '') // Invalid Unicode
      .replace(/[<>\"'&]/g, ''); // HTML special chars

    return { isValid: true, sanitized };
  }

  /**
   * Validate numeric input
   */
  static validateNumber(input: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): ValidationResult {
    const num = Number(input);
    
    if (isNaN(num) || !isFinite(num)) {
      return { isValid: false, error: 'Invalid number' };
    }

    if (num < min || num > max) {
      return { isValid: false, error: `Number must be between ${min} and ${max}` };
    }

    return { isValid: true, sanitized: num.toString() };
  }
}

/**
 * React hook for input validation
 */
export function useValidation() {
  return {
    validateSessionId: InputValidator.validateSessionId,
    validateChallenge: InputValidator.validateChallenge,
    validateChatMessage: InputValidator.validateChatMessage,
    validateFilename: InputValidator.validateFilename,
    validateFile: InputValidator.validateFile,
    validateToken: InputValidator.validateToken,
    validateProcessingId: InputValidator.validateProcessingId,
    sanitizeString: InputValidator.sanitizeString,
    validateNumber: InputValidator.validateNumber,
  };
}