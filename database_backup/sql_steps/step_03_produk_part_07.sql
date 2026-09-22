-- MENU PRODUK BAGIAN 7 (3 produk)

INSERT INTO public.product_menus ("id", "name", "category_id", "category_name", "image", "price", "promo_type", "promo_amount", "ingredients", "toppings", "created_at", "updated_at")
VALUES
('MENU-028', 'Mini crepes Oreo', 'CAT-003', 'Mini Crepes', '', 8000, 'none', 0, '[{"quantity":"44","unitName":"Gram","rawMaterialId":"RAW-001","rawMaterialName":"Adonan"},{"quantity":"1","unitName":"Bungkus","rawMaterialId":"RAW-004","rawMaterialName":"Oreo"}]'::jsonb, '[]'::jsonb, '2026-09-16T04:55:31.104+00:00', '2026-09-16T04:55:31.104+00:00'),
('MENU-029', 'Mini Crepes Peanut', 'CAT-003', 'Mini Crepes', '', 8000, 'none', 0, '[{"quantity":"44","unitName":"Gram","rawMaterialId":"RAW-001","rawMaterialName":"Adonan"},{"quantity":"15","unitName":"Gram","rawMaterialId":"RAW-007","rawMaterialName":"Selai Peanut"}]'::jsonb, '[]'::jsonb, '2026-09-16T05:00:57.745+00:00', '2026-09-16T05:00:57.747+00:00'),
('MENU-030', 'Mini Crepes Strawberry', 'CAT-003', 'Mini Crepes', '', 8000, 'none', 0, '[{"quantity":"44","unitName":"Gram","rawMaterialId":"RAW-001","rawMaterialName":"Adonan"},{"quantity":"15","unitName":"Gram","rawMaterialId":"RAW-005","rawMaterialName":"Selai strawberry"}]'::jsonb, '[]'::jsonb, '2026-09-16T05:05:00.373+00:00', '2026-09-16T05:05:00.373+00:00')
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
