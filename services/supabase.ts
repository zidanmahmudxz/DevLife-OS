
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client initialization.
 * 
 * To prevent the "supabaseUrl is required" runtime error during script evaluation,
 * we provide placeholder values if the environment variables are not yet configured.
 * In a valid deployment, these will be populated by the process.env context.
 */
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Log a warning to the console if configuration is missing, aiding in debugging
// without stopping the application from rendering the UI.
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn(
    "DevLife OS Configuration Warning: SUPABASE_URL or SUPABASE_ANON_KEY environment variables are missing. " +
    "Authentication and database features will be unavailable until these are correctly configured in your environment."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
