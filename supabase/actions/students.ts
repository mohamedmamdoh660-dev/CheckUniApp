"use server";

import { supabase } from "@/lib/supabase-auth-client";

export const getStudentById = async (id: string) => {
    const { data, error } = await supabase
    .from("zoho_students")
    .select(`
      *,
      nationality_record:zoho_countries!zoho_students_nationality_fkey (id, name),
      address_country_record:zoho_countries!zoho_students_address_country_fkey (id, name),
      master_country_record:zoho_countries!zoho_students_master_country_fkey (id, name),
      bachelor_country_record:zoho_countries!zoho_students_bachelor_country_fkey (id, name),
      high_school_country_record:zoho_countries!zoho_students_high_school_country_fkey (id, name),
      academic_level_record:zoho_degrees!zoho_students_education_level_fkey (id, name)
    `)
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data;
};

