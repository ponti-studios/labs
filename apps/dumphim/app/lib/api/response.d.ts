/**
 * API Response Utilities
 * Standardized response helpers for JSON API endpoints
 */
export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  meta?: Record<string, unknown>;
};
export declare function jsonResponse<T>(
  data: T,
  status?: number,
  headers?: Record<string, string>,
): Response;
export declare function errorResponse(
  message: string,
  status?: number,
  headers?: Record<string, string>,
): Response;
export declare function successResponse<T>(
  data: T,
  status?: number,
  headers?: Record<string, string>,
): Response;
export declare const httpErrors: {
  badRequest: (message?: string) => Response;
  unauthorized: (message?: string) => Response;
  forbidden: (message?: string) => Response;
  notFound: (message?: string) => Response;
  conflict: (message?: string) => Response;
  validationError: (message?: string) => Response;
  internalError: (message?: string) => Response;
};
export declare const httpSuccess: {
  ok: <T>(data: T, headers?: Record<string, string>) => Response;
  created: <T>(data: T, headers?: Record<string, string>) => Response;
  noContent: () => Response;
};
//# sourceMappingURL=response.d.ts.map
