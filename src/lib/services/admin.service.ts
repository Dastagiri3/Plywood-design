/**
 * admin.service.ts
 * Helpers for admin management in Firestore.
 *
 * The admin pattern: a document at /admins/{uid} means that user is an admin.
 * The document itself needs no fields — its existence is the permission.
 *
 * IMPORTANT: Admin write operations should be performed via the Firebase Console
 * or a trusted server environment (Firebase Admin SDK), NOT from the client.
 * These read helpers are safe to use client-side.
 */

import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

const COL = "admins";

/**
 * Check if a given UID has the admin role.
 * Returns true if the /admins/{uid} document exists.
 */
export async function checkIsAdmin(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, COL, uid));
  return snap.exists();
}

/**
 * Grant admin access to a user by UID.
 * Can only be called by an existing admin (enforced by Firestore rules).
 */
export async function grantAdmin(uid: string): Promise<void> {
  await setDoc(doc(db, COL, uid), {
    granted_at: new Date().toISOString(),
  });
}

/**
 * Revoke admin access from a user by UID.
 * Can only be called by an existing admin (enforced by Firestore rules).
 */
export async function revokeAdmin(uid: string): Promise<void> {
  await deleteDoc(doc(db, COL, uid));
}
