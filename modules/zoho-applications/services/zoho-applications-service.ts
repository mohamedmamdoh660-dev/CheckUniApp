
import { executeGraphQLBackend } from "@/lib/graphql-server";
import {
  DELETE_APPLICATION,
  GET_APPLICATIONS,
  GET_APPLICATION_BY_ID,
  GET_APPLICATIONS_PAGINATION,
  INSERT_APPLICATION,
  UPDATE_APPLICATION,
  GET_ZOHO_ACADEMIC_YEARS,
  GET_ZOHO_SEMESTERS,
  GET_ZOHO_STUDENTS,
  GET_ZOHO_STUDENTS_SEARCH
} from "./zoho-applications-graphql";
import { ZohoAcademicYear, ZohoApplication, ZohoSemester } from "@/types/types";
import { ZohoStudent } from "@/types/types";
import { supabaseClient } from "@/lib/supabase-auth-client";

export const zohoApplicationsService = {
  /**
   * Get all applications
   */
  getApplications: async () => {
    const response = await executeGraphQLBackend(GET_APPLICATIONS);
    return response.zoho_applicationsCollection.edges.map((edge: any) => edge.node);
  },

  /**
   * Get applications with pagination
   */
  // / Method 2: Pre-fetch IDs then use IN clause (More reliable)
  getApplicationsPagination: async (
    search: string,
    limit: number,
    offset: number,
    user_id: string,
    userRole: string,
    agency_id: string
  ) => {
    try {
      let studentIds = [];
      let programIds = [];
  
      // If search is provided, get matching IDs first
      if (search && search.trim() !== "") {
        const searchPattern = `%${search.trim()}%`;
        
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
  },
  
  
  
  /**
   * Get an application by ID
   */
  getApplicationById: async (id: string) => {
    try {
      const response = await executeGraphQLBackend(GET_APPLICATION_BY_ID, { id });
      return response.zoho_applicationsCollection.edges[0]?.node || null;
    } catch (error) {
      console.error('Error getting application by id:', error);
      throw error;
    }
  },

  /**
   * Create a new application
   */
  createApplication: async (data: Partial<ZohoApplication>) => {
    try {
      const response = await executeGraphQLBackend(INSERT_APPLICATION, {
        objects: [{
          id: data.id,
          student: data.student,
          program: data.program,
          acdamic_year: data.acdamic_year,
          semester: data.semester,
          country: data.country,
          university: data.university,
          stage: data.stage,
          degree: data.degree,
          agency_id: data.agency_id,
          user_id: data.user_id
        }]
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      return response.insertIntozoho_applicationsCollection.records[0];
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  },

  /**
   * Update an application
   */
  updateApplication: async (data: Partial<ZohoApplication>): Promise<void> => {
    try {
      const response = await executeGraphQLBackend(UPDATE_APPLICATION, {
        id: data.id,
        student: data.student,
        program: data.program,
        acdamic_year: data.acdamic_year,
        semester: data.semester,
        country: data.country,
        university: data.university,
        stage: data.stage,
        degree: data.degree
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  },

  /**
   * Delete an application
   */
  deleteApplication: async (id: string): Promise<void> => {
    try {
      await executeGraphQLBackend(DELETE_APPLICATION, { id });
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  },

  /**
   * Get all academic years
   */
  getAcademicYears: async (search: string = "", page: number = 1, pageSize: number = 10, id: string | null = null, dependsOn: { field: string, value: string | number | null } | null = null): Promise<ZohoAcademicYear[]> => {
    try {
      const offset = (page ) * pageSize;
      const searchPattern = `%${search}%`;
      let filter = id ? { name: { ilike: searchPattern }, id: { eq: id }, active: { eq: true } } : { name: { ilike: searchPattern }, active: { eq: true } };
      if (dependsOn && dependsOn.value) {
        filter = {
          ...filter,
          [dependsOn.field]: { eq: dependsOn.value }
        };
      }
      const response = await executeGraphQLBackend(GET_ZOHO_ACADEMIC_YEARS, { filter, limit: pageSize, offset });
      return response.zoho_academic_yearsCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error getting academic years:', error);
      throw error;
    }
  },

  /**
   * Get all semesters
   */
  getSemesters: async (search: string = "", page: number = 1, pageSize: number = 10, id: string | null = null, dependsOn: { field: string, value: string | number | null } | null = null): Promise<ZohoSemester[]> => {
    try {
      const offset = (page ) * pageSize;
      const searchPattern = `%${search}%`;
      let filter = id ? { name: { ilike: searchPattern }, id: { eq: id }, active: { eq: true } } : { name: { ilike: searchPattern }, active: { eq: true } };
      if (dependsOn && dependsOn.value) {
        filter = {
          ...filter,
          [dependsOn.field]: { eq: dependsOn.value }
        };
      }
      const response = await executeGraphQLBackend(GET_ZOHO_SEMESTERS, { filter, limit: pageSize, offset });
      return response.zoho_semestersCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error getting semesters:', error);
      throw error;
    }
  },

  /**
   * Get all students
   */
  getStudents: async (search: string = "", page: number = 1, pageSize: number = 10, id: string | null = null, userRole: string, user_id: string, agency_id: string, dependsOn: { field: string, value: string | number | null } | null = null): Promise<ZohoStudent[]> => {
    
    try {
      const offset = (page ) * pageSize;
      const searchPattern = `%${search}%`;
      let filter =  { or: [ { first_name: { ilike: searchPattern } }, { last_name: { ilike: searchPattern } }, { email: { ilike: searchPattern } } ], ...(id ? { id: { eq: id } } : {}), ...(userRole === 'agent' ? { agency_id: { eq: agency_id } } : userRole === 'sub agent' ? { user_id: { eq: user_id } } : {}) };
      if (dependsOn && dependsOn.value) {
        filter = {
          ...filter,
          [dependsOn.field]: { eq: dependsOn.value }
        };
      }
      const response = await executeGraphQLBackend(GET_ZOHO_STUDENTS, { filter, limit: pageSize, offset });
      return response.zoho_studentsCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error getting students:', error);
      throw error;
    }
  },

  /**
   * Search students
   */
  searchStudents: async (search: string): Promise<ZohoStudent[]> => {
    try {
      const response = await executeGraphQLBackend(GET_ZOHO_STUDENTS_SEARCH, { search });
      return response.zoho_studentsCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  }
};
