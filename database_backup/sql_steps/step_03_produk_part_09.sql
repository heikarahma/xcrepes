-- MENU PRODUK BAGIAN 9 (3 produk)

INSERT INTO public.product_menus ("id", "name", "category_id", "category_name", "image", "price", "promo_type", "promo_amount", "ingredients", "toppings", "created_at", "updated_at")
VALUES
('MENU-034', 'Ice Crepes Cup Top', 'CAT-004', 'Dessert', '', 13000, 'none', 0, '[{"quantity":"80","unitName":"Gram","rawMaterialId":"RAW-019","rawMaterialName":"Ice Cream"},{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-042","rawMaterialName":"Cup Xcrepes"},{"quantity":"44","unitName":"Gram","rawMaterialId":"RAW-001","rawMaterialName":"Adonan"},{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-029","rawMaterialName":"Sendok Plastik"},{"quantity":"3","unitName":"Gram","rawMaterialId":"RAW-020","rawMaterialName":"Chacha"},{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-025","rawMaterialName":"Choco Stick"}]'::jsonb, '[]'::jsonb, '2026-09-16T05:38:13.073+00:00', '2026-09-16T05:38:13.074+00:00'),
('MENU-035', 'Ice cream crepes', 'CAT-004', 'Dessert', '', 20000, 'none', 0, '[{"quantity":"88","unitName":"Gram","rawMaterialId":"RAW-001","rawMaterialName":"Adonan"},{"quantity":"160","unitName":"Gram","rawMaterialId":"RAW-019","rawMaterialName":"Ice Cream"},{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-029","rawMaterialName":"Sendok Plastik"},{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-013","rawMaterialName":"pisang"}]'::jsonb, '[]'::jsonb, '2026-09-16T05:44:31.275+00:00', '2026-09-16T05:44:31.275+00:00'),
('MENU-036', 'Ice Cream Crepes Top', 'CAT-004', 'Dessert', '', 22000, 'none', 0, '[{"quantity":"88","unitName":"Gram","rawMaterialId":"RAW-001","rawMaterialName":"Adonan"},{"quantity":"160","unitName":"Gram","rawMaterialId":"RAW-019","rawMaterialName":"Ice Cream"},{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-029","rawMaterialName":"Sendok Plastik"},{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-013","rawMaterialName":"pisang"},{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-022","rawMaterialName":"Yupi"},{"quantity":"3","unitName":"Gram","rawMaterialId":"RAW-020","rawMaterialName":"Chacha"},{"quantity":"1","unitName":"Batang","rawMaterialId":"RAW-023","rawMaterialName":"Astor"}]'::jsonb, '[]'::jsonb, '2026-09-16T05:50:04.423+00:00', '2026-09-16T05:50:04.423+00:00')
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
