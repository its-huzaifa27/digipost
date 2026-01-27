
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Supabase URL or Key missing in .env. Image uploads may fail.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
