export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Friendly copy for any error. Screens show this, never the raw error. */
// 404 deliberately gets the generic message: it usually means a route isn't deployed yet, not user error.
export function errorMessage(err: unknown) {
  if (err instanceof ApiError && err.status === 401) return "Your session expired. Please sign in again.";
  return "Something went wrong. Check your connection and try again.";
}
