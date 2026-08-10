// Session-scoped flag — no persistence layer in this project yet (see
// constants/consent.ts for the same pattern), so this resets on app reload.
// Good enough to gate "show the nickname modal once per session."
export const onboardingState = { nicknameSet: false };
