"use server";

import { supabase, supabaseClient } from "@/lib/supabase-auth-client";

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



export const getApplicationsPagination = async (   search: string,
  limit: number,
  offset: number,
  user_id: string,
  userRole: string,
  agency_id: string) => {
 
    try {
      let studentIds = [];
      let programIds = [];
      const searchPattern = `%${search.trim()}%`;

      // If search is provided, get matching IDs first
      if (search && search.trim() !== "") {
        
        // Get matching student IDs
        const { data: students } = await supabaseClient
          .from("zoho_students")
          .select("id")
          .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern}`);
        
        studentIds = students?.map(s => s.id) || [];
  
        // Get matching program IDs  
        const { data: programs } = await supabaseClient
          .from("zoho_programs")
          .select("id")
          .ilike("name", searchPattern);
        
        programIds = programs?.map(p => p.id) || [];
        
        // If no matches found, return empty result
        if (studentIds.length === 0 && programIds.length === 0) {
          return { applications: [], totalCount: 0 };
        }
      }
  
      // Main query
      let query = supabaseClient
        .from("zoho_applications")
        .select(
          `
          id,
          created_at,
          updated_at,
          student,
          program,
          acdamic_year,
          semester,
          country,
          university,
          stage,
          degree,
          application_name,
  
          agent:user_profile!zoho_applications_user_id_fkey (
            id,
            first_name,
            last_name,
            email,
            profile
          ),
  
          zoho_students (
            id,
            first_name,
            last_name,
            email,
            mobile,
            photo_url
          ),
  
          zoho_programs (
            id,
            name
          ),
  
          zoho_academic_years (
            id,
            name,
            active
          ),
  
          zoho_semesters (
            id,
            name,
            active
          ),
  
          zoho_countries (
            id,
            name,
            country_code
          ),
  
          zoho_universities (
            id,
            name,
            logo,
            sector
          ),
  
          zoho_degrees (
            id,
            name,
            code
          )
        `,
          { count: "exact" }
        );
  
      // Role-based filtering
      if (userRole === "agent") {
        query = query.eq("agency_id", user_id);
      } else if (userRole === "sub agent") {
        query = query.eq("user_id", user_id);
      }
  
      // Apply search filter using IN clause
      if (search && search.trim() !== "") {
        const orConditions = [];
        
        if (studentIds.length > 0) {
          orConditions.push(`student.in.(${studentIds.join(',')})`);
        }
        
        if (programIds.length > 0) {
          orConditions.push(`program.in.(${programIds.join(',')})`);
        }

        orConditions.push(`application_name.ilike.${searchPattern}`);

        orConditions.push(`stage.ilike.${searchPattern}`);
        
        if (orConditions.length > 0) {
          query = query.or(orConditions.join(','));
        }
      }
  
      // Apply pagination and ordering
      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
  
      if (error) throw error;
  
      return {
        applications: data || [],
        totalCount: count || 0,
      };
    } catch (err) {
      console.error("Error fetching applications:", err);
      throw err;
    }
  
  
  
  
};



export const getStudentsPagination = async (    search: string,
  limit: number,
  offset: number,
  // filter: any = {}, // equivalent to zoho_studentsFilter
  user_id: string,
  userRole: string,
  agency_id: string) => {
 
    
      try {
        // Build the base query with all the fields and relationships
        let query = supabaseClient
          .from("zoho_students")
          .select(
            `
            id,
            created_at,
            updated_at,
            first_name,
            last_name,
            gender,
            date_of_birth,
            nationality,
            passport_number,
            passport_issue_date,
            passport_expiry_date,
            country_of_residence,
            email,
            mobile,
            father_name,
            father_mobile,
            father_job,
            mother_name,
            mother_mobile,
            mother_job,
            
            agent:user_profile!zoho_students_user_id_fkey (
              first_name,
              last_name,
              email,
              profile
            ),
            
        nationality_record:zoho_countries!zoho_students_nationality_fkey (
          id,
          name
        )
       
            
         
            `,
            { count: "exact" }
          );
    
        // Apply search filter if provided
        if (search && search.trim() !== "") {
          const searchPattern = `%${search.trim()}%`;
          query = query.or(`
            first_name.ilike.${searchPattern},
            last_name.ilike.${searchPattern},
            email.ilike.${searchPattern},
            mobile.ilike.${searchPattern},
            passport_number.ilike.${searchPattern}
          `.replace(/\s+/g, ''));
        }
    
        // Apply additional filters (equivalent to GraphQL filter parameter)
        // if (filter) {
        //   // Example filter applications:
        //   if (filter.gender) {
        //     query = query.eq('gender', filter.gender);
        //   }
        //   if (filter.nationality) {
        //     query = query.eq('nationality', filter.nationality);
        //   }
        //   if (filter.country_of_residence) {
        //     query = query.eq('country_of_residence', filter.country_of_residence);
        //   }
        //   if (filter.created_at_gte) {
        //     query = query.gte('created_at', filter.created_at_gte);
        //   }
        //   if (filter.created_at_lte) {
        //     query = query.lte('created_at', filter.created_at_lte);
        //   }
        //   // Add more filter conditions as needed
        // }
    
        // Role-based filtering (if needed)
        if (userRole === "agent") {
          query = query.eq("agency_id", user_id);
        } else if (userRole === "sub agent") {
          query = query.eq("user_id", user_id);
        }
    
        // Apply ordering and pagination
        const { data, error, count } = await query
          .order("created_at", { ascending: false }) // DescNullsLast equivalent
          .range(offset, offset + limit - 1);
    
        if (error) throw error;
    
        // Format the response to match GraphQL structure
        const students = data ;
    
        return {
          students,
          totalCount: count || 0,
          pageInfo: {
            hasNextPage: (offset + limit) < (count || 0),
            hasPreviousPage: offset > 0,
          }
        };
      } catch (err) {
        console.error("Error fetching students:", err);
        throw err;
      }
    

  }