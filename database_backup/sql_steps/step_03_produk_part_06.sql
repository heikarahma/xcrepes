-- MENU PRODUK BAGIAN 6 (3 produk)

INSERT INTO public.product_menus ("id", "name", "category_id", "category_name", "image", "price", "promo_type", "promo_amount", "ingredients", "toppings", "created_at", "updated_at")
VALUES
('MENU-025', 'Mini Crepes Blueberry', 'CAT-003', 'Mini Crepes', '', 8000, 'none', 0, '[{"quantity":"44","unitName":"Gram","rawMaterialId":"RAW-001","rawMaterialName":"Adonan"},{"quantity":"15","unitName":"Gram","rawMaterialId":"RAW-006","rawMaterialName":"Selai Blueberry"}]'::jsonb, '[]'::jsonb, '2026-09-16T03:52:04.555+00:00', '2026-09-16T03:52:04.555+00:00'),
('MENU-026', 'Mini Crepes Cheese', 'CAT-003', 'Mini Crepes', '', 9000, 'none', 0, '[{"quantity":"44","unitName":"Gram","rawMaterialId":"RAW-001","rawMaterialName":"Adonan"},{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-003","rawMaterialName":"Cheese"}]'::jsonb, '[]'::jsonb, '2026-09-16T04:50:07.608+00:00', '2026-09-16T04:50:07.61+00:00'),
('MENU-027', 'Mini Crepes Milk', 'CAT-003', 'Mini Crepes', '', 8000, 'none', 0, '[{"quantity":"44","unitName":"Gram","rawMaterialId":"RAW-001","rawMaterialName":"Adonan"},{"quantity":"15","unitName":"Gram","rawMaterialId":"RAW-014","rawMaterialName":"Milk"}]'::jsonb, '[]'::jsonb, '2026-09-16T04:51:40.648+00:00', '2026-09-16T04:51:40.648+00:00')
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
