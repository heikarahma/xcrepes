-- TRANSAKSI ORDERS BAGIAN 2 (2 order)

INSERT INTO public.orders ("id", "invoice_number", "date", "status", "cashier_name", "customer_name", "table_number", "items", "subtotal", "items_discount_total", "order_discount_type", "order_discount_value", "order_discount_amount", "discount", "total_amount", "total_items_count", "payment_method", "cash_received", "change_amount", "return_reason", "return_note", "return_photo", "return_by", "returned_at", "created_at")
VALUES
('ORD-1789608727950', 'INV-727950', '2026-09-17T01:32:07.95+00:00', 'completed', 'Deri', 'Pelanggan Umum', 'Takeaway', '[{"name":"Mini Crepes Blueberry","note":"","image":"","menuId":"MENU-025","itemKey":"MENU-025__","quantity":1,"toppings":[],"basePrice":8000,"lineGross":8000,"lineTotal":8000,"unitPrice":8000,"cartItemId":"CART-1789608723376-7zhcx","categoryName":"Mini Crepes","lineDiscount":0,"toppingsCost":0,"toppingsTotal":0,"itemDiscountType":"none","itemDiscountValue":0,"itemDiscountAmount":0}]'::jsonb, 8000, 0, 'fixed', 0, 0, 0, 8000, 1, 'qris', 8000, 0, NULL, NULL, NULL, NULL, NULL, '2026-09-17T01:32:07.951+00:00'),
('ORD-1789608835817', 'INV-835817', '2026-09-17T01:33:55.817+00:00', 'completed', 'Deri', 'Pelanggan Umum', 'Takeaway', '[{"name":"Mini crepes Oreo","note":"","image":"","menuId":"MENU-028","itemKey":"MENU-028__","quantity":1,"toppings":[],"basePrice":8000,"lineGross":8000,"lineTotal":0,"unitPrice":8000,"cartItemId":"CART-1789608822427-qpjks","categoryName":"Mini Crepes","lineDiscount":8000,"toppingsCost":0,"toppingsTotal":0,"itemDiscountType":"percent","itemDiscountValue":100,"itemDiscountAmount":8000},{"name":"Smoke Beef Salad Cheese","note":"","image":"","menuId":"MENU-021","itemKey":"MENU-021__TOP-021_x1","quantity":2,"toppings":[{"id":"TOP-021","name":"Dus Crepes","price":2000,"quantity":1,"toppingId":"TOP-021","ingredients":[{"quantity":"1","unitName":"Pcs","rawMaterialId":"RAW-041","rawMaterialName":"Dus Crepes"}]}],"basePrice":25500,"lineGross":55000,"lineTotal":55000,"unitPrice":27500,"cartItemId":"CART-1789608769281-j3p48","categoryName":"Crepes Asin","lineDiscount":0,"toppingsCost":2000,"toppingsTotal":2000,"itemDiscountType":"none","itemDiscountValue":0,"itemDiscountAmount":0}]'::jsonb, 63000, 8000, 'fixed', 0, 0, 8000, 55000, 3, 'qris', 55000, 0, NULL, NULL, NULL, NULL, NULL, '2026-09-17T01:33:55.817+00:00')
ON CONFLICT (id) DO UPDATE SET
  "invoice_number" = EXCLUDED."invoice_number",
  "date" = EXCLUDED."date",
  "status" = EXCLUDED."status",
  "cashier_name" = EXCLUDED."cashier_name",
  "customer_name" = EXCLUDED."customer_name",
  "table_number" = EXCLUDED."table_number",
  "items" = EXCLUDED."items",
  "subtotal" = EXCLUDED."subtotal",
  "items_discount_total" = EXCLUDED."items_discount_total",
  "order_discount_type" = EXCLUDED."order_discount_type",
  "order_discount_value" = EXCLUDED."order_discount_value",
  "order_discount_amount" = EXCLUDED."order_discount_amount",
  "discount" = EXCLUDED."discount",
  "total_amount" = EXCLUDED."total_amount",
  "total_items_count" = EXCLUDED."total_items_count",
  "payment_method" = EXCLUDED."payment_method",
  "cash_received" = EXCLUDED."cash_received",
  "change_amount" = EXCLUDED."change_amount",
  "return_reason" = EXCLUDED."return_reason",
  "return_note" = EXCLUDED."return_note",
  "return_photo" = EXCLUDED."return_photo",
  "return_by" = EXCLUDED."return_by",
  "returned_at" = EXCLUDED."returned_at",
  "created_at" = EXCLUDED."created_at";
