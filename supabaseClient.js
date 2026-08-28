import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qpvzbzwzspzjftzrxefe.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdnpiend6c3B6amZ0enJ4ZWZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA5OTk4MywiZXhwIjoyMTAxNjc1OTgzfQ.iT02j60nx5Roxqj_2HWqdjgAQDh2oTqcy_XvdsIPrts';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
