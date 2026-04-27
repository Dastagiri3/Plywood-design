/**
 * inquiries.service.ts
 * Typed Firestore service layer for the /inquiries collection.
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import type { Inquiry } from "@/integrations/firebase/types";

const COL = "inquiries";

// ─── Read ─────────────────────────────────────────────────────────────────────

/** Fetch all inquiries, newest first. */
export async function listInquiries(): Promise<Inquiry[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy("created_at", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Inquiry);
}

/** Fetch inquiries filtered by status. */
export async function listInquiriesByStatus(
  status: Inquiry["status"]
): Promise<Inquiry[]> {
  const snap = await getDocs(
    query(collection(db, COL), where("status", "==", status), orderBy("created_at", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Inquiry);
}

// ─── Write ────────────────────────────────────────────────────────────────────

export type InquiryPayload = {
  name: string;
  phone: string;
  email: string | null;
  message: string;
  product_id: string | null;
};

/**
 * Submit a new customer inquiry from the public site.
 * Status defaults to "new".
 */
export async function createInquiry(payload: InquiryPayload): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...payload,
    status: "new",
    created_at: new Date().toISOString(),
  });
  return ref.id;
}

/**
 * Update the status of an inquiry (admin action).
 * Valid statuses: "new" | "responded" | "archived"
 */
export async function setInquiryStatus(
  id: string,
  status: Inquiry["status"]
): Promise<void> {
  await updateDoc(doc(db, COL, id), { status });
}
