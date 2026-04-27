/**
 * products.service.ts
 * Typed Firestore CRUD layer for the /products collection.
 * Import these functions in pages/components instead of calling
 * Firestore APIs directly to keep logic centralised.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import type { Product, ProductCategory } from "@/integrations/firebase/types";

const COL = "products";

// ─── Read ─────────────────────────────────────────────────────────────────────

/** Fetch a single product by its Firestore document ID. */
export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

/** List products with optional filters. */
export async function listProducts(opts?: {
  category?: ProductCategory;
  isNew?: boolean;
  isTrending?: boolean;
  limitTo?: number;
}): Promise<Product[]> {
  const constraints: QueryConstraint[] = [orderBy("created_at", "desc")];

  if (opts?.category) constraints.unshift(where("category", "==", opts.category));
  if (opts?.isNew !== undefined) constraints.unshift(where("is_new", "==", opts.isNew));
  if (opts?.isTrending !== undefined) constraints.unshift(where("is_trending", "==", opts.isTrending));
  if (opts?.limitTo) constraints.push(limit(opts.limitTo));

  const snap = await getDocs(query(collection(db, COL), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
}

/** Fetch products in the same category, excluding a specific product (for related). */
export async function getRelatedProducts(
  category: ProductCategory,
  excludeId: string,
  count = 4
): Promise<Product[]> {
  const snap = await getDocs(
    query(collection(db, COL), where("category", "==", category), limit(count + 1))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Product)
    .filter((p) => p.id !== excludeId)
    .slice(0, count);
}

// ─── Write ────────────────────────────────────────────────────────────────────

export type ProductPayload = Omit<Product, "id" | "created_at" | "updated_at">;

/** Create a new product. Returns the new document ID. */
export async function createProduct(payload: ProductPayload): Promise<string> {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, COL), {
    ...payload,
    created_at: now,
    updated_at: now,
  });
  return ref.id;
}

/** Update an existing product by ID. */
export async function updateProduct(id: string, payload: Partial<ProductPayload>): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    ...payload,
    updated_at: new Date().toISOString(),
  });
}

/** Delete a product by ID. */
export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
