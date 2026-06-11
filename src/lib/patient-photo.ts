import { supabase } from "@/integrations/supabase/client";

const BUCKET = "patient-photos";
const PUBLIC_MARKER = `/storage/v1/object/public/${BUCKET}/`;
const SIGNED_MARKER = `/storage/v1/object/sign/${BUCKET}/`;
const SIGNED_TTL = 60 * 60; // 1 hour

/**
 * Accepts either a raw storage path (e.g. "user-id/file.jpg") or a legacy
 * public URL stored historically in patient_timeline.image_url, and returns
 * the storage path.
 */
export function extractPhotoPath(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;

  if (v.includes(PUBLIC_MARKER)) {
    return decodeURIComponent(v.split(PUBLIC_MARKER)[1].split("?")[0]);
  }
  if (v.includes(SIGNED_MARKER)) {
    return decodeURIComponent(v.split(SIGNED_MARKER)[1].split("?")[0]);
  }
  // Already a path
  return v;
}

/** Generate a short-lived signed URL for a patient photo. */
export async function signPatientPhoto(
  value: string | null | undefined,
): Promise<string | null> {
  const path = extractPhotoPath(value);
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_TTL);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/** Sign many entries' image_url fields in parallel. */
export async function signEntryPhotos<T extends { image_url: string | null }>(
  entries: T[],
): Promise<T[]> {
  return Promise.all(
    entries.map(async (e) => ({
      ...e,
      image_url: e.image_url ? await signPatientPhoto(e.image_url) : null,
    })),
  );
}
