import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qpvzbzwzspzjftzrxefe.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdnpiend6c3B6amZ0enJ4ZWZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA5OTk4MywiZXhwIjoyMTAxNjc1OTgzfQ.iT02j60nx5Roxqj_2HWqdjgAQDh2oTqcy_XvdsIPrts';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('groups').select('*').eq('id', '757e159a-6a90-4183-a752-0af9cbf145d3');
  console.log(JSON.stringify(data, null, 2));
}
run();
