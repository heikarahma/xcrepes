/**
 * Data Constants & Initial Collections untuk Aplikasi XCrepes POS
 * Mode: Full Comprehensive Dummy Dataset (Semua Fitur & Data Nyata Sistem)
 * Mencakup 42 Bahan Baku, 37 Menu Crepes, 30 Topping, 5 Kategori, 5 Satuan, 6 Kasir,
 * serta ragam Transaksi Lengkap (Selesai, Direvisi, Diretur, Dibatalkan) dan Mutasi Stok (IN, OUT, WASTE, RETURN_ORDER, ADJUST).
 */

export const DUMMY_UNITS = [
  {
    "id": "UOM-001",
    "name": "Gram"
  },
  {
    "id": "UOM-003",
    "name": "Batang"
  },
  {
    "id": "UOM-004",
    "name": "Mili Liter"
  },
  {
    "id": "UOM-005",
    "name": "Bungkus"
  },
  {
    "id": "UOM-002",
    "name": "Pcs"
  }
];

export const DUMMY_CATEGORIES = [
  {
    "id": "CAT-001",
    "name": "Crepes Manis",
    "description": "Aneka crêpes manis lembut dengan pasta cokelat dan buah segar"
  },
  {
    "id": "CAT-002",
    "name": "Crepes Asin",
    "description": "Aneka crêpes gurih dengan isian daging dan keju lezat"
  },
  {
    "id": "CAT-003",
    "name": "Mini Crepes",
    "description": "Kategori menu pilihan XCrepes"
  },
  {
    "id": "CAT-005",
    "name": "Packaging",
    "description": "Kategori menu pilihan XCrepes"
  },
  {
    "id": "CAT-004",
    "name": "Dessert",
    "description": "Kategori menu pilihan XCrepes"
  }
];

export const DUMMY_RAW_MATERIALS = [
  {
    "id": "RAW-008",
    "name": "Selai Srikaya",
    "unit_name": "Gram",
    "stock": 1408,
    "price_per_unit": 50,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-012",
    "name": "Selai Pistachio",
    "unit_name": "Gram",
    "stock": 200,
    "price_per_unit": 600,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-021",
    "name": "Kacang tabur",
    "unit_name": "Gram",
    "stock": 0,
    "price_per_unit": 50,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-024",
    "name": "Cone",
    "unit_name": "Pcs",
    "stock": 16,
    "price_per_unit": 800,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-025",
    "name": "Choco Stick",
    "unit_name": "Pcs",
    "stock": 7,
    "price_per_unit": 1000,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-040",
    "name": "Cheese Slice",
    "unit_name": "Pcs",
    "stock": 12,
    "price_per_unit": 1600,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-020",
    "name": "Chacha",
    "unit_name": "Gram",
    "stock": 142,
    "price_per_unit": 139,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-022",
    "name": "Yupi",
    "unit_name": "Pcs",
    "stock": 10,
    "price_per_unit": 1000,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-023",
    "name": "Astor",
    "unit_name": "Batang",
    "stock": 176,
    "price_per_unit": 1000,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-010",
    "name": "Silverqueen",
    "unit_name": "Bungkus",
    "stock": 12,
    "price_per_unit": 7500,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-039",
    "name": "Mayonaise",
    "unit_name": "Gram",
    "stock": 941,
    "price_per_unit": 50,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-027",
    "name": "Selai Top Blueberry",
    "unit_name": "Gram",
    "stock": 255,
    "price_per_unit": 79,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-028",
    "name": "Selai Top Strawberry",
    "unit_name": "Gram",
    "stock": 292,
    "price_per_unit": 79,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-026",
    "name": "Selai Top Chocolate",
    "unit_name": "Gram",
    "stock": 257,
    "price_per_unit": 79,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-016",
    "name": "Choco Crunchy",
    "unit_name": "Gram",
    "stock": 1389,
    "price_per_unit": 243,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-035",
    "name": "Tuna",
    "unit_name": "Gram",
    "stock": 7,
    "price_per_unit": 3333,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-034",
    "name": "Sosis",
    "unit_name": "Pcs",
    "stock": 11,
    "price_per_unit": 7000,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-006",
    "name": "Selai Blueberry",
    "unit_name": "Gram",
    "stock": 300,
    "price_per_unit": 50,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-011",
    "name": "Silverqueen Matcha",
    "unit_name": "Bungkus",
    "stock": 8,
    "price_per_unit": 7500,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-019",
    "name": "Ice Cream",
    "unit_name": "Gram",
    "stock": 1001,
    "price_per_unit": 30,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-007",
    "name": "Selai Peanut",
    "unit_name": "Gram",
    "stock": 747,
    "price_per_unit": 50,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-029",
    "name": "Sendok Plastik",
    "unit_name": "Pcs",
    "stock": 23,
    "price_per_unit": 500,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-032",
    "name": "Beef Burger",
    "unit_name": "Pcs",
    "stock": 5,
    "price_per_unit": 7100,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-004",
    "name": "Oreo",
    "unit_name": "Bungkus",
    "stock": 49,
    "price_per_unit": 800,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-002",
    "name": "Coklat",
    "unit_name": "Bungkus",
    "stock": 22,
    "price_per_unit": 1625,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-041",
    "name": "Dus Crepes",
    "unit_name": "Pcs",
    "stock": 116,
    "price_per_unit": 1500,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-003",
    "name": "Cheese",
    "unit_name": "Pcs",
    "stock": 36,
    "price_per_unit": 900,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-017",
    "name": "Ovomaltine",
    "unit_name": "Gram",
    "stock": 831,
    "price_per_unit": 243,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-013",
    "name": "pisang",
    "unit_name": "Pcs",
    "stock": 7,
    "price_per_unit": 1000,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-005",
    "name": "Selai strawberry",
    "unit_name": "Gram",
    "stock": 482,
    "price_per_unit": 50,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-001",
    "name": "Adonan",
    "unit_name": "Gram",
    "stock": 2672,
    "price_per_unit": 67,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-014",
    "name": "Milk",
    "unit_name": "Gram",
    "stock": 233,
    "price_per_unit": 30,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-018",
    "name": "marsmallow",
    "unit_name": "Bungkus",
    "stock": 15,
    "price_per_unit": 1000,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-043",
    "name": "Dus Mini",
    "unit_name": "Pcs",
    "stock": 11,
    "price_per_unit": 500,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-042",
    "name": "Cup Xcrepes",
    "unit_name": "Pcs",
    "stock": 23,
    "price_per_unit": 200,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-030",
    "name": "Cherry",
    "unit_name": "Pcs",
    "stock": 30,
    "price_per_unit": 1000,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-038",
    "name": "Saos Sambal",
    "unit_name": "Gram",
    "stock": 898,
    "price_per_unit": 50,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-036",
    "name": "Lettuce",
    "unit_name": "Gram",
    "stock": 99,
    "price_per_unit": 200,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-037",
    "name": "Saus Tomat",
    "unit_name": "Gram",
    "stock": 629,
    "price_per_unit": 50,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-015",
    "name": "Nuttella",
    "unit_name": "Gram",
    "stock": 833,
    "price_per_unit": 198,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-033",
    "name": "Smoke Beef",
    "unit_name": "Pcs",
    "stock": 8,
    "price_per_unit": 3043,
    "min_stock": 10,
    "note": ""
  },
  {
    "id": "RAW-009",
    "name": "Selai Pistachio K",
    "unit_name": "Gram",
    "stock": 130,
    "price_per_unit": 425,
    "min_stock": 10,
    "note": ""
  }
];

export const DUMMY_TOPPINGS = [
  {
    "id": "TOP-024",
    "name": "Yupi",
    "price": 2000,
    "description": "Tambahan topping Yupi spesial",
    "ingredients": [
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-022",
        "rawMaterialName": "Yupi"
      }
    ]
  },
  {
    "id": "TOP-025",
    "name": "Top Chocolate",
    "price": 2000,
    "description": "Tambahan topping Top Chocolate spesial",
    "ingredients": [
      {
        "quantity": "10",
        "unitName": "Gram",
        "rawMaterialId": "RAW-026",
        "rawMaterialName": "Selai Top Chocolate"
      }
    ]
  },
  {
    "id": "TOP-026",
    "name": "Top Strawberry",
    "price": 1997,
    "description": "Tambahan topping Top Strawberry spesial",
    "ingredients": [
      {
        "quantity": "10",
        "unitName": "Gram",
        "rawMaterialId": "RAW-028",
        "rawMaterialName": "Selai Top Strawberry"
      }
    ]
  },
  {
    "id": "TOP-001",
    "name": "Chocolate",
    "price": 4000,
    "description": "Tambahan topping Chocolate spesial",
    "ingredients": [
      {
        "quantity": "2",
        "unitName": "Bungkus",
        "rawMaterialId": "RAW-002",
        "rawMaterialName": "Coklat"
      }
    ]
  },
  {
    "id": "TOP-002",
    "name": "Selai Strawberry",
    "price": 4000,
    "description": "Tambahan topping Selai Strawberry spesial",
    "ingredients": [
      {
        "quantity": "30",
        "unitName": "Gram",
        "rawMaterialId": "RAW-005",
        "rawMaterialName": "Selai strawberry"
      }
    ]
  },
  {
    "id": "TOP-003",
    "name": "Selai Blueberry",
    "price": 4000,
    "description": "Tambahan topping Selai Blueberry spesial",
    "ingredients": [
      {
        "quantity": "30",
        "unitName": "Gram",
        "rawMaterialId": "RAW-006",
        "rawMaterialName": "Selai Blueberry"
      }
    ]
  },
  {
    "id": "TOP-004",
    "name": "Milk",
    "price": 4000,
    "description": "Tambahan topping Milk spesial",
    "ingredients": [
      {
        "quantity": "30",
        "unitName": "Gram",
        "rawMaterialId": "RAW-014",
        "rawMaterialName": "Milk"
      }
    ]
  },
  {
    "id": "TOP-005",
    "name": "Selai Peanut",
    "price": 4000,
    "description": "Tambahan topping Selai Peanut spesial",
    "ingredients": [
      {
        "quantity": "30",
        "unitName": "Gram",
        "rawMaterialId": "RAW-007",
        "rawMaterialName": "Selai Peanut"
      }
    ]
  },
  {
    "id": "TOP-006",
    "name": "Selai srikaya",
    "price": 4000,
    "description": "Tambahan topping Selai srikaya spesial",
    "ingredients": [
      {
        "quantity": "30",
        "unitName": "Gram",
        "rawMaterialId": "RAW-008",
        "rawMaterialName": "Selai Srikaya"
      }
    ]
  },
  {
    "id": "TOP-007",
    "name": "Oreo",
    "price": 1600,
    "description": "Tambahan topping Oreo spesial",
    "ingredients": [
      {
        "quantity": "2",
        "unitName": "Bungkus",
        "rawMaterialId": "RAW-004",
        "rawMaterialName": "Oreo"
      }
    ]
  },
  {
    "id": "TOP-008",
    "name": "Banana",
    "price": 4000,
    "description": "Tambahan topping Banana spesial",
    "ingredients": [
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-013",
        "rawMaterialName": "pisang"
      }
    ]
  },
  {
    "id": "TOP-009",
    "name": "Silverqueen",
    "price": 9000,
    "description": "Tambahan topping Silverqueen spesial",
    "ingredients": [
      {
        "quantity": "1",
        "unitName": "Bungkus",
        "rawMaterialId": "RAW-010",
        "rawMaterialName": "Silverqueen"
      }
    ]
  },
  {
    "id": "TOP-010",
    "name": "Silverqueen Matcha",
    "price": 9000,
    "description": "Tambahan topping Silverqueen Matcha spesial",
    "ingredients": [
      {
        "quantity": "1",
        "unitName": "Bungkus",
        "rawMaterialId": "RAW-011",
        "rawMaterialName": "Silverqueen Matcha"
      }
    ]
  },
  {
    "id": "TOP-011",
    "name": "Nutella",
    "price": 9000,
    "description": "Tambahan topping Nutella spesial",
    "ingredients": [
      {
        "quantity": "30",
        "unitName": "Gram",
        "rawMaterialId": "RAW-015",
        "rawMaterialName": "Nuttella"
      }
    ]
  },
  {
    "id": "TOP-012",
    "name": "Ovomaltine",
    "price": 9000,
    "description": "Tambahan topping Ovomaltine spesial",
    "ingredients": [
      {
        "quantity": "30",
        "unitName": "Gram",
        "rawMaterialId": "RAW-017",
        "rawMaterialName": "Ovomaltine"
      }
    ]
  },
  {
    "id": "TOP-013",
    "name": "Choco Crunchy",
    "price": 9000,
    "description": "Tambahan topping Choco Crunchy spesial",
    "ingredients": [
      {
        "quantity": "27",
        "unitName": "Gram",
        "rawMaterialId": "RAW-016",
        "rawMaterialName": "Choco Crunchy"
      }
    ]
  },
  {
    "id": "TOP-014",
    "name": "Pistachio Kunafa",
    "price": 20000,
    "description": "Tambahan topping Pistachio Kunafa spesial",
    "ingredients": [
      {
        "quantity": "33",
        "unitName": "Gram",
        "rawMaterialId": "RAW-009",
        "rawMaterialName": "Selai Pistachio K"
      }
    ]
  },
  {
    "id": "TOP-015",
    "name": "Tuna",
    "price": 8000,
    "description": "Tambahan topping Tuna spesial",
    "ingredients": [
      {
        "quantity": "1",
        "unitName": "Gram",
        "rawMaterialId": "RAW-035",
        "rawMaterialName": "Tuna"
      }
    ]
  },
  {
    "id": "TOP-016",
    "name": "Beef Burger",
    "price": 8000,
    "description": "Tambahan topping Beef Burger spesial",
    "ingredients": [
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-032",
        "rawMaterialName": "Beef Burger"
      }
    ]
  },
  {
    "id": "TOP-017",
    "name": "Smoke Beef",
    "price": 8000,
    "description": "Tambahan topping Smoke Beef spesial",
    "ingredients": [
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-033",
        "rawMaterialName": "Smoke Beef"
      }
    ]
  },
  {
    "id": "TOP-018",
    "name": "Sausage",
    "price": 8000,
    "description": "Tambahan topping Sausage spesial",
    "ingredients": [
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-034",
        "rawMaterialName": "Sosis"
      }
    ]
  },
  {
    "id": "TOP-019",
    "name": "Cheese Slice",
    "price": 5000,
    "description": "Tambahan topping Cheese Slice spesial",
    "ingredients": [
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-040",
        "rawMaterialName": "Cheese Slice"
      }
    ]
  },
  {
    "id": "TOP-020",
    "name": "Cheese",
    "price": 5000,
    "description": "Tambahan topping Cheese spesial",
    "ingredients": [
      {
        "quantity": "2",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-003",
        "rawMaterialName": "Cheese"
      }
    ]
  },
  {
    "id": "TOP-021",
    "name": "Dus Crepes",
    "price": 2000,
    "description": "Tambahan topping Dus Crepes spesial",
    "ingredients": [
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-041",
        "rawMaterialName": "Dus Crepes"
      }
    ]
  },
  {
    "id": "TOP-022",
    "name": "Ice  cream",
    "price": 7996,
    "description": "Tambahan topping Ice  cream spesial",
    "ingredients": [
      {
        "quantity": "80",
        "unitName": "Gram",
        "rawMaterialId": "RAW-019",
        "rawMaterialName": "Ice Cream"
      }
    ]
  },
  {
    "id": "TOP-023",
    "name": "Chacha",
    "price": 2000,
    "description": "Tambahan topping Chacha spesial",
    "ingredients": [
      {
        "quantity": "3",
        "unitName": "Gram",
        "rawMaterialId": "RAW-020",
        "rawMaterialName": "Chacha"
      }
    ]
  },
  {
    "id": "TOP-027",
    "name": "Top Blueberry",
    "price": 2000,
    "description": "Tambahan topping Top Blueberry spesial",
    "ingredients": [
      {
        "quantity": "10",
        "unitName": "Gram",
        "rawMaterialId": "RAW-027",
        "rawMaterialName": "Selai Top Blueberry"
      }
    ]
  },
  {
    "id": "TOP-028",
    "name": "Astor",
    "price": 2000,
    "description": "Tambahan topping Astor spesial",
    "ingredients": [
      {
        "quantity": "1",
        "unitName": "Batang",
        "rawMaterialId": "RAW-023",
        "rawMaterialName": "Astor"
      }
    ]
  },
  {
    "id": "TOP-029",
    "name": "Choco Stick",
    "price": 2000,
    "description": "Tambahan topping Choco Stick spesial",
    "ingredients": [
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-025",
        "rawMaterialName": "Choco Stick"
      }
    ]
  },
  {
    "id": "TOP-030",
    "name": "Marsmallow",
    "price": 6000,
    "description": "Tambahan topping Marsmallow spesial",
    "ingredients": [
      {
        "quantity": "1",
        "unitName": "Bungkus",
        "rawMaterialId": "RAW-018",
        "rawMaterialName": "marsmallow"
      }
    ]
  }
];

export const DUMMY_PRODUCT_MENUS = [
  {
    "id": "MENU-016",
    "name": "Beef Burger Salad",
    "category_id": "CAT-002",
    "categoryName": "Crepes Asin",
    "price": 22500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-032",
        "rawMaterialName": "Beef Burger"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-037",
        "rawMaterialName": "Saus Tomat"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-038",
        "rawMaterialName": "Saos Sambal"
      },
      {
        "quantity": "5",
        "unitName": "Gram",
        "rawMaterialId": "RAW-036",
        "rawMaterialName": "Lettuce"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-039",
        "rawMaterialName": "Mayonaise"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-019",
        "name": "Cheese Slice",
        "price": 5000,
        "toppingId": "TOP-019",
        "toppingName": "Cheese Slice"
      },
      {
        "id": "TOP-018",
        "name": "Sausage",
        "price": 8000,
        "toppingId": "TOP-018",
        "toppingName": "Sausage"
      },
      {
        "id": "TOP-017",
        "name": "Smoke Beef",
        "price": 8000,
        "toppingId": "TOP-017",
        "toppingName": "Smoke Beef"
      },
      {
        "id": "TOP-016",
        "name": "Beef Burger",
        "price": 8000,
        "toppingId": "TOP-016",
        "toppingName": "Beef Burger"
      },
      {
        "id": "TOP-015",
        "name": "Tuna",
        "price": 8000,
        "toppingId": "TOP-015",
        "toppingName": "Tuna"
      }
    ]
  },
  {
    "id": "MENU-009",
    "name": "Crepes Strawberry",
    "category_id": "CAT-001",
    "categoryName": "Crepes Manis",
    "price": 15500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "30",
        "unitName": "Gram",
        "rawMaterialId": "RAW-005",
        "rawMaterialName": "Selai strawberry"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-020",
        "name": "Cheese",
        "price": 5000,
        "toppingId": "TOP-020",
        "toppingName": "Cheese"
      },
      {
        "id": "TOP-014",
        "name": "Pistachio Kunafa",
        "price": 20000,
        "toppingId": "TOP-014",
        "toppingName": "Pistachio Kunafa"
      },
      {
        "id": "TOP-013",
        "name": "Choco Crunchy",
        "price": 9000,
        "toppingId": "TOP-013",
        "toppingName": "Choco Crunchy"
      },
      {
        "id": "TOP-012",
        "name": "Ovomaltine",
        "price": 9000,
        "toppingId": "TOP-012",
        "toppingName": "Ovomaltine"
      },
      {
        "id": "TOP-011",
        "name": "Nutella",
        "price": 9000,
        "toppingId": "TOP-011",
        "toppingName": "Nutella"
      },
      {
        "id": "TOP-010",
        "name": "Silverqueen Matcha",
        "price": 9000,
        "toppingId": "TOP-010",
        "toppingName": "Silverqueen Matcha"
      },
      {
        "id": "TOP-009",
        "name": "Silverqueen",
        "price": 9000,
        "toppingId": "TOP-009",
        "toppingName": "Silverqueen"
      },
      {
        "id": "TOP-006",
        "name": "Selai srikaya",
        "price": 4000,
        "toppingId": "TOP-006",
        "toppingName": "Selai srikaya"
      },
      {
        "id": "TOP-008",
        "name": "Banana",
        "price": 4000,
        "toppingId": "TOP-008",
        "toppingName": "Banana"
      },
      {
        "id": "TOP-007",
        "name": "Oreo",
        "price": 1600,
        "toppingId": "TOP-007",
        "toppingName": "Oreo"
      },
      {
        "id": "TOP-005",
        "name": "Selai Peanut",
        "price": 4000,
        "toppingId": "TOP-005",
        "toppingName": "Selai Peanut"
      },
      {
        "id": "TOP-003",
        "name": "Selai Blueberry",
        "price": 4000,
        "toppingId": "TOP-003",
        "toppingName": "Selai Blueberry"
      },
      {
        "id": "TOP-004",
        "name": "Milk",
        "price": 4000,
        "toppingId": "TOP-004",
        "toppingName": "Milk"
      },
      {
        "id": "TOP-002",
        "name": "Selai Strawberry",
        "price": 4000,
        "toppingId": "TOP-002",
        "toppingName": "Selai Strawberry"
      },
      {
        "id": "TOP-001",
        "name": "Chocolate",
        "price": 4000,
        "toppingId": "TOP-001",
        "toppingName": "Chocolate"
      },
      {
        "id": "TOP-030",
        "name": "Marsmallow",
        "price": 6000,
        "toppingId": "TOP-030",
        "toppingName": "Marsmallow"
      }
    ]
  },
  {
    "id": "MENU-003",
    "name": "Crepes cheese",
    "category_id": "CAT-001",
    "categoryName": "Crepes Manis",
    "price": 16500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "2",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-003",
        "rawMaterialName": "Cheese"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-014",
        "name": "Pistachio Kunafa",
        "price": 20000,
        "toppingId": "TOP-014",
        "toppingName": "Pistachio Kunafa"
      },
      {
        "id": "TOP-013",
        "name": "Choco Crunchy",
        "price": 9000,
        "toppingId": "TOP-013",
        "toppingName": "Choco Crunchy"
      },
      {
        "id": "TOP-012",
        "name": "Ovomaltine",
        "price": 9000,
        "toppingId": "TOP-012",
        "toppingName": "Ovomaltine"
      },
      {
        "id": "TOP-020",
        "name": "Cheese",
        "price": 5000,
        "toppingId": "TOP-020",
        "toppingName": "Cheese"
      },
      {
        "id": "TOP-011",
        "name": "Nutella",
        "price": 9000,
        "toppingId": "TOP-011",
        "toppingName": "Nutella"
      },
      {
        "id": "TOP-010",
        "name": "Silverqueen Matcha",
        "price": 9000,
        "toppingId": "TOP-010",
        "toppingName": "Silverqueen Matcha"
      },
      {
        "id": "TOP-009",
        "name": "Silverqueen",
        "price": 9000,
        "toppingId": "TOP-009",
        "toppingName": "Silverqueen"
      },
      {
        "id": "TOP-008",
        "name": "Banana",
        "price": 4000,
        "toppingId": "TOP-008",
        "toppingName": "Banana"
      },
      {
        "id": "TOP-007",
        "name": "Oreo",
        "price": 1600,
        "toppingId": "TOP-007",
        "toppingName": "Oreo"
      },
      {
        "id": "TOP-004",
        "name": "Milk",
        "price": 4000,
        "toppingId": "TOP-004",
        "toppingName": "Milk"
      },
      {
        "id": "TOP-006",
        "name": "Selai srikaya",
        "price": 4000,
        "toppingId": "TOP-006",
        "toppingName": "Selai srikaya"
      },
      {
        "id": "TOP-005",
        "name": "Selai Peanut",
        "price": 4000,
        "toppingId": "TOP-005",
        "toppingName": "Selai Peanut"
      },
      {
        "id": "TOP-003",
        "name": "Selai Blueberry",
        "price": 4000,
        "toppingId": "TOP-003",
        "toppingName": "Selai Blueberry"
      },
      {
        "id": "TOP-002",
        "name": "Selai Strawberry",
        "price": 4000,
        "toppingId": "TOP-002",
        "toppingName": "Selai Strawberry"
      },
      {
        "id": "TOP-001",
        "name": "Chocolate",
        "price": 4000,
        "toppingId": "TOP-001",
        "toppingName": "Chocolate"
      },
      {
        "id": "TOP-030",
        "name": "Marsmallow",
        "price": 6000,
        "toppingId": "TOP-030",
        "toppingName": "Marsmallow"
      }
    ]
  },
  {
    "id": "MENU-002",
    "name": "Crepes Blueberry",
    "category_id": "CAT-001",
    "categoryName": "Crepes Manis",
    "price": 15500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "30",
        "unitName": "Gram",
        "rawMaterialId": "RAW-006",
        "rawMaterialName": "Selai Blueberry"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-020",
        "name": "Cheese",
        "price": 5000,
        "toppingId": "TOP-020",
        "toppingName": "Cheese"
      },
      {
        "id": "TOP-014",
        "name": "Pistachio Kunafa",
        "price": 20000,
        "toppingId": "TOP-014",
        "toppingName": "Pistachio Kunafa"
      },
      {
        "id": "TOP-013",
        "name": "Choco Crunchy",
        "price": 9000,
        "toppingId": "TOP-013",
        "toppingName": "Choco Crunchy"
      },
      {
        "id": "TOP-011",
        "name": "Nutella",
        "price": 9000,
        "toppingId": "TOP-011",
        "toppingName": "Nutella"
      },
      {
        "id": "TOP-012",
        "name": "Ovomaltine",
        "price": 9000,
        "toppingId": "TOP-012",
        "toppingName": "Ovomaltine"
      },
      {
        "id": "TOP-010",
        "name": "Silverqueen Matcha",
        "price": 9000,
        "toppingId": "TOP-010",
        "toppingName": "Silverqueen Matcha"
      },
      {
        "id": "TOP-009",
        "name": "Silverqueen",
        "price": 9000,
        "toppingId": "TOP-009",
        "toppingName": "Silverqueen"
      },
      {
        "id": "TOP-006",
        "name": "Selai srikaya",
        "price": 4000,
        "toppingId": "TOP-006",
        "toppingName": "Selai srikaya"
      },
      {
        "id": "TOP-007",
        "name": "Oreo",
        "price": 1600,
        "toppingId": "TOP-007",
        "toppingName": "Oreo"
      },
      {
        "id": "TOP-005",
        "name": "Selai Peanut",
        "price": 4000,
        "toppingId": "TOP-005",
        "toppingName": "Selai Peanut"
      },
      {
        "id": "TOP-008",
        "name": "Banana",
        "price": 4000,
        "toppingId": "TOP-008",
        "toppingName": "Banana"
      },
      {
        "id": "TOP-004",
        "name": "Milk",
        "price": 4000,
        "toppingId": "TOP-004",
        "toppingName": "Milk"
      },
      {
        "id": "TOP-003",
        "name": "Selai Blueberry",
        "price": 4000,
        "toppingId": "TOP-003",
        "toppingName": "Selai Blueberry"
      },
      {
        "id": "TOP-002",
        "name": "Selai Strawberry",
        "price": 4000,
        "toppingId": "TOP-002",
        "toppingName": "Selai Strawberry"
      },
      {
        "id": "TOP-001",
        "name": "Chocolate",
        "price": 4000,
        "toppingId": "TOP-001",
        "toppingName": "Chocolate"
      },
      {
        "id": "TOP-030",
        "name": "Marsmallow",
        "price": 6000,
        "toppingId": "TOP-030",
        "toppingName": "Marsmallow"
      }
    ]
  },
  {
    "id": "MENU-019",
    "name": "Sausage Salad Cheese",
    "category_id": "CAT-002",
    "categoryName": "Crepes Asin",
    "price": 25500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-034",
        "rawMaterialName": "Sosis"
      },
      {
        "quantity": "5",
        "unitName": "Gram",
        "rawMaterialId": "RAW-036",
        "rawMaterialName": "Lettuce"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-038",
        "rawMaterialName": "Saos Sambal"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-037",
        "rawMaterialName": "Saus Tomat"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-039",
        "rawMaterialName": "Mayonaise"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-040",
        "rawMaterialName": "Cheese Slice"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-019",
        "name": "Cheese Slice",
        "price": 5000,
        "toppingId": "TOP-019",
        "toppingName": "Cheese Slice"
      },
      {
        "id": "TOP-018",
        "name": "Sausage",
        "price": 8000,
        "toppingId": "TOP-018",
        "toppingName": "Sausage"
      },
      {
        "id": "TOP-017",
        "name": "Smoke Beef",
        "price": 8000,
        "toppingId": "TOP-017",
        "toppingName": "Smoke Beef"
      },
      {
        "id": "TOP-016",
        "name": "Beef Burger",
        "price": 8000,
        "toppingId": "TOP-016",
        "toppingName": "Beef Burger"
      },
      {
        "id": "TOP-015",
        "name": "Tuna",
        "price": 8000,
        "toppingId": "TOP-015",
        "toppingName": "Tuna"
      }
    ]
  },
  {
    "id": "MENU-001",
    "name": "Crepes Banana",
    "category_id": "CAT-001",
    "categoryName": "Crepes Manis",
    "price": 15500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "2",
        "unitName": "Bungkus",
        "rawMaterialId": "RAW-002",
        "rawMaterialName": "Coklat"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-020",
        "name": "Cheese",
        "price": 5000,
        "toppingId": "TOP-020",
        "toppingName": "Cheese"
      },
      {
        "id": "TOP-014",
        "name": "Pistachio Kunafa",
        "price": 20000,
        "toppingId": "TOP-014",
        "toppingName": "Pistachio Kunafa"
      },
      {
        "id": "TOP-013",
        "name": "Choco Crunchy",
        "price": 9000,
        "toppingId": "TOP-013",
        "toppingName": "Choco Crunchy"
      },
      {
        "id": "TOP-012",
        "name": "Ovomaltine",
        "price": 9000,
        "toppingId": "TOP-012",
        "toppingName": "Ovomaltine"
      },
      {
        "id": "TOP-011",
        "name": "Nutella",
        "price": 9000,
        "toppingId": "TOP-011",
        "toppingName": "Nutella"
      },
      {
        "id": "TOP-008",
        "name": "Banana",
        "price": 4000,
        "toppingId": "TOP-008",
        "toppingName": "Banana"
      },
      {
        "id": "TOP-010",
        "name": "Silverqueen Matcha",
        "price": 9000,
        "toppingId": "TOP-010",
        "toppingName": "Silverqueen Matcha"
      },
      {
        "id": "TOP-004",
        "name": "Milk",
        "price": 4000,
        "toppingId": "TOP-004",
        "toppingName": "Milk"
      },
      {
        "id": "TOP-007",
        "name": "Oreo",
        "price": 1600,
        "toppingId": "TOP-007",
        "toppingName": "Oreo"
      },
      {
        "id": "TOP-009",
        "name": "Silverqueen",
        "price": 9000,
        "toppingId": "TOP-009",
        "toppingName": "Silverqueen"
      },
      {
        "id": "TOP-006",
        "name": "Selai srikaya",
        "price": 4000,
        "toppingId": "TOP-006",
        "toppingName": "Selai srikaya"
      },
      {
        "id": "TOP-005",
        "name": "Selai Peanut",
        "price": 4000,
        "toppingId": "TOP-005",
        "toppingName": "Selai Peanut"
      },
      {
        "id": "TOP-002",
        "name": "Selai Strawberry",
        "price": 4000,
        "toppingId": "TOP-002",
        "toppingName": "Selai Strawberry"
      },
      {
        "id": "TOP-003",
        "name": "Selai Blueberry",
        "price": 4000,
        "toppingId": "TOP-003",
        "toppingName": "Selai Blueberry"
      },
      {
        "id": "TOP-001",
        "name": "Chocolate",
        "price": 4000,
        "toppingId": "TOP-001",
        "toppingName": "Chocolate"
      },
      {
        "id": "TOP-030",
        "name": "Marsmallow",
        "price": 6000,
        "toppingId": "TOP-030",
        "toppingName": "Marsmallow"
      }
    ]
  },
  {
    "id": "MENU-011",
    "name": "Crepes Srikaya",
    "category_id": "CAT-001",
    "categoryName": "Crepes Manis",
    "price": 15500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "30",
        "unitName": "Gram",
        "rawMaterialId": "RAW-008",
        "rawMaterialName": "Selai Srikaya"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-020",
        "name": "Cheese",
        "price": 5000,
        "toppingId": "TOP-020",
        "toppingName": "Cheese"
      },
      {
        "id": "TOP-014",
        "name": "Pistachio Kunafa",
        "price": 20000,
        "toppingId": "TOP-014",
        "toppingName": "Pistachio Kunafa"
      },
      {
        "id": "TOP-013",
        "name": "Choco Crunchy",
        "price": 9000,
        "toppingId": "TOP-013",
        "toppingName": "Choco Crunchy"
      },
      {
        "id": "TOP-012",
        "name": "Ovomaltine",
        "price": 9000,
        "toppingId": "TOP-012",
        "toppingName": "Ovomaltine"
      },
      {
        "id": "TOP-011",
        "name": "Nutella",
        "price": 9000,
        "toppingId": "TOP-011",
        "toppingName": "Nutella"
      },
      {
        "id": "TOP-010",
        "name": "Silverqueen Matcha",
        "price": 9000,
        "toppingId": "TOP-010",
        "toppingName": "Silverqueen Matcha"
      },
      {
        "id": "TOP-009",
        "name": "Silverqueen",
        "price": 9000,
        "toppingId": "TOP-009",
        "toppingName": "Silverqueen"
      },
      {
        "id": "TOP-008",
        "name": "Banana",
        "price": 4000,
        "toppingId": "TOP-008",
        "toppingName": "Banana"
      },
      {
        "id": "TOP-007",
        "name": "Oreo",
        "price": 1600,
        "toppingId": "TOP-007",
        "toppingName": "Oreo"
      },
      {
        "id": "TOP-006",
        "name": "Selai srikaya",
        "price": 4000,
        "toppingId": "TOP-006",
        "toppingName": "Selai srikaya"
      },
      {
        "id": "TOP-005",
        "name": "Selai Peanut",
        "price": 4000,
        "toppingId": "TOP-005",
        "toppingName": "Selai Peanut"
      },
      {
        "id": "TOP-004",
        "name": "Milk",
        "price": 4000,
        "toppingId": "TOP-004",
        "toppingName": "Milk"
      },
      {
        "id": "TOP-003",
        "name": "Selai Blueberry",
        "price": 4000,
        "toppingId": "TOP-003",
        "toppingName": "Selai Blueberry"
      },
      {
        "id": "TOP-002",
        "name": "Selai Strawberry",
        "price": 4000,
        "toppingId": "TOP-002",
        "toppingName": "Selai Strawberry"
      },
      {
        "id": "TOP-001",
        "name": "Chocolate",
        "price": 4000,
        "toppingId": "TOP-001",
        "toppingName": "Chocolate"
      },
      {
        "id": "TOP-030",
        "name": "Marsmallow",
        "price": 6000,
        "toppingId": "TOP-030",
        "toppingName": "Marsmallow"
      }
    ]
  },
  {
    "id": "MENU-012",
    "name": "Crepes Silverqueen Matcha",
    "category_id": "CAT-001",
    "categoryName": "Crepes Manis",
    "price": 18500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "1",
        "unitName": "Bungkus",
        "rawMaterialId": "RAW-011",
        "rawMaterialName": "Silverqueen Matcha"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-020",
        "name": "Cheese",
        "price": 5000,
        "toppingId": "TOP-020",
        "toppingName": "Cheese"
      },
      {
        "id": "TOP-014",
        "name": "Pistachio Kunafa",
        "price": 20000,
        "toppingId": "TOP-014",
        "toppingName": "Pistachio Kunafa"
      },
      {
        "id": "TOP-013",
        "name": "Choco Crunchy",
        "price": 9000,
        "toppingId": "TOP-013",
        "toppingName": "Choco Crunchy"
      },
      {
        "id": "TOP-012",
        "name": "Ovomaltine",
        "price": 9000,
        "toppingId": "TOP-012",
        "toppingName": "Ovomaltine"
      },
      {
        "id": "TOP-011",
        "name": "Nutella",
        "price": 9000,
        "toppingId": "TOP-011",
        "toppingName": "Nutella"
      },
      {
        "id": "TOP-010",
        "name": "Silverqueen Matcha",
        "price": 9000,
        "toppingId": "TOP-010",
        "toppingName": "Silverqueen Matcha"
      },
      {
        "id": "TOP-009",
        "name": "Silverqueen",
        "price": 9000,
        "toppingId": "TOP-009",
        "toppingName": "Silverqueen"
      },
      {
        "id": "TOP-008",
        "name": "Banana",
        "price": 4000,
        "toppingId": "TOP-008",
        "toppingName": "Banana"
      },
      {
        "id": "TOP-006",
        "name": "Selai srikaya",
        "price": 4000,
        "toppingId": "TOP-006",
        "toppingName": "Selai srikaya"
      },
      {
        "id": "TOP-007",
        "name": "Oreo",
        "price": 1600,
        "toppingId": "TOP-007",
        "toppingName": "Oreo"
      },
      {
        "id": "TOP-005",
        "name": "Selai Peanut",
        "price": 4000,
        "toppingId": "TOP-005",
        "toppingName": "Selai Peanut"
      },
      {
        "id": "TOP-004",
        "name": "Milk",
        "price": 4000,
        "toppingId": "TOP-004",
        "toppingName": "Milk"
      },
      {
        "id": "TOP-003",
        "name": "Selai Blueberry",
        "price": 4000,
        "toppingId": "TOP-003",
        "toppingName": "Selai Blueberry"
      },
      {
        "id": "TOP-002",
        "name": "Selai Strawberry",
        "price": 4000,
        "toppingId": "TOP-002",
        "toppingName": "Selai Strawberry"
      },
      {
        "id": "TOP-001",
        "name": "Chocolate",
        "price": 4000,
        "toppingId": "TOP-001",
        "toppingName": "Chocolate"
      },
      {
        "id": "TOP-030",
        "name": "Marsmallow",
        "price": 6000,
        "toppingId": "TOP-030",
        "toppingName": "Marsmallow"
      }
    ]
  },
  {
    "id": "MENU-008",
    "name": "Crepes Silverqueen",
    "category_id": "CAT-001",
    "categoryName": "Crepes Manis",
    "price": 18500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "1",
        "unitName": "Bungkus",
        "rawMaterialId": "RAW-010",
        "rawMaterialName": "Silverqueen"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-020",
        "name": "Cheese",
        "price": 5000,
        "toppingId": "TOP-020",
        "toppingName": "Cheese"
      },
      {
        "id": "TOP-014",
        "name": "Pistachio Kunafa",
        "price": 20000,
        "toppingId": "TOP-014",
        "toppingName": "Pistachio Kunafa"
      },
      {
        "id": "TOP-013",
        "name": "Choco Crunchy",
        "price": 9000,
        "toppingId": "TOP-013",
        "toppingName": "Choco Crunchy"
      },
      {
        "id": "TOP-012",
        "name": "Ovomaltine",
        "price": 9000,
        "toppingId": "TOP-012",
        "toppingName": "Ovomaltine"
      },
      {
        "id": "TOP-011",
        "name": "Nutella",
        "price": 9000,
        "toppingId": "TOP-011",
        "toppingName": "Nutella"
      },
      {
        "id": "TOP-010",
        "name": "Silverqueen Matcha",
        "price": 9000,
        "toppingId": "TOP-010",
        "toppingName": "Silverqueen Matcha"
      },
      {
        "id": "TOP-009",
        "name": "Silverqueen",
        "price": 9000,
        "toppingId": "TOP-009",
        "toppingName": "Silverqueen"
      },
      {
        "id": "TOP-008",
        "name": "Banana",
        "price": 4000,
        "toppingId": "TOP-008",
        "toppingName": "Banana"
      },
      {
        "id": "TOP-007",
        "name": "Oreo",
        "price": 1600,
        "toppingId": "TOP-007",
        "toppingName": "Oreo"
      },
      {
        "id": "TOP-006",
        "name": "Selai srikaya",
        "price": 4000,
        "toppingId": "TOP-006",
        "toppingName": "Selai srikaya"
      },
      {
        "id": "TOP-005",
        "name": "Selai Peanut",
        "price": 4000,
        "toppingId": "TOP-005",
        "toppingName": "Selai Peanut"
      },
      {
        "id": "TOP-004",
        "name": "Milk",
        "price": 4000,
        "toppingId": "TOP-004",
        "toppingName": "Milk"
      },
      {
        "id": "TOP-003",
        "name": "Selai Blueberry",
        "price": 4000,
        "toppingId": "TOP-003",
        "toppingName": "Selai Blueberry"
      },
      {
        "id": "TOP-002",
        "name": "Selai Strawberry",
        "price": 4000,
        "toppingId": "TOP-002",
        "toppingName": "Selai Strawberry"
      },
      {
        "id": "TOP-001",
        "name": "Chocolate",
        "price": 4000,
        "toppingId": "TOP-001",
        "toppingName": "Chocolate"
      },
      {
        "id": "TOP-030",
        "name": "Marsmallow",
        "price": 6000,
        "toppingId": "TOP-030",
        "toppingName": "Marsmallow"
      }
    ]
  },
  {
    "id": "MENU-010",
    "name": "Crepes Nutella",
    "category_id": "CAT-001",
    "categoryName": "Crepes Manis",
    "price": 18500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "30",
        "unitName": "Gram",
        "rawMaterialId": "RAW-015",
        "rawMaterialName": "Nuttella"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-020",
        "name": "Cheese",
        "price": 5000,
        "toppingId": "TOP-020",
        "toppingName": "Cheese"
      },
      {
        "id": "TOP-014",
        "name": "Pistachio Kunafa",
        "price": 20000,
        "toppingId": "TOP-014",
        "toppingName": "Pistachio Kunafa"
      },
      {
        "id": "TOP-013",
        "name": "Choco Crunchy",
        "price": 9000,
        "toppingId": "TOP-013",
        "toppingName": "Choco Crunchy"
      },
      {
        "id": "TOP-012",
        "name": "Ovomaltine",
        "price": 9000,
        "toppingId": "TOP-012",
        "toppingName": "Ovomaltine"
      },
      {
        "id": "TOP-011",
        "name": "Nutella",
        "price": 9000,
        "toppingId": "TOP-011",
        "toppingName": "Nutella"
      },
      {
        "id": "TOP-010",
        "name": "Silverqueen Matcha",
        "price": 9000,
        "toppingId": "TOP-010",
        "toppingName": "Silverqueen Matcha"
      },
      {
        "id": "TOP-009",
        "name": "Silverqueen",
        "price": 9000,
        "toppingId": "TOP-009",
        "toppingName": "Silverqueen"
      },
      {
        "id": "TOP-008",
        "name": "Banana",
        "price": 4000,
        "toppingId": "TOP-008",
        "toppingName": "Banana"
      },
      {
        "id": "TOP-007",
        "name": "Oreo",
        "price": 1600,
        "toppingId": "TOP-007",
        "toppingName": "Oreo"
      },
      {
        "id": "TOP-006",
        "name": "Selai srikaya",
        "price": 4000,
        "toppingId": "TOP-006",
        "toppingName": "Selai srikaya"
      },
      {
        "id": "TOP-005",
        "name": "Selai Peanut",
        "price": 4000,
        "toppingId": "TOP-005",
        "toppingName": "Selai Peanut"
      },
      {
        "id": "TOP-004",
        "name": "Milk",
        "price": 4000,
        "toppingId": "TOP-004",
        "toppingName": "Milk"
      },
      {
        "id": "TOP-003",
        "name": "Selai Blueberry",
        "price": 4000,
        "toppingId": "TOP-003",
        "toppingName": "Selai Blueberry"
      },
      {
        "id": "TOP-002",
        "name": "Selai Strawberry",
        "price": 4000,
        "toppingId": "TOP-002",
        "toppingName": "Selai Strawberry"
      },
      {
        "id": "TOP-001",
        "name": "Chocolate",
        "price": 4000,
        "toppingId": "TOP-001",
        "toppingName": "Chocolate"
      },
      {
        "id": "TOP-030",
        "name": "Marsmallow",
        "price": 6000,
        "toppingId": "TOP-030",
        "toppingName": "Marsmallow"
      }
    ]
  },
  {
    "id": "MENU-015",
    "name": "Crepes Choco  Crunchy",
    "category_id": "CAT-001",
    "categoryName": "Crepes Manis",
    "price": 20500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-020",
        "name": "Cheese",
        "price": 5000,
        "toppingId": "TOP-020",
        "toppingName": "Cheese"
      },
      {
        "id": "TOP-014",
        "name": "Pistachio Kunafa",
        "price": 20000,
        "toppingId": "TOP-014",
        "toppingName": "Pistachio Kunafa"
      },
      {
        "id": "TOP-013",
        "name": "Choco Crunchy",
        "price": 9000,
        "toppingId": "TOP-013",
        "toppingName": "Choco Crunchy"
      },
      {
        "id": "TOP-012",
        "name": "Ovomaltine",
        "price": 9000,
        "toppingId": "TOP-012",
        "toppingName": "Ovomaltine"
      },
      {
        "id": "TOP-010",
        "name": "Silverqueen Matcha",
        "price": 9000,
        "toppingId": "TOP-010",
        "toppingName": "Silverqueen Matcha"
      },
      {
        "id": "TOP-015",
        "name": "Tuna",
        "price": 8000,
        "toppingId": "TOP-015",
        "toppingName": "Tuna"
      },
      {
        "id": "TOP-011",
        "name": "Nutella",
        "price": 9000,
        "toppingId": "TOP-011",
        "toppingName": "Nutella"
      },
      {
        "id": "TOP-009",
        "name": "Silverqueen",
        "price": 9000,
        "toppingId": "TOP-009",
        "toppingName": "Silverqueen"
      },
      {
        "id": "TOP-008",
        "name": "Banana",
        "price": 4000,
        "toppingId": "TOP-008",
        "toppingName": "Banana"
      },
      {
        "id": "TOP-007",
        "name": "Oreo",
        "price": 1600,
        "toppingId": "TOP-007",
        "toppingName": "Oreo"
      },
      {
        "id": "TOP-006",
        "name": "Selai srikaya",
        "price": 4000,
        "toppingId": "TOP-006",
        "toppingName": "Selai srikaya"
      },
      {
        "id": "TOP-004",
        "name": "Milk",
        "price": 4000,
        "toppingId": "TOP-004",
        "toppingName": "Milk"
      },
      {
        "id": "TOP-005",
        "name": "Selai Peanut",
        "price": 4000,
        "toppingId": "TOP-005",
        "toppingName": "Selai Peanut"
      },
      {
        "id": "TOP-003",
        "name": "Selai Blueberry",
        "price": 4000,
        "toppingId": "TOP-003",
        "toppingName": "Selai Blueberry"
      },
      {
        "id": "TOP-002",
        "name": "Selai Strawberry",
        "price": 4000,
        "toppingId": "TOP-002",
        "toppingName": "Selai Strawberry"
      },
      {
        "id": "TOP-001",
        "name": "Chocolate",
        "price": 4000,
        "toppingId": "TOP-001",
        "toppingName": "Chocolate"
      }
    ]
  },
  {
    "id": "MENU-006",
    "name": "Crepes Oreo",
    "category_id": "CAT-001",
    "categoryName": "Crepes Manis",
    "price": 15500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-020",
        "name": "Cheese",
        "price": 5000,
        "toppingId": "TOP-020",
        "toppingName": "Cheese"
      },
      {
        "id": "TOP-014",
        "name": "Pistachio Kunafa",
        "price": 20000,
        "toppingId": "TOP-014",
        "toppingName": "Pistachio Kunafa"
      },
      {
        "id": "TOP-013",
        "name": "Choco Crunchy",
        "price": 9000,
        "toppingId": "TOP-013",
        "toppingName": "Choco Crunchy"
      },
      {
        "id": "TOP-012",
        "name": "Ovomaltine",
        "price": 9000,
        "toppingId": "TOP-012",
        "toppingName": "Ovomaltine"
      },
      {
        "id": "TOP-011",
        "name": "Nutella",
        "price": 9000,
        "toppingId": "TOP-011",
        "toppingName": "Nutella"
      },
      {
        "id": "TOP-010",
        "name": "Silverqueen Matcha",
        "price": 9000,
        "toppingId": "TOP-010",
        "toppingName": "Silverqueen Matcha"
      },
      {
        "id": "TOP-009",
        "name": "Silverqueen",
        "price": 9000,
        "toppingId": "TOP-009",
        "toppingName": "Silverqueen"
      },
      {
        "id": "TOP-008",
        "name": "Banana",
        "price": 4000,
        "toppingId": "TOP-008",
        "toppingName": "Banana"
      },
      {
        "id": "TOP-007",
        "name": "Oreo",
        "price": 1600,
        "toppingId": "TOP-007",
        "toppingName": "Oreo"
      },
      {
        "id": "TOP-006",
        "name": "Selai srikaya",
        "price": 4000,
        "toppingId": "TOP-006",
        "toppingName": "Selai srikaya"
      },
      {
        "id": "TOP-005",
        "name": "Selai Peanut",
        "price": 4000,
        "toppingId": "TOP-005",
        "toppingName": "Selai Peanut"
      },
      {
        "id": "TOP-004",
        "name": "Milk",
        "price": 4000,
        "toppingId": "TOP-004",
        "toppingName": "Milk"
      },
      {
        "id": "TOP-003",
        "name": "Selai Blueberry",
        "price": 4000,
        "toppingId": "TOP-003",
        "toppingName": "Selai Blueberry"
      },
      {
        "id": "TOP-002",
        "name": "Selai Strawberry",
        "price": 4000,
        "toppingId": "TOP-002",
        "toppingName": "Selai Strawberry"
      },
      {
        "id": "TOP-001",
        "name": "Chocolate",
        "price": 4000,
        "toppingId": "TOP-001",
        "toppingName": "Chocolate"
      },
      {
        "id": "TOP-030",
        "name": "Marsmallow",
        "price": 6000,
        "toppingId": "TOP-030",
        "toppingName": "Marsmallow"
      }
    ]
  },
  {
    "id": "MENU-007",
    "name": "Crepes Peanut",
    "category_id": "CAT-001",
    "categoryName": "Crepes Manis",
    "price": 17000,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "30",
        "unitName": "Gram",
        "rawMaterialId": "RAW-007",
        "rawMaterialName": "Selai Peanut"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-014",
        "name": "Pistachio Kunafa",
        "price": 20000,
        "toppingId": "TOP-014",
        "toppingName": "Pistachio Kunafa"
      },
      {
        "id": "TOP-020",
        "name": "Cheese",
        "price": 5000,
        "toppingId": "TOP-020",
        "toppingName": "Cheese"
      },
      {
        "id": "TOP-012",
        "name": "Ovomaltine",
        "price": 9000,
        "toppingId": "TOP-012",
        "toppingName": "Ovomaltine"
      },
      {
        "id": "TOP-013",
        "name": "Choco Crunchy",
        "price": 9000,
        "toppingId": "TOP-013",
        "toppingName": "Choco Crunchy"
      },
      {
        "id": "TOP-011",
        "name": "Nutella",
        "price": 9000,
        "toppingId": "TOP-011",
        "toppingName": "Nutella"
      },
      {
        "id": "TOP-010",
        "name": "Silverqueen Matcha",
        "price": 9000,
        "toppingId": "TOP-010",
        "toppingName": "Silverqueen Matcha"
      },
      {
        "id": "TOP-009",
        "name": "Silverqueen",
        "price": 9000,
        "toppingId": "TOP-009",
        "toppingName": "Silverqueen"
      },
      {
        "id": "TOP-008",
        "name": "Banana",
        "price": 4000,
        "toppingId": "TOP-008",
        "toppingName": "Banana"
      },
      {
        "id": "TOP-007",
        "name": "Oreo",
        "price": 1600,
        "toppingId": "TOP-007",
        "toppingName": "Oreo"
      },
      {
        "id": "TOP-006",
        "name": "Selai srikaya",
        "price": 4000,
        "toppingId": "TOP-006",
        "toppingName": "Selai srikaya"
      },
      {
        "id": "TOP-005",
        "name": "Selai Peanut",
        "price": 4000,
        "toppingId": "TOP-005",
        "toppingName": "Selai Peanut"
      },
      {
        "id": "TOP-004",
        "name": "Milk",
        "price": 4000,
        "toppingId": "TOP-004",
        "toppingName": "Milk"
      },
      {
        "id": "TOP-003",
        "name": "Selai Blueberry",
        "price": 4000,
        "toppingId": "TOP-003",
        "toppingName": "Selai Blueberry"
      },
      {
        "id": "TOP-002",
        "name": "Selai Strawberry",
        "price": 4000,
        "toppingId": "TOP-002",
        "toppingName": "Selai Strawberry"
      },
      {
        "id": "TOP-001",
        "name": "Chocolate",
        "price": 4000,
        "toppingId": "TOP-001",
        "toppingName": "Chocolate"
      },
      {
        "id": "TOP-030",
        "name": "Marsmallow",
        "price": 6000,
        "toppingId": "TOP-030",
        "toppingName": "Marsmallow"
      }
    ]
  },
  {
    "id": "MENU-013",
    "name": "Crepes Pistachio Kunafa",
    "category_id": "CAT-001",
    "categoryName": "Crepes Manis",
    "price": 31500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "33",
        "unitName": "Gram",
        "rawMaterialId": "RAW-009",
        "rawMaterialName": "Selai Pistachio K"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-020",
        "name": "Cheese",
        "price": 5000,
        "toppingId": "TOP-020",
        "toppingName": "Cheese"
      },
      {
        "id": "TOP-014",
        "name": "Pistachio Kunafa",
        "price": 20000,
        "toppingId": "TOP-014",
        "toppingName": "Pistachio Kunafa"
      },
      {
        "id": "TOP-013",
        "name": "Choco Crunchy",
        "price": 9000,
        "toppingId": "TOP-013",
        "toppingName": "Choco Crunchy"
      },
      {
        "id": "TOP-012",
        "name": "Ovomaltine",
        "price": 9000,
        "toppingId": "TOP-012",
        "toppingName": "Ovomaltine"
      },
      {
        "id": "TOP-011",
        "name": "Nutella",
        "price": 9000,
        "toppingId": "TOP-011",
        "toppingName": "Nutella"
      },
      {
        "id": "TOP-010",
        "name": "Silverqueen Matcha",
        "price": 9000,
        "toppingId": "TOP-010",
        "toppingName": "Silverqueen Matcha"
      },
      {
        "id": "TOP-009",
        "name": "Silverqueen",
        "price": 9000,
        "toppingId": "TOP-009",
        "toppingName": "Silverqueen"
      },
      {
        "id": "TOP-008",
        "name": "Banana",
        "price": 4000,
        "toppingId": "TOP-008",
        "toppingName": "Banana"
      },
      {
        "id": "TOP-007",
        "name": "Oreo",
        "price": 1600,
        "toppingId": "TOP-007",
        "toppingName": "Oreo"
      },
      {
        "id": "TOP-006",
        "name": "Selai srikaya",
        "price": 4000,
        "toppingId": "TOP-006",
        "toppingName": "Selai srikaya"
      },
      {
        "id": "TOP-005",
        "name": "Selai Peanut",
        "price": 4000,
        "toppingId": "TOP-005",
        "toppingName": "Selai Peanut"
      },
      {
        "id": "TOP-004",
        "name": "Milk",
        "price": 4000,
        "toppingId": "TOP-004",
        "toppingName": "Milk"
      },
      {
        "id": "TOP-003",
        "name": "Selai Blueberry",
        "price": 4000,
        "toppingId": "TOP-003",
        "toppingName": "Selai Blueberry"
      },
      {
        "id": "TOP-002",
        "name": "Selai Strawberry",
        "price": 4000,
        "toppingId": "TOP-002",
        "toppingName": "Selai Strawberry"
      },
      {
        "id": "TOP-001",
        "name": "Chocolate",
        "price": 4000,
        "toppingId": "TOP-001",
        "toppingName": "Chocolate"
      },
      {
        "id": "TOP-030",
        "name": "Marsmallow",
        "price": 6000,
        "toppingId": "TOP-030",
        "toppingName": "Marsmallow"
      }
    ]
  },
  {
    "id": "MENU-024",
    "name": "Mini Crepes Chocolate",
    "category_id": "CAT-003",
    "categoryName": "Mini Crepes",
    "price": 8000,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "44",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "1",
        "unitName": "Bungkus",
        "rawMaterialId": "RAW-002",
        "rawMaterialName": "Coklat"
      }
    ],
    "toppings": []
  },
  {
    "id": "MENU-025",
    "name": "Mini Crepes Blueberry",
    "category_id": "CAT-003",
    "categoryName": "Mini Crepes",
    "price": 8000,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "44",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "15",
        "unitName": "Gram",
        "rawMaterialId": "RAW-006",
        "rawMaterialName": "Selai Blueberry"
      }
    ],
    "toppings": []
  },
  {
    "id": "MENU-026",
    "name": "Mini Crepes Cheese",
    "category_id": "CAT-003",
    "categoryName": "Mini Crepes",
    "price": 9000,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "44",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-003",
        "rawMaterialName": "Cheese"
      }
    ],
    "toppings": []
  },
  {
    "id": "MENU-027",
    "name": "Mini Crepes Milk",
    "category_id": "CAT-003",
    "categoryName": "Mini Crepes",
    "price": 8000,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "44",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "15",
        "unitName": "Gram",
        "rawMaterialId": "RAW-014",
        "rawMaterialName": "Milk"
      }
    ],
    "toppings": []
  },
  {
    "id": "MENU-028",
    "name": "Mini crepes Oreo",
    "category_id": "CAT-003",
    "categoryName": "Mini Crepes",
    "price": 8000,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "44",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "1",
        "unitName": "Bungkus",
        "rawMaterialId": "RAW-004",
        "rawMaterialName": "Oreo"
      }
    ],
    "toppings": []
  },
  {
    "id": "MENU-029",
    "name": "Mini Crepes Peanut",
    "category_id": "CAT-003",
    "categoryName": "Mini Crepes",
    "price": 8000,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "44",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "15",
        "unitName": "Gram",
        "rawMaterialId": "RAW-007",
        "rawMaterialName": "Selai Peanut"
      }
    ],
    "toppings": []
  },
  {
    "id": "MENU-030",
    "name": "Mini Crepes Strawberry",
    "category_id": "CAT-003",
    "categoryName": "Mini Crepes",
    "price": 8000,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "44",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "15",
        "unitName": "Gram",
        "rawMaterialId": "RAW-005",
        "rawMaterialName": "Selai strawberry"
      }
    ],
    "toppings": []
  },
  {
    "id": "MENU-031",
    "name": "Ice Cream Cone",
    "category_id": "CAT-004",
    "categoryName": "Desert",
    "price": 8000,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "80",
        "unitName": "Gram",
        "rawMaterialId": "RAW-019",
        "rawMaterialName": "Ice Cream"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-024",
        "rawMaterialName": "Cone"
      }
    ],
    "toppings": []
  },
  {
    "id": "MENU-032",
    "name": "Ice Cup Mix",
    "category_id": "CAT-004",
    "categoryName": "Desert",
    "price": 8000,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "80",
        "unitName": "Gram",
        "rawMaterialId": "RAW-019",
        "rawMaterialName": "Ice Cream"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-042",
        "rawMaterialName": "Cup Xcrepes"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-029",
        "rawMaterialName": "Sendok Plastik"
      }
    ],
    "toppings": []
  },
  {
    "id": "MENU-033",
    "name": "Ice Crepes Cup",
    "category_id": "CAT-004",
    "categoryName": "Dessert",
    "price": 10000,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "80",
        "unitName": "Gram",
        "rawMaterialId": "RAW-019",
        "rawMaterialName": "Ice Cream"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-042",
        "rawMaterialName": "Cup Xcrepes"
      },
      {
        "quantity": "44",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-029",
        "rawMaterialName": "Sendok Plastik"
      }
    ],
    "toppings": []
  },
  {
    "id": "MENU-034",
    "name": "Ice Crepes Cup Top",
    "category_id": "CAT-004",
    "categoryName": "Dessert",
    "price": 13000,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "80",
        "unitName": "Gram",
        "rawMaterialId": "RAW-019",
        "rawMaterialName": "Ice Cream"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-042",
        "rawMaterialName": "Cup Xcrepes"
      },
      {
        "quantity": "44",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-029",
        "rawMaterialName": "Sendok Plastik"
      },
      {
        "quantity": "3",
        "unitName": "Gram",
        "rawMaterialId": "RAW-020",
        "rawMaterialName": "Chacha"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-025",
        "rawMaterialName": "Choco Stick"
      }
    ],
    "toppings": []
  },
  {
    "id": "MENU-035",
    "name": "Ice cream crepes",
    "category_id": "CAT-004",
    "categoryName": "Dessert",
    "price": 20000,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "160",
        "unitName": "Gram",
        "rawMaterialId": "RAW-019",
        "rawMaterialName": "Ice Cream"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-029",
        "rawMaterialName": "Sendok Plastik"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-013",
        "rawMaterialName": "pisang"
      }
    ],
    "toppings": []
  },
  {
    "id": "MENU-036",
    "name": "Ice Cream Crepes Top",
    "category_id": "CAT-004",
    "categoryName": "Dessert",
    "price": 22000,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "160",
        "unitName": "Gram",
        "rawMaterialId": "RAW-019",
        "rawMaterialName": "Ice Cream"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-029",
        "rawMaterialName": "Sendok Plastik"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-013",
        "rawMaterialName": "pisang"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-022",
        "rawMaterialName": "Yupi"
      },
      {
        "quantity": "3",
        "unitName": "Gram",
        "rawMaterialId": "RAW-020",
        "rawMaterialName": "Chacha"
      },
      {
        "quantity": "1",
        "unitName": "Batang",
        "rawMaterialId": "RAW-023",
        "rawMaterialName": "Astor"
      }
    ],
    "toppings": []
  },
  {
    "id": "MENU-037",
    "name": "Banana split",
    "category_id": "CAT-004",
    "categoryName": "Dessert",
    "price": 24000,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-013",
        "rawMaterialName": "pisang"
      },
      {
        "quantity": "240",
        "unitName": "Gram",
        "rawMaterialId": "RAW-019",
        "rawMaterialName": "Ice Cream"
      },
      {
        "quantity": "3",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-030",
        "rawMaterialName": "Cherry"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-029",
        "rawMaterialName": "Sendok Plastik"
      }
    ],
    "toppings": []
  },
  {
    "id": "MENU-023",
    "name": "Tuna Salad Cheese",
    "category_id": "CAT-002",
    "categoryName": "Crepes Asin",
    "price": 25500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "1",
        "unitName": "Gram",
        "rawMaterialId": "RAW-035",
        "rawMaterialName": "Tuna"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-037",
        "rawMaterialName": "Saus Tomat"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-038",
        "rawMaterialName": "Saos Sambal"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-039",
        "rawMaterialName": "Mayonaise"
      },
      {
        "quantity": "5",
        "unitName": "Gram",
        "rawMaterialId": "RAW-036",
        "rawMaterialName": "Lettuce"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-040",
        "rawMaterialName": "Cheese Slice"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-019",
        "name": "Cheese Slice",
        "price": 5000,
        "toppingId": "TOP-019",
        "toppingName": "Cheese Slice"
      },
      {
        "id": "TOP-018",
        "name": "Sausage",
        "price": 8000,
        "toppingId": "TOP-018",
        "toppingName": "Sausage"
      },
      {
        "id": "TOP-017",
        "name": "Smoke Beef",
        "price": 8000,
        "toppingId": "TOP-017",
        "toppingName": "Smoke Beef"
      },
      {
        "id": "TOP-016",
        "name": "Beef Burger",
        "price": 8000,
        "toppingId": "TOP-016",
        "toppingName": "Beef Burger"
      },
      {
        "id": "TOP-015",
        "name": "Tuna",
        "price": 8000,
        "toppingId": "TOP-015",
        "toppingName": "Tuna"
      }
    ]
  },
  {
    "id": "MENU-022",
    "name": "Tuna Salad",
    "category_id": "CAT-002",
    "categoryName": "Crepes Asin",
    "price": 22500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "1",
        "unitName": "Gram",
        "rawMaterialId": "RAW-035",
        "rawMaterialName": "Tuna"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-037",
        "rawMaterialName": "Saus Tomat"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-038",
        "rawMaterialName": "Saos Sambal"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-039",
        "rawMaterialName": "Mayonaise"
      },
      {
        "quantity": "5",
        "unitName": "Gram",
        "rawMaterialId": "RAW-036",
        "rawMaterialName": "Lettuce"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-019",
        "name": "Cheese Slice",
        "price": 5000,
        "toppingId": "TOP-019",
        "toppingName": "Cheese Slice"
      },
      {
        "id": "TOP-018",
        "name": "Sausage",
        "price": 8000,
        "toppingId": "TOP-018",
        "toppingName": "Sausage"
      },
      {
        "id": "TOP-017",
        "name": "Smoke Beef",
        "price": 8000,
        "toppingId": "TOP-017",
        "toppingName": "Smoke Beef"
      },
      {
        "id": "TOP-016",
        "name": "Beef Burger",
        "price": 8000,
        "toppingId": "TOP-016",
        "toppingName": "Beef Burger"
      },
      {
        "id": "TOP-015",
        "name": "Tuna",
        "price": 8000,
        "toppingId": "TOP-015",
        "toppingName": "Tuna"
      }
    ]
  },
  {
    "id": "MENU-021",
    "name": "Smoke Beef Salad Cheese",
    "category_id": "CAT-002",
    "categoryName": "Crepes Asin",
    "price": 25500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-033",
        "rawMaterialName": "Smoke Beef"
      },
      {
        "quantity": "5",
        "unitName": "Gram",
        "rawMaterialId": "RAW-036",
        "rawMaterialName": "Lettuce"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-037",
        "rawMaterialName": "Saus Tomat"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-038",
        "rawMaterialName": "Saos Sambal"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-039",
        "rawMaterialName": "Mayonaise"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-040",
        "rawMaterialName": "Cheese Slice"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-019",
        "name": "Cheese Slice",
        "price": 5000,
        "toppingId": "TOP-019",
        "toppingName": "Cheese Slice"
      },
      {
        "id": "TOP-018",
        "name": "Sausage",
        "price": 8000,
        "toppingId": "TOP-018",
        "toppingName": "Sausage"
      },
      {
        "id": "TOP-017",
        "name": "Smoke Beef",
        "price": 8000,
        "toppingId": "TOP-017",
        "toppingName": "Smoke Beef"
      },
      {
        "id": "TOP-016",
        "name": "Beef Burger",
        "price": 8000,
        "toppingId": "TOP-016",
        "toppingName": "Beef Burger"
      },
      {
        "id": "TOP-015",
        "name": "Tuna",
        "price": 8000,
        "toppingId": "TOP-015",
        "toppingName": "Tuna"
      }
    ]
  },
  {
    "id": "MENU-020",
    "name": "Smoke Beef Salad",
    "category_id": "CAT-002",
    "categoryName": "Crepes Asin",
    "price": 22500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-033",
        "rawMaterialName": "Smoke Beef"
      },
      {
        "quantity": "5",
        "unitName": "Gram",
        "rawMaterialId": "RAW-036",
        "rawMaterialName": "Lettuce"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-037",
        "rawMaterialName": "Saus Tomat"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-038",
        "rawMaterialName": "Saos Sambal"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-039",
        "rawMaterialName": "Mayonaise"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-019",
        "name": "Cheese Slice",
        "price": 5000,
        "toppingId": "TOP-019",
        "toppingName": "Cheese Slice"
      },
      {
        "id": "TOP-018",
        "name": "Sausage",
        "price": 8000,
        "toppingId": "TOP-018",
        "toppingName": "Sausage"
      },
      {
        "id": "TOP-017",
        "name": "Smoke Beef",
        "price": 8000,
        "toppingId": "TOP-017",
        "toppingName": "Smoke Beef"
      },
      {
        "id": "TOP-015",
        "name": "Tuna",
        "price": 8000,
        "toppingId": "TOP-015",
        "toppingName": "Tuna"
      },
      {
        "id": "TOP-016",
        "name": "Beef Burger",
        "price": 8000,
        "toppingId": "TOP-016",
        "toppingName": "Beef Burger"
      }
    ]
  },
  {
    "id": "MENU-014",
    "name": "Crepes ovomaltine",
    "category_id": "CAT-001",
    "categoryName": "Crepes Manis",
    "price": 20500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "33",
        "unitName": "Gram",
        "rawMaterialId": "RAW-017",
        "rawMaterialName": "Ovomaltine"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-020",
        "name": "Cheese",
        "price": 5000,
        "toppingId": "TOP-020",
        "toppingName": "Cheese"
      },
      {
        "id": "TOP-014",
        "name": "Pistachio Kunafa",
        "price": 20000,
        "toppingId": "TOP-014",
        "toppingName": "Pistachio Kunafa"
      },
      {
        "id": "TOP-013",
        "name": "Choco Crunchy",
        "price": 9000,
        "toppingId": "TOP-013",
        "toppingName": "Choco Crunchy"
      },
      {
        "id": "TOP-012",
        "name": "Ovomaltine",
        "price": 9000,
        "toppingId": "TOP-012",
        "toppingName": "Ovomaltine"
      },
      {
        "id": "TOP-011",
        "name": "Nutella",
        "price": 9000,
        "toppingId": "TOP-011",
        "toppingName": "Nutella"
      },
      {
        "id": "TOP-010",
        "name": "Silverqueen Matcha",
        "price": 9000,
        "toppingId": "TOP-010",
        "toppingName": "Silverqueen Matcha"
      },
      {
        "id": "TOP-009",
        "name": "Silverqueen",
        "price": 9000,
        "toppingId": "TOP-009",
        "toppingName": "Silverqueen"
      },
      {
        "id": "TOP-008",
        "name": "Banana",
        "price": 4000,
        "toppingId": "TOP-008",
        "toppingName": "Banana"
      },
      {
        "id": "TOP-007",
        "name": "Oreo",
        "price": 1600,
        "toppingId": "TOP-007",
        "toppingName": "Oreo"
      },
      {
        "id": "TOP-006",
        "name": "Selai srikaya",
        "price": 4000,
        "toppingId": "TOP-006",
        "toppingName": "Selai srikaya"
      },
      {
        "id": "TOP-005",
        "name": "Selai Peanut",
        "price": 4000,
        "toppingId": "TOP-005",
        "toppingName": "Selai Peanut"
      },
      {
        "id": "TOP-004",
        "name": "Milk",
        "price": 4000,
        "toppingId": "TOP-004",
        "toppingName": "Milk"
      },
      {
        "id": "TOP-003",
        "name": "Selai Blueberry",
        "price": 4000,
        "toppingId": "TOP-003",
        "toppingName": "Selai Blueberry"
      },
      {
        "id": "TOP-002",
        "name": "Selai Strawberry",
        "price": 4000,
        "toppingId": "TOP-002",
        "toppingName": "Selai Strawberry"
      },
      {
        "id": "TOP-001",
        "name": "Chocolate",
        "price": 4000,
        "toppingId": "TOP-001",
        "toppingName": "Chocolate"
      },
      {
        "id": "TOP-030",
        "name": "Marsmallow",
        "price": 6000,
        "toppingId": "TOP-030",
        "toppingName": "Marsmallow"
      }
    ]
  },
  {
    "id": "MENU-018",
    "name": "Sausage Salad",
    "category_id": "CAT-002",
    "categoryName": "Crepes Asin",
    "price": 22500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-037",
        "rawMaterialName": "Saus Tomat"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-038",
        "rawMaterialName": "Saos Sambal"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-039",
        "rawMaterialName": "Mayonaise"
      },
      {
        "quantity": "5",
        "unitName": "Gram",
        "rawMaterialId": "RAW-036",
        "rawMaterialName": "Lettuce"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-034",
        "rawMaterialName": "Sosis"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-019",
        "name": "Cheese Slice",
        "price": 5000,
        "toppingId": "TOP-019",
        "toppingName": "Cheese Slice"
      },
      {
        "id": "TOP-018",
        "name": "Sausage",
        "price": 8000,
        "toppingId": "TOP-018",
        "toppingName": "Sausage"
      },
      {
        "id": "TOP-017",
        "name": "Smoke Beef",
        "price": 8000,
        "toppingId": "TOP-017",
        "toppingName": "Smoke Beef"
      },
      {
        "id": "TOP-016",
        "name": "Beef Burger",
        "price": 8000,
        "toppingId": "TOP-016",
        "toppingName": "Beef Burger"
      },
      {
        "id": "TOP-015",
        "name": "Tuna",
        "price": 8000,
        "toppingId": "TOP-015",
        "toppingName": "Tuna"
      }
    ]
  },
  {
    "id": "MENU-017",
    "name": "Beef Burger Salad cheese",
    "category_id": "CAT-002",
    "categoryName": "Crepes Asin",
    "price": 25500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-032",
        "rawMaterialName": "Beef Burger"
      },
      {
        "quantity": "1",
        "unitName": "Pcs",
        "rawMaterialId": "RAW-040",
        "rawMaterialName": "Cheese Slice"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-037",
        "rawMaterialName": "Saus Tomat"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-038",
        "rawMaterialName": "Saos Sambal"
      },
      {
        "quantity": "2",
        "unitName": "Gram",
        "rawMaterialId": "RAW-039",
        "rawMaterialName": "Mayonaise"
      },
      {
        "quantity": "5",
        "unitName": "Gram",
        "rawMaterialId": "RAW-036",
        "rawMaterialName": "Lettuce"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-019",
        "name": "Cheese Slice",
        "price": 5000,
        "toppingId": "TOP-019",
        "toppingName": "Cheese Slice"
      },
      {
        "id": "TOP-018",
        "name": "Sausage",
        "price": 8000,
        "toppingId": "TOP-018",
        "toppingName": "Sausage"
      },
      {
        "id": "TOP-017",
        "name": "Smoke Beef",
        "price": 8000,
        "toppingId": "TOP-017",
        "toppingName": "Smoke Beef"
      },
      {
        "id": "TOP-016",
        "name": "Beef Burger",
        "price": 8000,
        "toppingId": "TOP-016",
        "toppingName": "Beef Burger"
      },
      {
        "id": "TOP-015",
        "name": "Tuna",
        "price": 8000,
        "toppingId": "TOP-015",
        "toppingName": "Tuna"
      }
    ]
  },
  {
    "id": "MENU-004",
    "name": "Crepes Chocolate",
    "category_id": "CAT-001",
    "categoryName": "Crepes Manis",
    "price": 15500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      },
      {
        "quantity": "2",
        "unitName": "Bungkus",
        "rawMaterialId": "RAW-002",
        "rawMaterialName": "Coklat"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-020",
        "name": "Cheese",
        "price": 5000,
        "toppingId": "TOP-020",
        "toppingName": "Cheese"
      },
      {
        "id": "TOP-014",
        "name": "Pistachio Kunafa",
        "price": 20000,
        "toppingId": "TOP-014",
        "toppingName": "Pistachio Kunafa"
      },
      {
        "id": "TOP-013",
        "name": "Choco Crunchy",
        "price": 9000,
        "toppingId": "TOP-013",
        "toppingName": "Choco Crunchy"
      },
      {
        "id": "TOP-012",
        "name": "Ovomaltine",
        "price": 9000,
        "toppingId": "TOP-012",
        "toppingName": "Ovomaltine"
      },
      {
        "id": "TOP-011",
        "name": "Nutella",
        "price": 9000,
        "toppingId": "TOP-011",
        "toppingName": "Nutella"
      },
      {
        "id": "TOP-010",
        "name": "Silverqueen Matcha",
        "price": 9000,
        "toppingId": "TOP-010",
        "toppingName": "Silverqueen Matcha"
      },
      {
        "id": "TOP-008",
        "name": "Banana",
        "price": 4000,
        "toppingId": "TOP-008",
        "toppingName": "Banana"
      },
      {
        "id": "TOP-009",
        "name": "Silverqueen",
        "price": 9000,
        "toppingId": "TOP-009",
        "toppingName": "Silverqueen"
      },
      {
        "id": "TOP-007",
        "name": "Oreo",
        "price": 1600,
        "toppingId": "TOP-007",
        "toppingName": "Oreo"
      },
      {
        "id": "TOP-006",
        "name": "Selai srikaya",
        "price": 4000,
        "toppingId": "TOP-006",
        "toppingName": "Selai srikaya"
      },
      {
        "id": "TOP-003",
        "name": "Selai Blueberry",
        "price": 4000,
        "toppingId": "TOP-003",
        "toppingName": "Selai Blueberry"
      },
      {
        "id": "TOP-002",
        "name": "Selai Strawberry",
        "price": 4000,
        "toppingId": "TOP-002",
        "toppingName": "Selai Strawberry"
      },
      {
        "id": "TOP-005",
        "name": "Selai Peanut",
        "price": 4000,
        "toppingId": "TOP-005",
        "toppingName": "Selai Peanut"
      },
      {
        "id": "TOP-004",
        "name": "Milk",
        "price": 4000,
        "toppingId": "TOP-004",
        "toppingName": "Milk"
      },
      {
        "id": "TOP-001",
        "name": "Chocolate",
        "price": 4000,
        "toppingId": "TOP-001",
        "toppingName": "Chocolate"
      },
      {
        "id": "TOP-030",
        "name": "Marsmallow",
        "price": 6000,
        "toppingId": "TOP-030",
        "toppingName": "Marsmallow"
      }
    ]
  },
  {
    "id": "MENU-005",
    "name": "Crepes Milk",
    "category_id": "CAT-001",
    "categoryName": "Crepes Manis",
    "price": 15500,
    "promo_type": "none",
    "promo_amount": 0,
    "ingredients": [
      {
        "quantity": "88",
        "unitName": "Gram",
        "rawMaterialId": "RAW-001",
        "rawMaterialName": "Adonan"
      }
    ],
    "toppings": [
      {
        "id": "TOP-021",
        "name": "Dus Crepes",
        "price": 2000,
        "toppingId": "TOP-021",
        "toppingName": "Dus Crepes"
      },
      {
        "id": "TOP-014",
        "name": "Pistachio Kunafa",
        "price": 20000,
        "toppingId": "TOP-014",
        "toppingName": "Pistachio Kunafa"
      },
      {
        "id": "TOP-013",
        "name": "Choco Crunchy",
        "price": 9000,
        "toppingId": "TOP-013",
        "toppingName": "Choco Crunchy"
      },
      {
        "id": "TOP-012",
        "name": "Ovomaltine",
        "price": 9000,
        "toppingId": "TOP-012",
        "toppingName": "Ovomaltine"
      },
      {
        "id": "TOP-020",
        "name": "Cheese",
        "price": 5000,
        "toppingId": "TOP-020",
        "toppingName": "Cheese"
      },
      {
        "id": "TOP-011",
        "name": "Nutella",
        "price": 9000,
        "toppingId": "TOP-011",
        "toppingName": "Nutella"
      },
      {
        "id": "TOP-010",
        "name": "Silverqueen Matcha",
        "price": 9000,
        "toppingId": "TOP-010",
        "toppingName": "Silverqueen Matcha"
      },
      {
        "id": "TOP-009",
        "name": "Silverqueen",
        "price": 9000,
        "toppingId": "TOP-009",
        "toppingName": "Silverqueen"
      },
      {
        "id": "TOP-008",
        "name": "Banana",
        "price": 4000,
        "toppingId": "TOP-008",
        "toppingName": "Banana"
      },
      {
        "id": "TOP-007",
        "name": "Oreo",
        "price": 1600,
        "toppingId": "TOP-007",
        "toppingName": "Oreo"
      },
      {
        "id": "TOP-006",
        "name": "Selai srikaya",
        "price": 4000,
        "toppingId": "TOP-006",
        "toppingName": "Selai srikaya"
      },
      {
        "id": "TOP-004",
        "name": "Milk",
        "price": 4000,
        "toppingId": "TOP-004",
        "toppingName": "Milk"
      },
      {
        "id": "TOP-005",
        "name": "Selai Peanut",
        "price": 4000,
        "toppingId": "TOP-005",
        "toppingName": "Selai Peanut"
      },
      {
        "id": "TOP-003",
        "name": "Selai Blueberry",
        "price": 4000,
        "toppingId": "TOP-003",
        "toppingName": "Selai Blueberry"
      },
      {
        "id": "TOP-002",
        "name": "Selai Strawberry",
        "price": 4000,
        "toppingId": "TOP-002",
        "toppingName": "Selai Strawberry"
      },
      {
        "id": "TOP-001",
        "name": "Chocolate",
        "price": 4000,
        "toppingId": "TOP-001",
        "toppingName": "Chocolate"
      },
      {
        "id": "TOP-030",
        "name": "Marsmallow",
        "price": 6000,
        "toppingId": "TOP-030",
        "toppingName": "Marsmallow"
      }
    ]
  }
];

export const DUMMY_CASHIERS = [
  {
    "id": "KASIR-002",
    "username": "rahma",
    "nama": "rahma",
    "role": "kasir",
    "pin": "1234",
    "telepon": ""
  },
  {
    "id": "KASIR-001",
    "username": "deri",
    "nama": "Deri",
    "role": "kasir",
    "pin": "1234",
    "telepon": ""
  },
  {
    "id": "KASIR-003",
    "username": "fitri",
    "nama": "Fitri",
    "role": "kasir",
    "pin": "1234",
    "telepon": ""
  },
  {
    "id": "KASIR-004",
    "username": "lathifah",
    "nama": "Lathifah",
    "role": "kasir",
    "pin": "1234",
    "telepon": ""
  },
  {
    "id": "KASIR-006",
    "username": "rubi",
    "nama": "Rubi",
    "role": "kasir",
    "pin": "1234",
    "telepon": ""
  },
  {
    "id": "KASIR-005",
    "username": "karinajulian",
    "nama": "Karinajulian",
    "role": "kasir",
    "pin": "1234",
    "telepon": ""
  }
];

export const DUMMY_SETTINGS = {
  "storeName": "XCrepes D'Botanica",
  "address": "D'Botanica Mall Bandung, Lt. GF No. 12, Jl. Dr. Djunjunan No. 143-149, Pajajaran, Cicendo, Kota Bandung, Jawa Barat 40173",
  "phone": "0812-3456-7890",
  "email": "info@xcrepes.id",
  "receiptTitle": "XCrepes D'Botanica",
  "receiptSubtitle": "Cabang D'Botanica Mall Bandung",
  "receiptPhone": "0812-3456-7890",
  "receiptFooter1": "Terima Kasih Atas Kunjungan Anda!",
  "receiptFooter2": "Follow Instagram @xcrepes.id • Nikmati Renyahnya!",
  "paperSize": "58mm",
  "showLogoOnReceipt": true,
  "showCashierName": true,
  "showCustomerName": true,
  "showTableNumber": true,
  "showNotes": true
};

export const DUMMY_ORDERS = [];

export const DUMMY_STOCK_LOGS = [];

/**
 * Injeksi data komprehensif ke localStorage secara langsung
 */
export const injectDummyDataToStorage = () => {
  try {
    localStorage.setItem('master_units', JSON.stringify(DUMMY_UNITS));
    localStorage.setItem('master_categories', JSON.stringify(DUMMY_CATEGORIES));
    localStorage.setItem('master_raw_materials', JSON.stringify(DUMMY_RAW_MATERIALS));
    localStorage.setItem('master_toppings', JSON.stringify(DUMMY_TOPPINGS));
    localStorage.setItem('master_product_menus', JSON.stringify(DUMMY_PRODUCT_MENUS));
    localStorage.setItem('pos_cashier_accounts', JSON.stringify(DUMMY_CASHIERS));
    localStorage.setItem('pos_orders', JSON.stringify(DUMMY_ORDERS));
    localStorage.setItem('inventory_stock_logs', JSON.stringify(DUMMY_STOCK_LOGS));
    localStorage.setItem('xcrepes_pos_settings', JSON.stringify(DUMMY_SETTINGS));
    localStorage.setItem('pos_cart', '[]');
    return { success: true, message: 'Database lokal telah berhasil diisi dengan data dummy lengkap seluruh fitur!' };
  } catch (e) {
    console.error('Gagal menyiapkan data dummy:', e);
    return { success: false, message: e.message };
  }
};

/**
 * Mengosongkan seluruh data dari localStorage
 */
export const clearAllDataFromStorage = () => {
  try {
    localStorage.setItem('master_units', '[]');
    localStorage.setItem('master_categories', '[]');
    localStorage.setItem('master_raw_materials', '[]');
    localStorage.setItem('master_toppings', '[]');
    localStorage.setItem('master_product_menus', '[]');
    localStorage.setItem('pos_cashier_accounts', '[]');
    localStorage.setItem('pos_orders', '[]');
    localStorage.setItem('inventory_stock_logs', '[]');
    localStorage.setItem('pos_cart', '[]');
    return { success: true, message: 'Seluruh data master, pesanan, dan inventori telah dikosongkan.' };
  } catch (e) {
    console.error('Gagal mengosongkan data:', e);
    return { success: false, message: e.message };
  }
};
