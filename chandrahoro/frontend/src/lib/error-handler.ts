/**
 * Centralized error handling utilities for the frontend
 */

import { toast } from '@/hooks/use-toast';

/**
 * Standard API error response structure
 */
interface ApiErrorResponse {
  detail: string;
  type?: string;
  path?: string;
  [key: string]: any;
}

/**
 * Options for error display
 */
interface ErrorDisplayOptions {
  /** Custom title for the toast */
  title?: string;
  /** Whether to log the error to console */
  logToConsole?: boolean;
  /** Additional context to include in console log */
  context?: Record<string, any>;
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    // Check for API error response structure
    const apiError = error as ApiErrorResponse;
    if (apiError.detail) {
      return apiError.detail;
    }

    // Fallback to JSON stringify for objects
    try {
      return JSON.stringify(error);
    } catch {
      return 'An unknown error occurred';
    }
  }

  return 'An unknown error occurred';
}

/**
 * Parse error from fetch Response
 */
export async function parseErrorFromResponse(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const data = await response.json() as ApiErrorResponse;
      return data.detail || `Request failed with status ${response.status}`;
    }

    const text = await response.text();
    return text || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

/**
 * Display an error toast
 */
export function showErrorToast(
  error: unknown,
  options: ErrorDisplayOptions = {}
): void {
  const {
    title = 'Error',
    logToConsole = true,
    context = {},
  } = options;

  const message = getErrorMessage(error);

  // Log to console if enabled
  if (logToConsole) {
    console.error(`[Error] ${title}:`, {
      message,
      error,
      ...context,
    });
  }

  // Show toast notification
  toast({
    variant: 'error',
    title,
    description: message,
  });
}

/**
 * Display a success toast
 */
export function showSuccessToast(
  message: string,
  options: Pick<ErrorDisplayOptions, 'title'> = {}
): void {
  const { title = 'Success' } = options;

  toast({
    variant: 'success',
    title,
    description: message,
  });
}

/**
 * Display a warning toast
 */
export function showWarningToast(
  message: string,
  options: Pick<ErrorDisplayOptions, 'title'> = {}
): void {
  const { title = 'Warning' } = options;

  toast({
    variant: 'warning',
    title,
    description: message,
  });
}

/**
 * Display an info toast
 */
export function showInfoToast(
  message: string,
  options: Pick<ErrorDisplayOptions, 'title'> = {}
): void {
  const { title = 'Info' } = options;

  toast({
    variant: 'info',
    title,
    description: message,
  });
}

/**
 * Handle API fetch errors with automatic toast display
 */
export async function handleApiError(
  response: Response,
  options: ErrorDisplayOptions = {}
): Promise<never> {
  const message = await parseErrorFromResponse(response);

  const {
    title = 'API Error',
    logToConsole = true,
    context = {},
  } = options;

  // Log to console if enabled
  if (logToConsole) {
    console.error(`[API Error] ${title}:`, {
      message,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      ...context,
    });
  }

  // Show toast notification
  toast({
    variant: 'error',
    title,
    description: message,
  });

  throw new Error(message);
}

/**
 * Wrapper for API calls with automatic error handling
 */
export async function withErrorHandling<T>(
  apiCall: () => Promise<T>,
  options: ErrorDisplayOptions = {}
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    showErrorToast(error, options);
    return null;
  }
}
