// No authentication needed. Stubs for auth APIs.
// @ts-nocheck

export const auth = {
  // Stub: no HTTP auth routes
  addHttpRoutes: (_router: any) => {},
};

/** Stub signIn; user authentication disabled */ 
export async function signIn(): Promise<void> {
  // No-op
}

/** Stub signOut; user authentication disabled */
export async function signOut(): Promise<void> {
  // No-op
}

/** Stub store; user authentication disabled */
export const store: unknown = null;

/** Stub isAuthenticated; always false */
export function isAuthenticated(): boolean {
  return false;
}
