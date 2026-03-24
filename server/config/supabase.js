import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client for general operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export { supabase, supabaseAdmin };
