import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jznvcvcrtsksaigijorf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bnZjdmNydHNrc2FpZ2lqb3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjM5MTEsImV4cCI6MjEwMjg5OTkxMX0.kVF3g48Q6BPnx3H4Puajz_-sxnQp4HgM6ttVIGvHY4Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
