import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export type Beneficiary = {
  id: string;
  name: string | null;
  cnic: string;
  phone: string | null;
  designation: string | null;
  location: "inside_giki" | "outside_giki";
  zakaat_eligible: boolean | null;
  status: "pending" | "done";
  created_at: string;
};

export type BeneficiaryInsert = Omit<Beneficiary, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};
