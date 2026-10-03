// ========================================================
// SUPABASE CONNECTION TEST SCRIPT
// Run with: node test_supabase.js <SUPABASE_URL> <SUPABASE_ANON_KEY>
// ========================================================

import { createClient } from '@supabase/supabase-js';

const url = process.argv[2] || process.env.VITE_SUPABASE_URL;
const key = process.argv[3] || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.log('❌ ไม่พบข้อมูลการเชื่อมต่อ กรุณาระบุ:');
  console.log('node test_supabase.js <SUPABASE_URL> <SUPABASE_ANON_KEY>');
  process.exit(1);
}

console.log('📡 กำลังทดสอบเชื่อมต่อกับ Supabase: ' + url);

const supabase = createClient(url, key);

async function runTest() {
  try {
    const { data, error } = await supabase.from('incidents').select('id, title, status').limit(5);
    if (error) {
      console.error('⚠️ ผลการตรวจสอบ:', error.message);
    } else {
      console.log('✅ เชื่อมต่อ Supabase สำเร็จ 100%!');
      console.log(`📊 จำนวนข้อมูลในตาราง incidents ที่ดึงได้: ${data.length} รายการ`);
      console.log(data);
    }
  } catch (err) {
    console.error('❌ ข้อผิดพลาด:', err);
  }
}

runTest();
