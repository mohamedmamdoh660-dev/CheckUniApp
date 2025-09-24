"use server";

import { supabase } from "@/lib/supabase-auth-client";

export const getStudentById = async (id: string) => {
    const { data, error } = await supabase
    .from("zoho_students")
    .select(`
      *,
      nationality_record:zoho_countries!zoho_students_nationality_fkey (id, name),
      address_country_record:zoho_countries!zoho_students_address_country_fkey (id, name),
      academic_level_record:zoho_degrees!zoho_students_education_level_fkey (id, name)
    `)
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data;
};


export const getApplicationById = async (id: string) => {
  const { data, error } = await supabase
    .from("zoho_applications")
    .select("*, user:user_profile!zoho_applications_agency_id_fkey (first_name, last_name, email), added_user:user_profile!zoho_applications_user_id_fkey (first_name, last_name, email), zoho_programs:zoho_programs!applications_program_fkey (name), zoho_academic_years:zoho_academic_years!zoho_applications_acdamic_year_fkey (name), zoho_semesters:zoho_semesters!zoho_applications_semester_fkey (name), zoho_countries:zoho_countries!applications_country_fkey (name), zoho_universities:zoho_universities!zoho_applications_university_fkey (*,zoho_countries:zoho_countries!zoho_universities_country_fkey (name), zoho_cities:zoho_cities!zoho_universities_city_fkey (name)), zoho_degrees:zoho_degrees!zoho_applications_degree_fkey (name), zoho_students:zoho_students!applications_student_fkey (first_name, gender, last_name, email, mobile, nationality, passport_number, passport_issue_date, passport_expiry_date,address_country_record:zoho_countries!zoho_students_address_country_fkey (name), country_of_residence, nationality_record:zoho_countries!zoho_students_nationality_fkey (name))")
    
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};