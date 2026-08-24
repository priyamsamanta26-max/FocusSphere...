import { createClient } from '@supabase/supabase-js';

// Reusing the same credentials from the HTML version
const SUPABASE_URL = 'https://tkbtbbokaaoyxxcdupbi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrYnRiYm9rYWFveXh4Y2R1cGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NjgwMTIsImV4cCI6MjEwMzA0NDAxMn0.SdfT6B56W8N2-ThQJpUMJdJeRkIUn9QUrAVYvvRP_dw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
