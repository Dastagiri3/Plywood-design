/**
 * seed.js
 * ───────────────────────────────────────────────────────────────
 * Populates Firestore with demo products for Kalpana Hardware.
 *
 * Usage (run once from the project root):
 *   node scripts/seed.js
 *
 * Requirements:
 *   1. Create a file  scripts/serviceAccountKey.json  with your
 *      Firebase Admin SDK service account credentials.
 *      (Firebase Console → Project Settings → Service accounts → Generate new private key)
 *   2. Install the Admin SDK:  npm install firebase-admin
 *
 * WARNING: This will ADD documents to your Firestore database.
 *          Run only once, or clear the 'products' collection first.
 * ───────────────────────────────────────────────────────────────
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const now = new Date().toISOString();

const PRODUCTS = [
  // ── Plywood ──────────────────────────────────────────────────
  {
    name: "BWP Marine Grade Plywood 18mm",
    category: "plywood",
    description:
      "IS:710 certified boiling waterproof plywood ideal for kitchens, bathrooms, and high-humidity areas. Manufactured with phenol formaldehyde resin for maximum durability. Available in 8×4 ft sheets.",
    tags: ["bwp", "marine", "18mm", "IS:710", "kitchen"],
    images: [],
    in_stock: true,
    is_new: true,
    is_trending: true,
    created_at: now,
    updated_at: now,
  },
  {
    name: "Commercial MR Plywood 12mm",
    category: "plywood",
    description:
      "Moisture-resistant commercial plywood suitable for interior furniture, partitions, and general construction. Smooth sanded finish on both faces. Cost-effective choice for large projects.",
    tags: ["mr", "commercial", "12mm", "interior", "furniture"],
    images: [],
    in_stock: true,
    is_new: false,
    is_trending: false,
    created_at: now,
    updated_at: now,
  },
  {
    name: "Gurjan Core Plywood 19mm",
    category: "plywood",
    description:
      "Premium gurjan core plywood with exceptional screw-holding capacity. Perfect for structural work, flooring, and heavy-duty shelving. Termite and borer resistant.",
    tags: ["gurjan", "19mm", "structural", "premium"],
    images: [],
    in_stock: true,
    is_new: false,
    is_trending: true,
    created_at: now,
    updated_at: now,
  },
  // ── Doors ────────────────────────────────────────────────────
  {
    name: "Solid Teak Wood Panel Door",
    category: "doors",
    description:
      "Hand-crafted solid teak wood door with a traditional raised panel design. Natural wood grain finish, pre-drilled for standard hardware. Available in custom sizes from 6ft × 2.5ft to 7ft × 3.5ft.",
    tags: ["teak", "solid wood", "panel", "traditional", "custom size"],
    images: [],
    in_stock: true,
    is_new: true,
    is_trending: false,
    created_at: now,
    updated_at: now,
  },
  {
    name: "Flush Door with PVC Film",
    category: "doors",
    description:
      "Engineered wood flush door with PVC foil wrap in a woodgrain finish. Lightweight, warp-resistant, and low maintenance. Suitable for bedrooms, bathrooms, and utility rooms.",
    tags: ["flush", "pvc", "woodgrain", "interior", "lightweight"],
    images: [],
    in_stock: true,
    is_new: false,
    is_trending: true,
    created_at: now,
    updated_at: now,
  },
  {
    name: "Designer Glass Panel Door",
    category: "doors",
    description:
      "Contemporary door with frosted glass inserts set in an engineered wood frame. Adds light and visual depth to interiors. Available with clear, frosted, or tinted glass panels.",
    tags: ["designer", "glass", "contemporary", "frosted", "modern"],
    images: [],
    in_stock: false,
    is_new: true,
    is_trending: false,
    created_at: now,
    updated_at: now,
  },
  // ── Laminates ────────────────────────────────────────────────
  {
    name: "Matte Finish Laminate 1mm — Stone Grey",
    category: "laminates",
    description:
      "Sophisticated stone grey matte laminate with low-glare surface. Anti-fingerprint coating makes it ideal for kitchen shutters, wardrobe exteriors, and TV unit panels.",
    tags: ["matte", "stone grey", "1mm", "anti-fingerprint", "wardrobe"],
    images: [],
    in_stock: true,
    is_new: true,
    is_trending: true,
    created_at: now,
    updated_at: now,
  },
  {
    name: "Wood Grain Laminate — Walnut Dark",
    category: "laminates",
    description:
      "Rich dark walnut wood grain laminate for high-pressure applications. Scratch and wear resistant surface. Excellent for premium furniture, cabinets, and feature walls.",
    tags: ["wood grain", "walnut", "dark", "hpl", "premium"],
    images: [],
    in_stock: true,
    is_new: false,
    is_trending: true,
    created_at: now,
    updated_at: now,
  },
  // ── Hinges ───────────────────────────────────────────────────
  {
    name: "Hydraulic Soft-Close Cabinet Hinge",
    category: "hinges",
    description:
      "Premium 35mm cup hydraulic hinge with integrated soft-close damper. Full overlay design, 110° opening, quick-release clip for easy door removal. Sold in pairs.",
    tags: ["soft close", "hydraulic", "35mm", "110°", "quick release"],
    images: [],
    in_stock: true,
    is_new: false,
    is_trending: true,
    created_at: now,
    updated_at: now,
  },
  {
    name: "Stainless Steel Butt Hinge — Heavy Duty",
    category: "hinges",
    description:
      "Grade 304 stainless steel butt hinge for exterior and heavy doors. Ball bearing mechanism for smooth operation and long service life. Available in 3\", 4\", and 5\" sizes.",
    tags: ["stainless steel", "butt hinge", "grade 304", "exterior", "heavy duty"],
    images: [],
    in_stock: true,
    is_new: false,
    is_trending: false,
    created_at: now,
    updated_at: now,
  },
  // ── Kitchen Sets ─────────────────────────────────────────────
  {
    name: "Modular Kitchen — Ivory White Acrylic",
    category: "kitchen_sets",
    description:
      "Complete modular kitchen set with high-gloss ivory white acrylic shutters on a BWP plywood carcass. Includes base units, wall units, and a 3-metre breakfast counter. Soft-close hardware throughout.",
    tags: ["modular", "acrylic", "ivory white", "gloss", "complete set"],
    images: [],
    in_stock: true,
    is_new: true,
    is_trending: true,
    created_at: now,
    updated_at: now,
  },
  // ── Cupboard Materials ────────────────────────────────────────
  {
    name: "Pre-laminated MDF Board 18mm",
    category: "cupboard_materials",
    description:
      "High-density MDF board with factory-applied laminate finish on both faces. Ready-to-use for wardrobe shutters, shelving, and drawer fronts — no additional lamination needed.",
    tags: ["mdf", "pre-laminated", "18mm", "wardrobe", "ready to use"],
    images: [],
    in_stock: true,
    is_new: false,
    is_trending: false,
    created_at: now,
    updated_at: now,
  },
  {
    name: "PVC Edge Banding Tape — Walnut 22mm",
    category: "cupboard_materials",
    description:
      "Matching walnut finish PVC edge banding for clean, professional edges on panels and boards. Iron-on adhesive backing. Sold per metre roll (min. 10m).",
    tags: ["edge banding", "pvc", "walnut", "22mm", "iron-on"],
    images: [],
    in_stock: true,
    is_new: false,
    is_trending: false,
    created_at: now,
    updated_at: now,
  },
  // ── Hardware ─────────────────────────────────────────────────
  {
    name: "Telescopic Drawer Channel — Full Extension 500mm",
    category: "hardware",
    description:
      "Heavy-duty full-extension ball-bearing drawer slide, 45kg load capacity. Smooth, quiet operation with self-closing mechanism. Available in 300mm, 400mm, and 500mm lengths.",
    tags: ["drawer slide", "telescopic", "full extension", "500mm", "ball bearing"],
    images: [],
    in_stock: true,
    is_new: false,
    is_trending: true,
    created_at: now,
    updated_at: now,
  },
  {
    name: "SS Mortise Lock Set with Levers",
    category: "hardware",
    description:
      "Stainless steel 3-lever mortise lock set for interior doors. Includes matching lever handles, escutcheon plates, and all fixing hardware. Anti-pick sash for added security.",
    tags: ["mortise lock", "stainless steel", "lever handle", "3-lever", "interior"],
    images: [],
    in_stock: true,
    is_new: true,
    is_trending: false,
    created_at: now,
    updated_at: now,
  },
];

async function seed() {
  console.log(`\n🌱  Seeding ${PRODUCTS.length} products to Firestore…\n`);
  const batch = db.batch();
  const col = db.collection("products");

  for (const product of PRODUCTS) {
    const ref = col.doc(); // auto-ID
    batch.set(ref, product);
    console.log(`  ✓  ${product.name}`);
  }

  await batch.commit();
  console.log(`\n✅  Done! ${PRODUCTS.length} products added.\n`);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
