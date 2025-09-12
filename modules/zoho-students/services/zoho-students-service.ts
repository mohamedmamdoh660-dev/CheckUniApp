
import { executeGraphQLBackend } from "@/lib/graphql-server";
import {
  DELETE_STUDENT,
  GET_STUDENTS,
  GET_STUDENTS_COUNT,
  GET_STUDENT_BY_ID,
  GET_STUDENTS_PAGINATION,
  INSERT_STUDENT,
  UPDATE_STUDENT
} from "./zoho-students-graphql";
import { ZohoStudent } from "@/types/types";
import { supabaseClient } from "@/lib/supabase-auth-client";

export const zohoStudentsService = {
  /**
   * Get all students
   */
  getStudents: async () => {
    const response = await executeGraphQLBackend(GET_STUDENTS);
    return response.zoho_studentsCollection.edges.map((edge: any) => edge.node);
  },

  /**
   * Get students with pagination
   */
// Main function to get students with pagination and search
getStudentsPagination: async (
  search: string,
  limit: number,
  offset: number,
  // filter: any = {}, // equivalent to zoho_studentsFilter
  user_id: string,
  userRole: string,
  agency_id: string
) => {

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
},
  /**
   * Get a student by ID
   */
  getStudentById: async (id: string) => {
    try {
      const response = await executeGraphQLBackend(GET_STUDENT_BY_ID, { id });
      return response.zoho_studentsCollection.edges[0]?.node || null;
    } catch (error) {
      console.error('Error getting student by id:', error);
      throw error;
    }
  },

  /**
   * Create a new student
   */
  createStudent: async (data: Partial<ZohoStudent>) => {
    try {
      const response = await executeGraphQLBackend(INSERT_STUDENT, {
        objects: [{
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          nationality: data.nationality,
          passport_number: data.passport_number,
          passport_issue_date: data.passport_issue_date,
          passport_expiry_date: data.passport_expiry_date,
          country_of_residence: data.country_of_residence,
          email: data.email,
          mobile: data.mobile,
          father_name: data.father_name,
          father_mobile: data.father_mobile,
          father_job: data.father_job,
          mother_name: data.mother_name,
          mother_mobile: data.mother_mobile,
          mother_job: data.mother_job,
          agency_id: data.agency_id,
          user_id: data.user_id
        }]
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      return response.insertIntozoho_studentsCollection.records[0];
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  /**
   * Update a student
   */
  updateStudent: async (data: Partial<ZohoStudent>): Promise<void> => {
    try {
      const response = await executeGraphQLBackend(UPDATE_STUDENT, {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        nationality: data.nationality,
        passport_number: data.passport_number,
        passport_issue_date: data.passport_issue_date,
        passport_expiry_date: data.passport_expiry_date,
        country_of_residence: data.country_of_residence,
        email: data.email,
        mobile: data.mobile,
        father_name: data.father_name,
        father_mobile: data.father_mobile,
        father_job: data.father_job,
        mother_name: data.mother_name,
        mother_mobile: data.mother_mobile,
        mother_job: data.mother_job
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  /**
   * Delete a student
   */
  deleteStudent: async (id: string): Promise<void> => {
    try {
      await executeGraphQLBackend(DELETE_STUDENT, { id });
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }
};
