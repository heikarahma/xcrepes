-- MASTER DATA UMUM

-- Tabel: units (5 baris)
INSERT INTO public.units ("id", "name", "created_at", "updated_at")
VALUES
('UOM-001', 'Gram', '2026-09-11T03:30:28.463+00:00', '2026-09-11T03:30:28.463+00:00'),
('UOM-003', 'Batang', '2026-09-11T03:31:00.7+00:00', '2026-09-11T03:31:00.7+00:00'),
('UOM-004', 'Mili Liter', '2026-09-11T03:31:24.795+00:00', '2026-09-11T03:31:49.032+00:00'),
('UOM-005', 'Bungkus', '2026-09-11T04:33:18.558+00:00', '2026-09-11T04:33:18.558+00:00'),
('UOM-002', 'Pcs', '2026-09-11T03:30:40.925+00:00', '2026-09-11T04:33:27.981+00:00')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name",
  "created_at" = EXCLUDED."created_at",
  "updated_at" = EXCLUDED."updated_at";

-- Tabel: categories (5 baris)
INSERT INTO public.categories ("id", "name", "description", "created_at", "updated_at")
VALUES
('CAT-001', 'Crepes Manis', '', '2026-09-11T03:32:12.679+00:00', '2026-09-11T03:32:12.679+00:00'),
('CAT-002', 'Crepes Asin', '', '2026-09-11T03:32:34.766+00:00', '2026-09-11T03:32:34.766+00:00'),
('CAT-003', 'Mini Crepes', '', '2026-09-11T03:32:43.837+00:00', '2026-09-11T03:32:43.837+00:00'),
('CAT-005', 'Packaging', '', '2026-09-11T03:35:38.25+00:00', '2026-09-11T03:35:38.25+00:00'),
('CAT-004', 'Dessert', '', '2026-09-11T03:33:28.149+00:00', '2026-09-16T05:23:21.346+00:00')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "created_at" = EXCLUDED."created_at",
  "updated_at" = EXCLUDED."updated_at";

-- Tabel: raw_materials (43 baris)
INSERT INTO public.raw_materials ("id", "name", "unit_name", "stock", "price_per_unit", "min_stock", "note", "created_at", "updated_at")
VALUES
('RAW-007', 'Selai Peanut', 'Gram', 322, 50, 10, '', '2026-09-11T05:44:30.078+00:00', '2026-09-11T05:44:30.078+00:00'),
('RAW-008', 'Selai Srikaya', 'Gram', 1408, 50, 10, '', '2026-09-11T05:48:04.76+00:00', '2026-09-11T05:48:04.76+00:00'),
('RAW-010', 'Silverqueen', 'Bungkus', 7, 7500, 10, '', '2026-09-11T06:07:42.731+00:00', '2026-09-11T06:07:42.731+00:00'),
('RAW-004', 'Oreo', 'Bungkus', 21, 800, 10, '', '2026-09-11T05:41:36.669+00:00', '2026-09-17T01:33:56.565+00:00'),
('RAW-009', 'Selai Pistachio K', 'Gram', 200, 425, 10, '', '2026-09-11T05:52:17.071+00:00', '2026-09-11T06:22:09.065+00:00'),
('RAW-012', 'Selai Pistachio', 'Gram', 200, 600, 10, '', '2026-09-11T06:23:04.153+00:00', '2026-09-11T06:23:04.153+00:00'),
('RAW-014', 'Milk', 'Gram', 344, 30, 10, '', '2026-09-11T06:33:38.092+00:00', '2026-09-11T06:33:38.092+00:00'),
('RAW-015', 'Nuttella', 'Gram', 999, 198, 10, '', '2026-09-11T06:34:34.244+00:00', '2026-09-11T06:34:34.244+00:00'),
('RAW-016', 'Choco Crunchy', 'Gram', 1390, 243, 10, '', '2026-09-11T06:36:09.681+00:00', '2026-09-11T06:36:09.681+00:00'),
('RAW-018', 'marsmallow', 'Bungkus', 16, 1000, 10, '', '2026-09-11T06:45:52.883+00:00', '2026-09-11T06:45:52.883+00:00'),
('RAW-019', 'Ice Cream', 'Gram', 841, 30, 10, '', '2026-09-11T06:47:02.537+00:00', '2026-09-11T06:47:02.538+00:00'),
('RAW-020', 'Chacha', 'Gram', 175, 139, 10, '', '2026-09-11T06:48:44.74+00:00', '2026-09-11T06:48:44.74+00:00'),
('RAW-021', 'Kacang tabur', 'Gram', 0, 50, 10, '', '2026-09-11T06:50:34.134+00:00', '2026-09-11T06:50:34.134+00:00'),
('RAW-022', 'Yupi', 'Pcs', 11, 1000, 10, '', '2026-09-11T06:51:08.529+00:00', '2026-09-11T06:51:08.529+00:00'),
('RAW-023', 'Astor', 'Batang', 17, 1000, 10, '', '2026-09-11T06:51:49.054+00:00', '2026-09-11T06:51:49.054+00:00'),
('RAW-024', 'Cone', 'Pcs', 16, 800, 10, '', '2026-09-11T06:52:30.767+00:00', '2026-09-11T06:52:30.767+00:00'),
('RAW-025', 'Choco Stick', 'Pcs', 7, 1000, 10, '', '2026-09-11T06:54:08.865+00:00', '2026-09-11T06:54:08.865+00:00'),
('RAW-026', 'Selai Top Chocolate', 'Gram', 258, 79, 10, '', '2026-09-11T06:55:43.052+00:00', '2026-09-11T06:55:43.052+00:00'),
('RAW-027', 'Selai Top Blueberry', 'Gram', 255, 79, 10, '', '2026-09-11T06:56:15.818+00:00', '2026-09-11T06:56:15.818+00:00'),
('RAW-028', 'Selai Top Strawberry', 'Gram', 292, 79, 10, '', '2026-09-11T06:56:52.915+00:00', '2026-09-11T06:56:52.915+00:00'),
('RAW-029', 'Sendok Plastik', 'Pcs', 23, 500, 10, '', '2026-09-11T06:57:37.469+00:00', '2026-09-11T06:57:37.469+00:00'),
('RAW-030', 'Cherry', 'Pcs', 30, 1000, 10, '', '2026-09-11T06:58:05.801+00:00', '2026-09-11T06:58:05.801+00:00'),
('RAW-031', 'Baking Powder', 'Gram', 45, 200, 10, '', '2026-09-11T07:01:59.235+00:00', '2026-09-11T07:01:59.235+00:00'),
('RAW-032', 'Beef Burger', 'Pcs', 8, 7100, 10, '', '2026-09-11T07:03:21.367+00:00', '2026-09-11T07:03:21.367+00:00'),
('RAW-035', 'Tuna', 'Gram', 8, 3333, 10, '', '2026-09-11T07:05:55.947+00:00', '2026-09-11T07:05:55.947+00:00'),
('RAW-042', 'Cup Xcrepes', 'Pcs', 24, 200, 10, '', '2026-09-11T07:13:11.993+00:00', '2026-09-11T07:13:11.993+00:00'),
('RAW-043', 'Dus Mini', 'Pcs', 11, 500, 10, '', '2026-09-11T07:13:41.246+00:00', '2026-09-11T07:13:41.246+00:00'),
('RAW-011', 'Silverqueen Matcha', 'Bungkus', 10, 7500, 10, '', '2026-09-11T06:08:16.76+00:00', '2026-09-11T07:46:58.476+00:00'),
('RAW-017', 'Ovomaltine', 'Gram', 424, 243, 10, '', '2026-09-11T06:44:53.079+00:00', '2026-09-11T07:49:32.591+00:00'),
('RAW-006', 'Selai Blueberry', 'Gram', 375, 50, 10, '', '2026-09-11T05:43:30.575+00:00', '2026-09-17T01:32:08.297+00:00'),
('RAW-040', 'Cheese Slice', 'Pcs', 6, 1600, 10, '', '2026-09-11T07:10:58.771+00:00', '2026-09-17T01:33:56.566+00:00'),
('RAW-033', 'Smoke Beef', 'Pcs', 11, 3043, 10, '', '2026-09-11T07:04:07.185+00:00', '2026-09-17T01:33:56.565+00:00'),
('RAW-036', 'Lettuce', 'Gram', 257, 200, 10, '', '2026-09-11T07:06:38.997+00:00', '2026-09-17T01:41:36.939+00:00'),
('RAW-038', 'Saos Sambal', 'Gram', 970, 50, 10, '', '2026-09-11T07:09:06.529+00:00', '2026-09-17T01:41:36.938+00:00'),
('RAW-039', 'Mayonaise', 'Gram', 1002, 50, 10, '', '2026-09-11T07:09:51.531+00:00', '2026-09-17T01:41:36.938+00:00'),
('RAW-005', 'Selai strawberry', 'Gram', 567, 50, 10, '', '2026-09-11T05:42:41.164+00:00', '2026-09-17T01:41:36.937+00:00'),
('RAW-034', 'Sosis', 'Pcs', 12, 7000, 10, '', '2026-09-11T07:05:18.153+00:00', '2026-09-17T01:41:36.939+00:00'),
('RAW-013', 'pisang', 'Pcs', 4, 1000, 10, '', '2026-09-11T06:33:08.177+00:00', '2026-09-17T01:41:36.938+00:00'),
('RAW-037', 'Saus Tomat', 'Gram', 699, 50, 10, '', '2026-09-11T07:08:18.88+00:00', '2026-09-17T01:41:36.938+00:00'),
('RAW-002', 'Coklat', 'Bungkus', 42, 1625, 10, '', '2026-09-11T04:27:42.459+00:00', '2026-09-17T01:45:43.104+00:00'),
('RAW-001', 'Adonan', 'Gram', 2240, 67, 10, '', '2026-09-11T03:47:47.657+00:00', '2026-09-17T01:45:43.103+00:00'),
('RAW-003', 'Cheese', 'Pcs', 40, 900, 10, '', '2026-09-11T05:40:39.485+00:00', '2026-09-17T01:45:43.105+00:00'),
('RAW-041', 'Dus Crepes', 'Pcs', 74, 1500, 10, '', '2026-09-11T07:11:26.647+00:00', '2026-09-17T01:45:43.105+00:00')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name",
  "unit_name" = EXCLUDED."unit_name",
  "stock" = EXCLUDED."stock",
  "price_per_unit" = EXCLUDED."price_per_unit",
  "min_stock" = EXCLUDED."min_stock",
  "note" = EXCLUDED."note",
  "created_at" = EXCLUDED."created_at",
  "updated_at" = EXCLUDED."updated_at";

-- Tabel: toppings (30 baris)
INSERT INTO public.toppings ("id", "name", "price", "description", "ingredients", "created_at", "updated_at")
VALUES
('TOP-024', 'Yupi', 2000, '', '[{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-022","rawMaterialName":"Yupi"}]'::jsonb, '2026-09-16T08:20:19.227+00:00', '2026-09-16T08:20:19.227+00:00'),
('TOP-025', 'Top Chocolate', 2000, '', '[{"quantity":"10","unitName":"Gram","rawMaterialId":"RAW-026","rawMaterialName":"Selai Top Chocolate"}]'::jsonb, '2026-09-16T08:22:03.522+00:00', '2026-09-16T08:22:03.522+00:00'),
('TOP-026', 'Top Strawberry', 1997, '', '[{"quantity":"10","unitName":"Gram","rawMaterialId":"RAW-028","rawMaterialName":"Selai Top Strawberry"}]'::jsonb, '2026-09-16T08:24:08.602+00:00', '2026-09-16T08:24:08.602+00:00'),
('TOP-001', 'Chocolate', 4000, '', '[{"quantity":"2","unitName":"Bungkus","rawMaterialId":"RAW-002","rawMaterialName":"Coklat"}]'::jsonb, '2026-09-11T07:22:53.996+00:00', '2026-09-11T07:22:53.996+00:00'),
('TOP-002', 'Selai Strawberry', 4000, '', '[{"quantity":"30","unitName":"Gram","rawMaterialId":"RAW-005","rawMaterialName":"Selai strawberry"}]'::jsonb, '2026-09-11T07:24:11.337+00:00', '2026-09-11T07:24:11.337+00:00'),
('TOP-003', 'Selai Blueberry', 4000, '', '[{"quantity":"30","unitName":"Gram","rawMaterialId":"RAW-006","rawMaterialName":"Selai Blueberry"}]'::jsonb, '2026-09-11T07:36:15.897+00:00', '2026-09-11T07:36:15.897+00:00'),
('TOP-004', 'Milk', 4000, '', '[{"quantity":"30","unitName":"Gram","rawMaterialId":"RAW-014","rawMaterialName":"Milk"}]'::jsonb, '2026-09-11T07:38:23.568+00:00', '2026-09-11T07:38:23.568+00:00'),
('TOP-005', 'Selai Peanut', 4000, '', '[{"quantity":"30","unitName":"Gram","rawMaterialId":"RAW-007","rawMaterialName":"Selai Peanut"}]'::jsonb, '2026-09-11T07:39:38.774+00:00', '2026-09-11T07:39:38.774+00:00'),
('TOP-006', 'Selai srikaya', 4000, '', '[{"quantity":"30","unitName":"Gram","rawMaterialId":"RAW-008","rawMaterialName":"Selai Srikaya"}]'::jsonb, '2026-09-11T07:40:23.048+00:00', '2026-09-11T07:40:32.376+00:00'),
('TOP-007', 'Oreo', 1600, '', '[{"quantity":"2","unitName":"Bungkus","rawMaterialId":"RAW-004","rawMaterialName":"Oreo"}]'::jsonb, '2026-09-11T07:40:59.275+00:00', '2026-09-11T07:40:59.275+00:00'),
('TOP-008', 'Banana', 4000, '', '[{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-013","rawMaterialName":"pisang"}]'::jsonb, '2026-09-11T07:41:36.639+00:00', '2026-09-11T07:41:36.639+00:00'),
('TOP-009', 'Silverqueen', 9000, '', '[{"quantity":"1","unitName":"Bungkus","rawMaterialId":"RAW-010","rawMaterialName":"Silverqueen"}]'::jsonb, '2026-09-11T07:42:17.25+00:00', '2026-09-11T07:42:17.25+00:00'),
('TOP-010', 'Silverqueen Matcha', 9000, '', '[{"quantity":"1","unitName":"Bungkus","rawMaterialId":"RAW-011","rawMaterialName":"Silverqueen Matcha"}]'::jsonb, '2026-09-11T07:46:41.829+00:00', '2026-09-11T07:46:41.829+00:00'),
('TOP-011', 'Nutella', 9000, '', '[{"quantity":"30","unitName":"Gram","rawMaterialId":"RAW-015","rawMaterialName":"Nuttella"}]'::jsonb, '2026-09-11T07:47:51.788+00:00', '2026-09-11T07:48:08.32+00:00'),
('TOP-012', 'Ovomaltine', 9000, '', '[{"quantity":"30","unitName":"Gram","rawMaterialId":"RAW-017","rawMaterialName":"Ovomaltine"}]'::jsonb, '2026-09-11T07:50:24.24+00:00', '2026-09-11T07:50:24.24+00:00'),
('TOP-013', 'Choco Crunchy', 9000, '', '[{"quantity":"27","unitName":"Gram","rawMaterialId":"RAW-016","rawMaterialName":"Choco Crunchy"}]'::jsonb, '2026-09-11T07:51:41.529+00:00', '2026-09-11T07:51:41.529+00:00'),
('TOP-014', 'Pistachio Kunafa', 20000, '', '[{"quantity":"33","unitName":"Gram","rawMaterialId":"RAW-009","rawMaterialName":"Selai Pistachio K"}]'::jsonb, '2026-09-11T07:52:34.015+00:00', '2026-09-11T07:52:34.015+00:00'),
('TOP-015', 'Tuna', 8000, '', '[{"quantity":"1","unitName":"Gram","rawMaterialId":"RAW-035","rawMaterialName":"Tuna"}]'::jsonb, '2026-09-11T07:53:21.194+00:00', '2026-09-11T07:53:21.194+00:00'),
('TOP-016', 'Beef Burger', 8000, '', '[{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-032","rawMaterialName":"Beef Burger"}]'::jsonb, '2026-09-11T07:54:10.058+00:00', '2026-09-11T07:54:10.058+00:00'),
('TOP-017', 'Smoke Beef', 8000, '', '[{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-033","rawMaterialName":"Smoke Beef"}]'::jsonb, '2026-09-11T07:54:56.707+00:00', '2026-09-11T07:54:56.707+00:00'),
('TOP-018', 'Sausage', 8000, '', '[{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-034","rawMaterialName":"Sosis"}]'::jsonb, '2026-09-11T07:55:34.399+00:00', '2026-09-11T07:55:34.399+00:00'),
('TOP-019', 'Cheese Slice', 5000, '', '[{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-040","rawMaterialName":"Cheese Slice"}]'::jsonb, '2026-09-11T07:56:14.514+00:00', '2026-09-11T07:56:14.514+00:00'),
('TOP-020', 'Cheese', 5000, '', '[{"quantity":"2","unitName":"Pcs","rawMaterialId":"RAW-003","rawMaterialName":"Cheese"}]'::jsonb, '2026-09-11T07:56:57.052+00:00', '2026-09-11T07:56:57.052+00:00'),
('TOP-021', 'Dus Crepes', 2000, '', '[{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-041","rawMaterialName":"Dus Crepes"}]'::jsonb, '2026-09-11T07:57:48.765+00:00', '2026-09-15T07:47:46.232+00:00'),
('TOP-022', 'Ice  cream', 7996, '', '[{"quantity":"80","unitName":"Gram","rawMaterialId":"RAW-019","rawMaterialName":"Ice Cream"}]'::jsonb, '2026-09-16T08:18:47.57+00:00', '2026-09-16T08:18:47.57+00:00'),
('TOP-023', 'Chacha', 2000, '', '[{"quantity":"3","unitName":"Gram","rawMaterialId":"RAW-020","rawMaterialName":"Chacha"}]'::jsonb, '2026-09-16T08:19:33.917+00:00', '2026-09-16T08:19:33.917+00:00'),
('TOP-027', 'Top Blueberry', 2000, '', '[{"quantity":"10","unitName":"Gram","rawMaterialId":"RAW-027","rawMaterialName":"Selai Top Blueberry"}]'::jsonb, '2026-09-16T08:27:06.075+00:00', '2026-09-16T08:27:06.075+00:00'),
('TOP-028', 'Astor', 2000, '', '[{"quantity":"1","unitName":"Batang","rawMaterialId":"RAW-023","rawMaterialName":"Astor"}]'::jsonb, '2026-09-16T08:28:39.629+00:00', '2026-09-16T08:28:39.629+00:00'),
('TOP-029', 'Choco Stick', 2000, '', '[{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-025","rawMaterialName":"Choco Stick"}]'::jsonb, '2026-09-16T08:31:10.227+00:00', '2026-09-16T08:31:10.227+00:00'),
('TOP-030', 'Marsmallow', 6000, '', '[{"quantity":"1","unitName":"Bungkus","rawMaterialId":"RAW-018","rawMaterialName":"marsmallow"}]'::jsonb, '2026-09-16T08:35:24.183+00:00', '2026-09-16T08:35:24.183+00:00')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price",
  "description" = EXCLUDED."description",
  "ingredients" = EXCLUDED."ingredients",
  "created_at" = EXCLUDED."created_at",
  "updated_at" = EXCLUDED."updated_at";

-- Tabel: inventory_stock_logs (84 baris)
INSERT INTO public.inventory_stock_logs ("id", "raw_material_id", "raw_material_name", "unit_name", "type", "amount", "previous_stock", "current_stock", "reason", "note", "photo", "reference_invoice", "order_id", "customer_name", "source_menu", "source_type", "topping_name", "user_name", "created_at")
VALUES
('LOG-1789098468249', 'RAW-001', 'Adonan', 'Gram', 'IN', 2724, 0, 2724, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T03:47:48.249+00:00'),
('LOG-1789100862847', 'RAW-002', 'Chocolate', 'Pcs', 'IN', 49, 0, 49, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T04:27:42.847+00:00'),
('LOG-1789105240476', 'RAW-003', 'Cheese', 'Pcs', 'IN', 48, 0, 48, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T05:40:40.476+00:00'),
('LOG-1789105297013', 'RAW-004', 'Oreo', 'Bungkus', 'IN', 22, 0, 22, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T05:41:37.013+00:00'),
('LOG-1789105361857', 'RAW-005', 'Selai strawberry', 'Gram', 'IN', 597, 0, 597, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T05:42:41.857+00:00'),
('LOG-1789105411192', 'RAW-006', 'Selai Blueberry', 'Gram', 'IN', 390, 0, 390, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T05:43:31.192+00:00'),
('LOG-1789105470561', 'RAW-007', 'Selai Peanut', 'Gram', 'IN', 322, 0, 322, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T05:44:30.561+00:00'),
('LOG-1789105685365', 'RAW-008', 'Selai Srikaya', 'Gram', 'IN', 1408, 0, 1408, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T05:48:05.365+00:00'),
('LOG-1789105938171', 'RAW-009', 'Selai Pistachio K', 'Gram', 'IN', 200, 0, 200, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T05:52:18.171+00:00'),
('LOG-1789106863562', 'RAW-010', 'Silverqueen', 'Bungkus', 'IN', 7, 0, 7, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:07:43.562+00:00'),
('LOG-1789106897229', 'RAW-011', 'Silverqueen Matcha', 'Bungkus', 'IN', 10, 0, 10, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:08:17.229+00:00'),
('LOG-1789107784755', 'RAW-012', 'Selai Pistachio', 'Gram', 'IN', 200, 0, 200, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:23:04.755+00:00'),
('LOG-1789108388864', 'RAW-013', 'pisang', 'Pcs', 'IN', 5, 0, 5, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:33:08.864+00:00'),
('LOG-1789108418502', 'RAW-014', 'Milk', 'Gram', 'IN', 344, 0, 344, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:33:38.502+00:00'),
('LOG-1789108474756', 'RAW-015', 'Nuttella', 'Gram', 'IN', 999, 0, 999, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:34:34.756+00:00'),
('LOG-1789108570384', 'RAW-016', 'Choco Crunchy', 'Gram', 'IN', 1390, 0, 1390, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:36:10.384+00:00'),
('LOG-1789109094164', 'RAW-017', 'Ovomaltine', 'Gram', 'IN', 424, 0, 424, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:44:54.164+00:00'),
('LOG-1789109153311', 'RAW-018', 'marsmallow', 'Bungkus', 'IN', 16, 0, 16, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:45:53.311+00:00'),
('LOG-1789109223219', 'RAW-019', 'Ice Cream', 'Gram', 'IN', 841, 0, 841, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:47:03.219+00:00'),
('LOG-1789109324992', 'RAW-020', 'Chacha', 'Gram', 'IN', 175, 0, 175, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:48:44.992+00:00'),
('LOG-1789109468956', 'RAW-022', 'Yupi', 'Pcs', 'IN', 11, 0, 11, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:51:08.956+00:00'),
('LOG-1789109509553', 'RAW-023', 'Astor', 'Batang', 'IN', 17, 0, 17, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:51:49.553+00:00'),
('LOG-1789109551186', 'RAW-024', 'Cone', 'Pcs', 'IN', 16, 0, 16, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:52:31.186+00:00'),
('LOG-1789109649294', 'RAW-025', 'Choco Stick', 'Pcs', 'IN', 7, 0, 7, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:54:09.294+00:00'),
('LOG-1789109743765', 'RAW-026', 'Selai Top Chocolate', 'Gram', 'IN', 258, 0, 258, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:55:43.765+00:00'),
('LOG-1789109776172', 'RAW-027', 'Selai Top Blueberry', 'Gram', 'IN', 255, 0, 255, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:56:16.172+00:00'),
('LOG-1789109813190', 'RAW-028', 'Selai Top Strawberry', 'Gram', 'IN', 292, 0, 292, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:56:53.19+00:00'),
('LOG-1789109857808', 'RAW-029', 'Sendok Plastik', 'Pcs', 'IN', 23, 0, 23, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:57:37.808+00:00'),
('LOG-1789109886123', 'RAW-030', 'Cherry', 'Pcs', 'IN', 30, 0, 30, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T06:58:06.123+00:00'),
('LOG-1789110120226', 'RAW-031', 'Baking Powder', 'Gram', 'IN', 45, 0, 45, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T07:02:00.226+00:00'),
('LOG-1789110201686', 'RAW-032', 'Beef Burger', 'Pcs', 'IN', 8, 0, 8, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T07:03:21.686+00:00'),
('LOG-1789110247729', 'RAW-033', 'Smoke Beef', 'Pcs', 'IN', 13, 0, 13, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T07:04:07.729+00:00'),
('LOG-1789110318586', 'RAW-034', 'Sosis', 'Pcs', 'IN', 13, 0, 13, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T07:05:18.586+00:00'),
('LOG-1789110356355', 'RAW-035', 'Tuna', 'Gram', 'IN', 8, 0, 8, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T07:05:56.355+00:00'),
('LOG-1789110399242', 'RAW-036', 'Lettuce', 'Gram', 'IN', 272, 0, 272, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T07:06:39.242+00:00'),
('LOG-1789110499408', 'RAW-037', 'Saus Tomat', 'Gram', 'IN', 705, 0, 705, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T07:08:19.408+00:00'),
('LOG-1789110546781', 'RAW-038', 'Saos Sambal', 'Gram', 'IN', 976, 0, 976, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T07:09:06.781+00:00'),
('LOG-1789110591862', 'RAW-039', 'Mayonaise', 'Gram', 'IN', 1008, 0, 1008, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T07:09:51.862+00:00'),
('LOG-1789110659162', 'RAW-040', 'Cheese Slice', 'Pcs', 'IN', 8, 0, 8, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T07:10:59.162+00:00'),
('LOG-1789110687350', 'RAW-041', 'Dus Crepes', 'Pcs', 'IN', 81, 0, 81, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T07:11:27.35+00:00'),
('LOG-1789110792632', 'RAW-042', 'Cup Xcrepes', 'Pcs', 'IN', 24, 0, 24, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T07:13:12.632+00:00'),
('LOG-1789110821436', 'RAW-043', 'Dus Mini', 'Pcs', 'IN', 11, 0, 11, NULL, 'Saldo awal penambahan bahan baku baru', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Admin', '2026-09-11T07:13:41.436+00:00'),
('LOG-1789608680873-ainxpi', 'RAW-001', 'Adonan', 'Gram', 'OUT', 88, 2724, 2636, NULL, 'Pemakaian resep menu "Crepes Chocolate" (1x) - Pesanan #INV-678157', NULL, 'INV-678157', 'ORD-1789608678157', 'Pelanggan Umum', 'Crepes Chocolate', 'MENU', NULL, 'Deri', '2026-09-17T01:31:18.157+00:00'),
('LOG-1789608680873-n2mdy2', 'RAW-002', 'Coklat', 'Bungkus', 'OUT', 2, 49, 47, NULL, 'Pemakaian resep menu "Crepes Chocolate" (1x) - Pesanan #INV-678157', NULL, 'INV-678157', 'ORD-1789608678157', 'Pelanggan Umum', 'Crepes Chocolate', 'MENU', NULL, 'Deri', '2026-09-17T01:31:18.157+00:00'),
('LOG-1789608680873-d2jwbk', 'RAW-041', 'Dus Crepes', 'Pcs', 'OUT', 1, 81, 80, NULL, 'Pemakaian extra topping "Dus Crepes" pada "Crepes Chocolate" (Pesanan #INV-678157)', NULL, 'INV-678157', 'ORD-1789608678157', 'Pelanggan Umum', 'Crepes Chocolate', 'TOPPING', 'Dus Crepes', 'Deri', '2026-09-17T01:31:18.157+00:00'),
('LOG-1789608683168-v4q8ob', 'RAW-001', 'Adonan', 'Gram', 'OUT', 88, 2724, 2636, NULL, 'Pemakaian resep menu "Crepes Chocolate" (1x) - Pesanan #INV-681718', NULL, 'INV-681718', 'ORD-1789608681718', 'Pelanggan Umum', 'Crepes Chocolate', 'MENU', NULL, 'Deri', '2026-09-17T01:31:21.718+00:00'),
('LOG-1789608683169-eswefb', 'RAW-002', 'Coklat', 'Bungkus', 'OUT', 2, 49, 47, NULL, 'Pemakaian resep menu "Crepes Chocolate" (1x) - Pesanan #INV-681718', NULL, 'INV-681718', 'ORD-1789608681718', 'Pelanggan Umum', 'Crepes Chocolate', 'MENU', NULL, 'Deri', '2026-09-17T01:31:21.718+00:00'),
('LOG-1789608683169-x8o0fi', 'RAW-041', 'Dus Crepes', 'Pcs', 'OUT', 1, 81, 80, NULL, 'Pemakaian extra topping "Dus Crepes" pada "Crepes Chocolate" (Pesanan #INV-681718)', NULL, 'INV-681718', 'ORD-1789608681718', 'Pelanggan Umum', 'Crepes Chocolate', 'TOPPING', 'Dus Crepes', 'Deri', '2026-09-17T01:31:21.718+00:00'),
('LOG-1789608728297-ome68i', 'RAW-001', 'Adonan', 'Gram', 'OUT', 44, 2636, 2592, NULL, 'Pemakaian resep menu "Mini Crepes Blueberry" (1x) - Pesanan #INV-727950', NULL, 'INV-727950', 'ORD-1789608727950', 'Pelanggan Umum', 'Mini Crepes Blueberry', 'MENU', NULL, 'Deri', '2026-09-17T01:32:07.95+00:00'),
('LOG-1789608728297-10jp1q', 'RAW-006', 'Selai Blueberry', 'Gram', 'OUT', 15, 390, 375, NULL, 'Pemakaian resep menu "Mini Crepes Blueberry" (1x) - Pesanan #INV-727950', NULL, 'INV-727950', 'ORD-1789608727950', 'Pelanggan Umum', 'Mini Crepes Blueberry', 'MENU', NULL, 'Deri', '2026-09-17T01:32:07.95+00:00'),
('LOG-1789608836564-lxti7h', 'RAW-001', 'Adonan', 'Gram', 'OUT', 44, 2592, 2548, NULL, 'Pemakaian resep menu "Mini crepes Oreo" (1x) - Pesanan #INV-835817', NULL, 'INV-835817', 'ORD-1789608835817', 'Pelanggan Umum', 'Mini crepes Oreo', 'MENU', NULL, 'Deri', '2026-09-17T01:33:55.817+00:00'),
('LOG-1789608836564-7kw2m4', 'RAW-004', 'Oreo', 'Bungkus', 'OUT', 1, 22, 21, NULL, 'Pemakaian resep menu "Mini crepes Oreo" (1x) - Pesanan #INV-835817', NULL, 'INV-835817', 'ORD-1789608835817', 'Pelanggan Umum', 'Mini crepes Oreo', 'MENU', NULL, 'Deri', '2026-09-17T01:33:55.817+00:00'),
('LOG-1789608836564-4si3ul', 'RAW-001', 'Adonan', 'Gram', 'OUT', 176, 2548, 2372, NULL, 'Pemakaian resep menu "Smoke Beef Salad Cheese" (2x) - Pesanan #INV-835817', NULL, 'INV-835817', 'ORD-1789608835817', 'Pelanggan Umum', 'Smoke Beef Salad Cheese', 'MENU', NULL, 'Deri', '2026-09-17T01:33:55.817+00:00'),
('LOG-1789608836564-j1qo8r', 'RAW-033', 'Smoke Beef', 'Pcs', 'OUT', 2, 13, 11, NULL, 'Pemakaian resep menu "Smoke Beef Salad Cheese" (2x) - Pesanan #INV-835817', NULL, 'INV-835817', 'ORD-1789608835817', 'Pelanggan Umum', 'Smoke Beef Salad Cheese', 'MENU', NULL, 'Deri', '2026-09-17T01:33:55.817+00:00'),
('LOG-1789608836564-x0dhxi', 'RAW-036', 'Lettuce', 'Gram', 'OUT', 10, 272, 262, NULL, 'Pemakaian resep menu "Smoke Beef Salad Cheese" (2x) - Pesanan #INV-835817', NULL, 'INV-835817', 'ORD-1789608835817', 'Pelanggan Umum', 'Smoke Beef Salad Cheese', 'MENU', NULL, 'Deri', '2026-09-17T01:33:55.817+00:00'),
('LOG-1789608836564-sx9v8h', 'RAW-037', 'Saus Tomat', 'Gram', 'OUT', 4, 705, 701, NULL, 'Pemakaian resep menu "Smoke Beef Salad Cheese" (2x) - Pesanan #INV-835817', NULL, 'INV-835817', 'ORD-1789608835817', 'Pelanggan Umum', 'Smoke Beef Salad Cheese', 'MENU', NULL, 'Deri', '2026-09-17T01:33:55.817+00:00'),
('LOG-1789608836564-4rjfw3', 'RAW-038', 'Saos Sambal', 'Gram', 'OUT', 4, 976, 972, NULL, 'Pemakaian resep menu "Smoke Beef Salad Cheese" (2x) - Pesanan #INV-835817', NULL, 'INV-835817', 'ORD-1789608835817', 'Pelanggan Umum', 'Smoke Beef Salad Cheese', 'MENU', NULL, 'Deri', '2026-09-17T01:33:55.817+00:00'),
('LOG-1789608836564-7su6ne', 'RAW-039', 'Mayonaise', 'Gram', 'OUT', 4, 1008, 1004, NULL, 'Pemakaian resep menu "Smoke Beef Salad Cheese" (2x) - Pesanan #INV-835817', NULL, 'INV-835817', 'ORD-1789608835817', 'Pelanggan Umum', 'Smoke Beef Salad Cheese', 'MENU', NULL, 'Deri', '2026-09-17T01:33:55.817+00:00'),
('LOG-1789608836564-us9yyh', 'RAW-040', 'Cheese Slice', 'Pcs', 'OUT', 2, 8, 6, NULL, 'Pemakaian resep menu "Smoke Beef Salad Cheese" (2x) - Pesanan #INV-835817', NULL, 'INV-835817', 'ORD-1789608835817', 'Pelanggan Umum', 'Smoke Beef Salad Cheese', 'MENU', NULL, 'Deri', '2026-09-17T01:33:55.817+00:00'),
('LOG-1789608836564-d9ffxy', 'RAW-041', 'Dus Crepes', 'Pcs', 'OUT', 2, 80, 78, NULL, 'Pemakaian extra topping "Dus Crepes" pada "Smoke Beef Salad Cheese" (Pesanan #INV-835817)', NULL, 'INV-835817', 'ORD-1789608835817', 'Pelanggan Umum', 'Smoke Beef Salad Cheese', 'TOPPING', 'Dus Crepes', 'Deri', '2026-09-17T01:33:55.817+00:00'),
('LOG-1789608952713-worft0', 'RAW-001', 'Adonan', 'Gram', 'OUT', 88, 2548, 2460, NULL, 'Pemakaian resep menu "Crepes Oreo" (1x) - Pesanan #INV-951379', NULL, 'INV-951379', 'ORD-1789608951379', 'Pelanggan Umum', 'Crepes Oreo', 'MENU', NULL, 'Deri', '2026-09-17T01:35:51.379+00:00'),
('LOG-1789608952713-71wp1l', 'RAW-041', 'Dus Crepes', 'Pcs', 'OUT', 1, 78, 77, NULL, 'Pemakaian extra topping "Dus Crepes" pada "Crepes Oreo" (Pesanan #INV-951379)', NULL, 'INV-951379', 'ORD-1789608951379', 'Pelanggan Umum', 'Crepes Oreo', 'TOPPING', 'Dus Crepes', 'Deri', '2026-09-17T01:35:51.379+00:00'),
('LOG-1789609296936-noo4cz', 'RAW-001', 'Adonan', 'Gram', 'OUT', 44, 2460, 2416, NULL, 'Pemakaian resep menu "Mini Crepes Chocolate" (1x) - Pesanan #INV-295243', NULL, 'INV-295243', 'ORD-1789609295243', 'Pelanggan Umum', 'Mini Crepes Chocolate', 'MENU', NULL, 'Deri', '2026-09-17T01:41:35.243+00:00'),
('LOG-1789609296936-azf763', 'RAW-002', 'Coklat', 'Bungkus', 'OUT', 1, 47, 46, NULL, 'Pemakaian resep menu "Mini Crepes Chocolate" (1x) - Pesanan #INV-295243', NULL, 'INV-295243', 'ORD-1789609295243', 'Pelanggan Umum', 'Mini Crepes Chocolate', 'MENU', NULL, 'Deri', '2026-09-17T01:41:35.243+00:00'),
('LOG-1789609296936-levqaa', 'RAW-001', 'Adonan', 'Gram', 'OUT', 88, 2416, 2328, NULL, 'Pemakaian resep menu "Crepes Strawberry" (1x) - Pesanan #INV-295243', NULL, 'INV-295243', 'ORD-1789609295243', 'Pelanggan Umum', 'Crepes Strawberry', 'MENU', NULL, 'Deri', '2026-09-17T01:41:35.243+00:00'),
('LOG-1789609296936-4ohtav', 'RAW-005', 'Selai strawberry', 'Gram', 'OUT', 30, 597, 567, NULL, 'Pemakaian resep menu "Crepes Strawberry" (1x) - Pesanan #INV-295243', NULL, 'INV-295243', 'ORD-1789609295243', 'Pelanggan Umum', 'Crepes Strawberry', 'MENU', NULL, 'Deri', '2026-09-17T01:41:35.243+00:00'),
('LOG-1789609296936-v8ahaj', 'RAW-041', 'Dus Crepes', 'Pcs', 'OUT', 1, 77, 76, NULL, 'Pemakaian extra topping "Dus Crepes" pada "Crepes Strawberry" (Pesanan #INV-295243)', NULL, 'INV-295243', 'ORD-1789609295243', 'Pelanggan Umum', 'Crepes Strawberry', 'TOPPING', 'Dus Crepes', 'Deri', '2026-09-17T01:41:35.243+00:00'),
('LOG-1789609296936-ohp70y', 'RAW-013', 'pisang', 'Pcs', 'OUT', 1, 5, 4, NULL, 'Pemakaian extra topping "Banana" pada "Crepes Strawberry" (Pesanan #INV-295243)', NULL, 'INV-295243', 'ORD-1789609295243', 'Pelanggan Umum', 'Crepes Strawberry', 'TOPPING', 'Banana', 'Deri', '2026-09-17T01:41:35.243+00:00'),
('LOG-1789609296936-52ux73', 'RAW-003', 'Cheese', 'Pcs', 'OUT', 2, 48, 46, NULL, 'Pemakaian extra topping "Cheese" pada "Crepes Strawberry" (Pesanan #INV-295243)', NULL, 'INV-295243', 'ORD-1789609295243', 'Pelanggan Umum', 'Crepes Strawberry', 'TOPPING', 'Cheese', 'Deri', '2026-09-17T01:41:35.243+00:00'),
('LOG-1789609296936-kpgmsn', 'RAW-001', 'Adonan', 'Gram', 'OUT', 88, 2328, 2240, NULL, 'Pemakaian resep menu "Sausage Salad" (1x) - Pesanan #INV-295243', NULL, 'INV-295243', 'ORD-1789609295243', 'Pelanggan Umum', 'Sausage Salad', 'MENU', NULL, 'Deri', '2026-09-17T01:41:35.243+00:00'),
('LOG-1789609296936-vhmd8y', 'RAW-037', 'Saus Tomat', 'Gram', 'OUT', 2, 701, 699, NULL, 'Pemakaian resep menu "Sausage Salad" (1x) - Pesanan #INV-295243', NULL, 'INV-295243', 'ORD-1789609295243', 'Pelanggan Umum', 'Sausage Salad', 'MENU', NULL, 'Deri', '2026-09-17T01:41:35.243+00:00'),
('LOG-1789609296936-vvp7s5', 'RAW-038', 'Saos Sambal', 'Gram', 'OUT', 2, 972, 970, NULL, 'Pemakaian resep menu "Sausage Salad" (1x) - Pesanan #INV-295243', NULL, 'INV-295243', 'ORD-1789609295243', 'Pelanggan Umum', 'Sausage Salad', 'MENU', NULL, 'Deri', '2026-09-17T01:41:35.243+00:00'),
('LOG-1789609296936-1dsir0', 'RAW-039', 'Mayonaise', 'Gram', 'OUT', 2, 1004, 1002, NULL, 'Pemakaian resep menu "Sausage Salad" (1x) - Pesanan #INV-295243', NULL, 'INV-295243', 'ORD-1789609295243', 'Pelanggan Umum', 'Sausage Salad', 'MENU', NULL, 'Deri', '2026-09-17T01:41:35.243+00:00'),
('LOG-1789609296936-x2ptpr', 'RAW-036', 'Lettuce', 'Gram', 'OUT', 5, 262, 257, NULL, 'Pemakaian resep menu "Sausage Salad" (1x) - Pesanan #INV-295243', NULL, 'INV-295243', 'ORD-1789609295243', 'Pelanggan Umum', 'Sausage Salad', 'MENU', NULL, 'Deri', '2026-09-17T01:41:35.243+00:00'),
('LOG-1789609296936-z6fx05', 'RAW-034', 'Sosis', 'Pcs', 'OUT', 1, 13, 12, NULL, 'Pemakaian resep menu "Sausage Salad" (1x) - Pesanan #INV-295243', NULL, 'INV-295243', 'ORD-1789609295243', 'Pelanggan Umum', 'Sausage Salad', 'MENU', NULL, 'Deri', '2026-09-17T01:41:35.243+00:00'),
('LOG-1789609296936-03b4zy', 'RAW-041', 'Dus Crepes', 'Pcs', 'OUT', 1, 76, 75, NULL, 'Pemakaian extra topping "Dus Crepes" pada "Sausage Salad" (Pesanan #INV-295243)', NULL, 'INV-295243', 'ORD-1789609295243', 'Pelanggan Umum', 'Sausage Salad', 'TOPPING', 'Dus Crepes', 'Deri', '2026-09-17T01:41:35.243+00:00'),
('LOG-1789609463733-ori53s', 'RAW-001', 'Adonan', 'Gram', 'OUT', 88, 2416, 2328, NULL, 'Pemakaian resep menu "Crepes Chocolate" (1x) - Pesanan #INV-461967', NULL, 'INV-461967', 'ORD-1789609461967', 'Pelanggan Umum', 'Crepes Chocolate', 'MENU', NULL, 'Deri', '2026-09-17T01:44:21.967+00:00'),
('LOG-1789609463733-72g409', 'RAW-002', 'Coklat', 'Bungkus', 'OUT', 2, 46, 44, NULL, 'Pemakaian resep menu "Crepes Chocolate" (1x) - Pesanan #INV-461967', NULL, 'INV-461967', 'ORD-1789609461967', 'Pelanggan Umum', 'Crepes Chocolate', 'MENU', NULL, 'Deri', '2026-09-17T01:44:21.967+00:00'),
('LOG-1789609463733-wvcz7b', 'RAW-041', 'Dus Crepes', 'Pcs', 'OUT', 1, 76, 75, NULL, 'Pemakaian extra topping "Dus Crepes" pada "Crepes Chocolate" (Pesanan #INV-461967)', NULL, 'INV-461967', 'ORD-1789609461967', 'Pelanggan Umum', 'Crepes Chocolate', 'TOPPING', 'Dus Crepes', 'Deri', '2026-09-17T01:44:21.967+00:00'),
('LOG-1789609463733-4a23uf', 'RAW-003', 'Cheese', 'Pcs', 'OUT', 4, 46, 42, NULL, 'Pemakaian extra topping "Cheese" pada "Crepes Chocolate" (Pesanan #INV-461967)', NULL, 'INV-461967', 'ORD-1789609461967', 'Pelanggan Umum', 'Crepes Chocolate', 'TOPPING', 'Cheese', 'Deri', '2026-09-17T01:44:21.967+00:00'),
('LOG-1789609543102-7jimm3', 'RAW-001', 'Adonan', 'Gram', 'OUT', 88, 2328, 2240, NULL, 'Pemakaian resep menu "Crepes Chocolate" (1x) - Pesanan #INV-541764', NULL, 'INV-541764', 'ORD-1789609541764', 'Pelanggan Umum', 'Crepes Chocolate', 'MENU', NULL, 'Deri', '2026-09-17T01:45:41.764+00:00'),
('LOG-1789609543103-0yfaay', 'RAW-002', 'Coklat', 'Bungkus', 'OUT', 2, 44, 42, NULL, 'Pemakaian resep menu "Crepes Chocolate" (1x) - Pesanan #INV-541764', NULL, 'INV-541764', 'ORD-1789609541764', 'Pelanggan Umum', 'Crepes Chocolate', 'MENU', NULL, 'Deri', '2026-09-17T01:45:41.764+00:00'),
('LOG-1789609543103-3ppo1l', 'RAW-003', 'Cheese', 'Pcs', 'OUT', 2, 42, 40, NULL, 'Pemakaian extra topping "Cheese" pada "Crepes Chocolate" (Pesanan #INV-541764)', NULL, 'INV-541764', 'ORD-1789609541764', 'Pelanggan Umum', 'Crepes Chocolate', 'TOPPING', 'Cheese', 'Deri', '2026-09-17T01:45:41.764+00:00'),
('LOG-1789609543103-5635or', 'RAW-041', 'Dus Crepes', 'Pcs', 'OUT', 1, 75, 74, NULL, 'Pemakaian extra topping "Dus Crepes" pada "Crepes Chocolate" (Pesanan #INV-541764)', NULL, 'INV-541764', 'ORD-1789609541764', 'Pelanggan Umum', 'Crepes Chocolate', 'TOPPING', 'Dus Crepes', 'Deri', '2026-09-17T01:45:41.764+00:00')
ON CONFLICT (id) DO UPDATE SET
  "raw_material_id" = EXCLUDED."raw_material_id",
  "raw_material_name" = EXCLUDED."raw_material_name",
  "unit_name" = EXCLUDED."unit_name",
  "type" = EXCLUDED."type",
  "amount" = EXCLUDED."amount",
  "previous_stock" = EXCLUDED."previous_stock",
  "current_stock" = EXCLUDED."current_stock",
  "reason" = EXCLUDED."reason",
  "note" = EXCLUDED."note",
  "photo" = EXCLUDED."photo",
  "reference_invoice" = EXCLUDED."reference_invoice",
  "order_id" = EXCLUDED."order_id",
  "customer_name" = EXCLUDED."customer_name",
  "source_menu" = EXCLUDED."source_menu",
  "source_type" = EXCLUDED."source_type",
  "topping_name" = EXCLUDED."topping_name",
  "user_name" = EXCLUDED."user_name",
  "created_at" = EXCLUDED."created_at";

-- Tabel: store_settings (1 baris)
INSERT INTO public.store_settings ("id", "app_name", "store_name", "store_tagline", "logo", "phone", "address", "email", "receipt_title", "receipt_subtitle", "receipt_phone", "receipt_footer1", "receipt_footer2", "paper_size", "show_logo_on_receipt", "show_cashier_name", "show_customer_name", "show_table_number", "show_notes", "updated_at")
VALUES
('store_default', 'XCrepes POS', 'XCrepes D''Botanica', 'Crispy & Tasty Crepes in Town', NULL, '0812-3456-7890', 'D''Botanica Mall Bandung, Lt. LG Food Court No. 12', 'contact@xcrepes.id', 'XCrepes D''Botanica', 'Cabang D''Botanica Mall Bandung', '0812-3456-7890', 'Terima Kasih Atas Kunjungan Anda!', 'Follow Instagram @xcrepes.id', '58mm', FALSE, TRUE, TRUE, TRUE, TRUE, '2026-09-11T01:58:30.37+00:00')
ON CONFLICT (id) DO UPDATE SET
  "app_name" = EXCLUDED."app_name",
  "store_name" = EXCLUDED."store_name",
  "store_tagline" = EXCLUDED."store_tagline",
  "logo" = EXCLUDED."logo",
  "phone" = EXCLUDED."phone",
  "address" = EXCLUDED."address",
  "email" = EXCLUDED."email",
  "receipt_title" = EXCLUDED."receipt_title",
  "receipt_subtitle" = EXCLUDED."receipt_subtitle",
  "receipt_phone" = EXCLUDED."receipt_phone",
  "receipt_footer1" = EXCLUDED."receipt_footer1",
  "receipt_footer2" = EXCLUDED."receipt_footer2",
  "paper_size" = EXCLUDED."paper_size",
  "show_logo_on_receipt" = EXCLUDED."show_logo_on_receipt",
  "show_cashier_name" = EXCLUDED."show_cashier_name",
  "show_customer_name" = EXCLUDED."show_customer_name",
  "show_table_number" = EXCLUDED."show_table_number",
  "show_notes" = EXCLUDED."show_notes",
  "updated_at" = EXCLUDED."updated_at";

-- Tabel: cashier_accounts (1 baris)
INSERT INTO public.cashier_accounts ("id", "nama", "username", "password", "role", "permissions", "is_active", "created_at", "updated_at")
VALUES
('KASIR-001', 'Deri', 'deri', 'deri123', 'kasir', '["kasir","raw-material","returns","reports-sales","stock-opname"]'::jsonb, TRUE, '2026-09-11T03:21:22.979+00:00', '2026-09-16T09:22:37.523+00:00')
ON CONFLICT (id) DO UPDATE SET
  "nama" = EXCLUDED."nama",
  "username" = EXCLUDED."username",
  "password" = EXCLUDED."password",
  "role" = EXCLUDED."role",
  "permissions" = EXCLUDED."permissions",
  "is_active" = EXCLUDED."is_active",
  "created_at" = EXCLUDED."created_at",
  "updated_at" = EXCLUDED."updated_at";

-- Tabel: superadmin_profile (1 baris)
INSERT INTO public.superadmin_profile ("id", "nama", "username", "password", "role", "updated_at")
VALUES
('usr_superadmin', 'admin', 'novylianiyusup', 'neko123', 'superadmin', '2026-09-14T04:57:57.586+00:00')
ON CONFLICT (id) DO UPDATE SET
  "nama" = EXCLUDED."nama",
  "username" = EXCLUDED."username",
  "password" = EXCLUDED."password",
  "role" = EXCLUDED."role",
  "updated_at" = EXCLUDED."updated_at";

