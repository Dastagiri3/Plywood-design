/**
 * storage.service.ts
 * Helper functions for Firebase Storage — used in the admin product form.
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/integrations/firebase/client";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Upload a single product image to Firebase Storage.
 * Returns the public download URL on success, or an error message.
 */
export async function uploadProductImage(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: `${file.name}: unsupported type (use JPG, PNG, WebP)` };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, error: `${file.name}: exceeds 5 MB limit` };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
    cacheControl: "public, max-age=31536000",
  });

  const url = await getDownloadURL(storageRef);
  return { ok: true, url };
}

/**
 * Upload multiple product images. Returns an array of download URLs
 * for successful uploads and calls onError for any failures.
 */
export async function uploadProductImages(
  files: FileList | File[],
  onError?: (msg: string) => void
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of Array.from(files)) {
    const result = await uploadProductImage(file);
    if (result.ok) {
      urls.push(result.url);
    } else {
      onError?.(result.error);
    }
  }
  return urls;
}

/**
 * Delete a product image from Storage by its full download URL.
 * Silently ignores errors if the file is already gone.
 */
export async function deleteProductImage(url: string): Promise<void> {
  try {
    // Extract the path from the Storage URL
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // File may have already been deleted — ignore
  }
}
