/**
 * API Response Utilities
 * Standardized response helpers for JSON API endpoints
 */

export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  meta?: Record<string, unknown>;
};

export function jsonResponse<T>(data: T, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

export function errorResponse(
  message: string,
  status = 500,
  headers?: Record<string, string>,
): Response {
  return jsonResponse({ error: message }, status, headers);
}

export function successResponse<T>(
  data: T,
  status = 200,
  headers?: Record<string, string>,
): Response {
  return jsonResponse({ data }, status, headers);
}

// Common HTTP error responses
export const httpErrors = {
  badRequest: (message = "Bad request") => errorResponse(message, 400),
  unauthorized: (message = "Unauthorized") => errorResponse(message, 401),
  forbidden: (message = "Forbidden") => errorResponse(message, 403),
  notFound: (message = "Not found") => errorResponse(message, 404),
  conflict: (message = "Conflict") => errorResponse(message, 409),
  validationError: (message = "Validation error") => errorResponse(message, 422),
  internalError: (message = "Internal server error") => errorResponse(message, 500),
};

// Common HTTP success responses
export const httpSuccess = {
  ok: <T>(data: T, headers?: Record<string, string>) => successResponse(data, 200, headers),
  created: <T>(data: T, headers?: Record<string, string>) => successResponse(data, 201, headers),
  noContent: () => new Response(null, { status: 204 }),
};
