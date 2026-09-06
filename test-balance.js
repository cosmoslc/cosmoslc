import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qpvzbzwzspzjftzrxefe.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdnpiend6c3B6amZ0enJ4ZWZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA5OTk4MywiZXhwIjoyMTAxNjc1OTgzfQ.iT02j60nx5Roxqj_2HWqdjgAQDh2oTqcy_XvdsIPrts';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('students').select('id, name, balance').limit(20);
  console.log(data);
}
run();
