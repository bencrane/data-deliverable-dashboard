import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Type for our leads_view
export type Lead = {
  id: string
  full_name: string
  first_name: string | null
  last_name: string | null
  work_email: string
  job_title: string | null
  company_name: string | null
  company_domain: string | null
  company_linkedin_url: string | null
  person_linkedin_url: string | null
  email_status: string | null
  created_at: string
}
