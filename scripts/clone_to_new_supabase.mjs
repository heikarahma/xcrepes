/**
 * Script untuk melakukan cloning data otomatis dari database sumber ke database Supabase target yang baru.
 * 
 * Cara Penggunaan:
 * node scripts/clone_to_new_supabase.mjs <TARGET_SUPABASE_URL> <TARGET_SUPABASE_KEY>
 * 
 * Contoh:
 * node scripts/clone_to_new_supabase.mjs https://xyzproject.supabase.co eyJhbGci...
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const targetUrl = process.argv[2] || process.env.TARGET_SUPABASE_URL;
const targetKey = process.argv[3] || process.env.TARGET_SUPABASE_KEY;

if (!targetUrl || !targetKey) {
  console.log('================================================================');
  console.log('❌ PANDUAN PENGGUNAAN CLONE KE SUPABASE TARGET:');
  console.log('Harap masukkan URL dan KEY database Supabase tujuan Anda.');
  console.log('');
  console.log('Perintah:');
  console.log('  node scripts/clone_to_new_supabase.mjs <TARGET_URL> <TARGET_KEY>');
  console.log('');
  console.log('Contoh:');
  console.log('  node scripts/clone_to_new_supabase.mjs https://abcdefgh.supabase.co eyJhbGciOi...');
  console.log('================================================================');
  process.exit(1);
}

const dataDir = path.resolve('database_backup/data');
const allDataFile = path.join(dataDir, 'all_data.json');

if (!fs.existsSync(allDataFile)) {
  console.error('❌ Data backup belum ditemukan. Silakan jalankan node scripts/export_supabase.mjs terlebih dahulu.');
  process.exit(1);
}

const allData = JSON.parse(fs.readFileSync(allDataFile, 'utf-8'));
const targetClient = createClient(targetUrl, targetKey);

const ORDERED_TABLES = [
  'units',
  'categories',
  'raw_materials',
  'toppings',
  'product_menus',
  'inventory_stock_logs',
  'orders',
  'store_settings',
  'cashier_accounts',
  'superadmin_profile'
];

async function cloneData() {
  console.log(`🚀 Memulai kloning data ke database target: ${targetUrl}`);

  for (const table of ORDERED_TABLES) {
    const rows = allData[table] || [];
    if (rows.length === 0) {
      console.log(`ℹ️ Tabel ${table}: kosong (0 baris), dilewati.`);
      continue;
    }

    console.log(`⏳ Mengunggah ${rows.length} baris ke tabel: ${table}...`);
    
    // Kirim per chunk (misal 50 baris per batch agar aman dari payload limits)
    const chunkSize = 25;
    let successCount = 0;

    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { data, error } = await targetClient
        .from(table)
        .upsert(chunk, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Error pada batch ${i} - ${i + chunk.length} di tabel ${table}:`, error.message);
      } else {
        successCount += chunk.length;
      }
    }

    console.log(`✅ Tabel ${table}: ${successCount}/${rows.length} baris berhasil disalin!`);
  }

  console.log('\n🎉 PROSES KLONING SELESAI!');
  console.log('Semua data berhasil disalin ke database Supabase target yang baru.');
}

cloneData().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
