import doors from "@/assets/cat-doors.jpg";
import plywood from "@/assets/cat-plywood.jpg";
import hinges from "@/assets/cat-hinges.jpg";
import kitchen from "@/assets/cat-kitchen.jpg";
import laminates from "@/assets/cat-laminates.jpg";

export type CategoryKey =
  | "doors"
  | "plywood"
  | "hinges"
  | "kitchen_sets"
  | "laminates"
  | "cupboard_materials"
  | "hardware";

export const CATEGORIES: Array<{
  key: CategoryKey;
  label: string;
  blurb: string;
  image: string;
}> = [
  { key: "doors", label: "Doors", blurb: "Solid, flush & designer", image: doors },
  { key: "plywood", label: "Plywood", blurb: "BWP, MR & commercial", image: plywood },
  { key: "kitchen_sets", label: "Kitchen Sets", blurb: "Modular, custom-fitted", image: kitchen },
  { key: "laminates", label: "Laminates", blurb: "Wood, stone & matte", image: laminates },
  { key: "hinges", label: "Hinges", blurb: "Soft-close & heritage", image: hinges },
  { key: "cupboard_materials", label: "Cupboard Materials", blurb: "MDF, particle, membrane", image: plywood },
  { key: "hardware", label: "Hardware", blurb: "Channels, locks, accessories", image: hinges },
];

export const CATEGORY_LABEL: Record<CategoryKey, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label])
) as Record<CategoryKey, string>;

/** Map a stored image path (e.g. "/src/assets/cat-doors.jpg") to a runtime URL.
 *  Falls back to category-image, then a generic placeholder. */
const ASSET_BY_FILENAME: Record<string, string> = {
  "cat-doors.jpg": doors,
  "cat-plywood.jpg": plywood,
  "cat-hinges.jpg": hinges,
  "cat-kitchen.jpg": kitchen,
  "cat-laminates.jpg": laminates,
};

const CATEGORY_FALLBACK: Record<CategoryKey, string> = {
  doors,
  plywood,
  hinges,
  kitchen_sets: kitchen,
  laminates,
  cupboard_materials: plywood,
  hardware: hinges,
};

export function resolveImage(src: string | undefined, category?: CategoryKey): string {
  if (!src) return category ? CATEGORY_FALLBACK[category] : doors;
  if (src.startsWith("http")) return src;
  const filename = src.split("/").pop() ?? "";
  if (ASSET_BY_FILENAME[filename]) return ASSET_BY_FILENAME[filename];
  return category ? CATEGORY_FALLBACK[category] : doors;
}