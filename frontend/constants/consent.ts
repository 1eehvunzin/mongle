// Session-scoped consent flag — no persistence layer in this project yet
// (no AsyncStorage/SecureStore dependency), so this resets on app reload.
// Good enough to gate the "first capture of this session" flow.
export const captureConsent = { granted: false };
