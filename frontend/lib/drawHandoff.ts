// Hands the just-captured photo (and its capture context) from capture.tsx
// to draw.tsx. A web capture's base64 is a full data URI that can run into
// the megabytes — too big to pass safely as a router param — so this
// follows the same pattern session.ts/consent.ts already use for app state
// that doesn't belong in the URL: a plain mutable object, set right before
// router.push and read once (then cleared) on the next screen's mount.
export type DrawContext = {
  photoUri: string;
  photoBase64: string | null;
  placeName: string | null;
  lat: number | null;
  lng: number | null;
  tempC: number | null;
  weatherCondition: string | null;
};

export const drawHandoff: { pending: DrawContext | null } = { pending: null };
