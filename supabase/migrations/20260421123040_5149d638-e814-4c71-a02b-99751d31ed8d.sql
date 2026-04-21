
-- Fix function search_path (set_updated_at)
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Tighten storage SELECT: only allow direct object access, not listing.
-- We do this by removing the broad SELECT policy. Public buckets still allow
-- direct URL reads via the storage CDN regardless of RLS.
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;

-- Seed demo products
INSERT INTO public.products (name, category, description, images, in_stock, is_new, is_trending, tags) VALUES
('Heritage Teak Entrance Door', 'doors', 'Solid teak double-leaf entrance door with hand-finished grain and brass-bushed hinges. Engineered for humid climates with anti-warp core.', ARRAY['/src/assets/cat-doors.jpg'], true, true, true, ARRAY['solid wood','entrance','premium']),
('Flush Veneer Interior Door', 'doors', 'Lightweight engineered flush door with natural walnut veneer finish. Sound-dampening honeycomb core, ready for site polishing.', ARRAY['/src/assets/cat-doors.jpg'], true, true, false, ARRAY['interior','veneer']),
('Marine-Grade BWP Plywood 19mm', 'plywood', 'Boiling waterproof plywood, 8x4 ft sheet. ISI 710 grade, dimensionally stable for kitchens, bathrooms and outdoor cabinetry.', ARRAY['/src/assets/cat-plywood.jpg'], true, true, true, ARRAY['waterproof','19mm','BWP']),
('Commercial MR Plywood 12mm', 'plywood', 'Moisture-resistant commercial plywood, 8x4 ft. Reliable workhorse for furniture, partitions and shelving.', ARRAY['/src/assets/cat-plywood.jpg'], true, false, false, ARRAY['12mm','MR','furniture']),
('Soft-Close Concealed Hinge', 'hinges', 'European-style concealed hinge with hydraulic soft-close action. 35mm cup, 110° opening, nickel-plated steel.', ARRAY['/src/assets/cat-hinges.jpg'], true, true, true, ARRAY['soft-close','concealed','imported']),
('Brass Butt Hinge — Antique Finish', 'hinges', 'Solid brass 4-inch butt hinge with hand-aged antique finish. Ideal for heritage doors and statement entryways.', ARRAY['/src/assets/cat-hinges.jpg'], true, false, false, ARRAY['brass','heritage']),
('Modular Kitchen — Onyx Series', 'kitchen_sets', 'Complete modular kitchen with matte black laminate doors, soft-close drawers, and quartz countertop. Custom sized to your layout.', ARRAY['/src/assets/cat-kitchen.jpg'], true, true, true, ARRAY['modular','custom','premium']),
('Pull-Out Pantry Unit', 'kitchen_sets', 'Floor-to-ceiling pull-out pantry with full-extension runners. Maximises corner storage in compact kitchens.', ARRAY['/src/assets/cat-kitchen.jpg'], true, false, false, ARRAY['storage','accessory']),
('Walnut Wood-Grain Laminate', 'laminates', '1mm decorative laminate with deep walnut grain. Anti-fingerprint matte texture, suitable for cabinets and wardrobes.', ARRAY['/src/assets/cat-laminates.jpg'], true, true, true, ARRAY['wood-grain','matte','1mm']),
('Carrara Marble Laminate', 'laminates', 'High-pressure laminate mimicking polished Carrara marble. Perfect for kitchen backsplashes and feature walls.', ARRAY['/src/assets/cat-laminates.jpg'], true, true, false, ARRAY['stone','glossy']),
('Smoked Oak Laminate', 'laminates', 'Rustic smoked oak finish with pronounced grain texture. Adds warmth to modern dark interiors.', ARRAY['/src/assets/cat-laminates.jpg'], true, false, true, ARRAY['wood-grain','rustic']),
('MDF Board Pre-Laminated 18mm', 'cupboard_materials', 'Dual-side pre-laminated MDF, 8x4 ft. Smooth surface ready for cabinetry, with edge-banding compatible.', ARRAY['/src/assets/cat-plywood.jpg'], true, false, false, ARRAY['MDF','18mm']),
('Particle Board with Membrane Foil', 'cupboard_materials', 'Cost-effective particle board with PVC membrane finish. Ideal for budget wardrobes and storage units.', ARRAY['/src/assets/cat-plywood.jpg'], true, false, false, ARRAY['particle-board']),
('Telescopic Drawer Channel — 18 inch', 'hardware', 'Ball-bearing full-extension drawer channel rated for 45 kg. Smooth, silent, lifetime tested for 80,000 cycles.', ARRAY['/src/assets/cat-hinges.jpg'], true, true, false, ARRAY['drawer','channel']),
('Wardrobe Lift Mechanism', 'hardware', 'Pull-down wardrobe rod for high storage. Spring-assisted, 10kg capacity, brings hanging clothes within easy reach.', ARRAY['/src/assets/cat-hinges.jpg'], true, false, true, ARRAY['wardrobe','accessory']);
