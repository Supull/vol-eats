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
export function errorMessage(err: unknown) {
  if (err instanceof ApiError && err.status === 404) return "We couldn't find that.";
  if (err instanceof ApiError && err.status === 401) return "Your session expired. Please sign in again.";
  return "Something went wrong. Check your connection and try again.";
}
