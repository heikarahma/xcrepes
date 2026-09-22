-- MENU PRODUK BAGIAN 8 (3 produk)

INSERT INTO public.product_menus ("id", "name", "category_id", "category_name", "image", "price", "promo_type", "promo_amount", "ingredients", "toppings", "created_at", "updated_at")
VALUES
('MENU-031', 'Ice Cream Cone', 'CAT-004', 'Desert', '', 8000, 'none', 0, '[{"quantity":"80","unitName":"Gram","rawMaterialId":"RAW-019","rawMaterialName":"Ice Cream"},{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-024","rawMaterialName":"Cone"}]'::jsonb, '[]'::jsonb, '2026-09-16T05:16:56.823+00:00', '2026-09-16T05:16:56.823+00:00'),
('MENU-032', 'Ice Cup Mix', 'CAT-004', 'Desert', '', 8000, 'none', 0, '[{"quantity":"80","unitName":"Gram","rawMaterialId":"RAW-019","rawMaterialName":"Ice Cream"},{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-042","rawMaterialName":"Cup Xcrepes"},{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-029","rawMaterialName":"Sendok Plastik"}]'::jsonb, '[]'::jsonb, '2026-09-16T05:23:10.115+00:00', '2026-09-16T05:23:10.115+00:00'),
('MENU-033', 'Ice Crepes Cup', 'CAT-004', 'Dessert', '', 10000, 'none', 0, '[{"quantity":"80","unitName":"Gram","rawMaterialId":"RAW-019","rawMaterialName":"Ice Cream"},{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-042","rawMaterialName":"Cup Xcrepes"},{"quantity":"44","unitName":"Gram","rawMaterialId":"RAW-001","rawMaterialName":"Adonan"},{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-029","rawMaterialName":"Sendok Plastik"}]'::jsonb, '[]'::jsonb, '2026-09-16T05:25:48.767+00:00', '2026-09-16T05:25:48.767+00:00')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name",
  "category_id" = EXCLUDED."category_id",
  "category_name" = EXCLUDED."category_name",
  "image" = EXCLUDED."image",
  "price" = EXCLUDED."price",
  "promo_type" = EXCLUDED."promo_type",
  "promo_amount" = EXCLUDED."promo_amount",
  "ingredients" = EXCLUDED."ingredients",
  "toppings" = EXCLUDED."toppings",
  "created_at" = EXCLUDED."created_at",
  "updated_at" = EXCLUDED."updated_at";
