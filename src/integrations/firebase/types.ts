// Shared TypeScript types mirroring the Firestore collections.
// products  → /products/{id}
// inquiries → /inquiries/{id}
// admins    → /admins/{uid}  (plain doc, no fields required — presence = admin)

export type ProductCategory =
  | "doors"
  | "plywood"
  | "hinges"
  | "kitchen_sets"
  | "laminates"
  | "cupboard_materials"
  | "hardware";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  images: string[];
  in_stock: boolean;
  is_new: boolean;
  is_trending: boolean;
  tags: string[];
  created_at: string; // ISO string stored as a field
  updated_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  product_id: string | null;
  status: "new" | "responded" | "archived";
  created_at: string; // ISO string
}
