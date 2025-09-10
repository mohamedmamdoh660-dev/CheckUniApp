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
  getApplicationsPagination: async (
    search: string,
    limit: number,
    offset: number,
    user_id: string,
    userRole: string,
    agency_id: string
  ) => {
    try {
      // Build the base query
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
        mobile
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

      // Apply search filter if provided
      if (search && search.trim() !== "") {
        const searchPattern = `%${search.trim()}%`;
        // Filter on the stage column in the main table
        query = query.ilike('stage', searchPattern);
      }
      
      // Role-based filtering
      if (userRole === "agency") {
        query = query.eq("agency_id", user_id);
      } else if (userRole !== "admin") {
        query = query.eq("user_id", user_id);
      }
      
      // Apply pagination and ordering
      query = query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
  
      // Execute the query
      const { data, error, count } = await query;
  
      if (error) throw error;
      
      // If search term is provided, we need to filter the results further
      // to include matches in related tables (since we can't directly filter on them)
      let filteredData = data;
      if (search && search.trim() !== "") {
        const searchLower = search.trim().toLowerCase();
        filteredData = data.filter(app => {
          // Check student first and last name
          const studentFirstName = app.zoho_students && app.zoho_students[0]?.first_name?.toLowerCase() || '';
          const studentLastName = app.zoho_students && app.zoho_students[0]?.last_name?.toLowerCase() || '';
          
          // Check program name
          const programName = app.zoho_programs && app.zoho_programs[0]?.name?.toLowerCase() || '';
          
          return (
            studentFirstName.includes(searchLower) ||
            studentLastName.includes(searchLower) ||
            programName.includes(searchLower)
          );
        });
      }
  
      return {
        applications: filteredData || [],
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
  getAcademicYears: async (search: string = "", page: number = 1, pageSize: number = 10, id: string | null = null): Promise<ZohoAcademicYear[]> => {
    try {
      const offset = (page ) * pageSize;
      const searchPattern = `%${search}%`;
      const filter = id ? { name: { ilike: searchPattern }, id: { eq: id }, active: { eq: true } } : { name: { ilike: searchPattern }, active: { eq: true } };
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
  getSemesters: async (search: string = "", page: number = 1, pageSize: number = 10, id: string | null = null): Promise<ZohoSemester[]> => {
    try {
      const offset = (page ) * pageSize;
      const searchPattern = `%${search}%`;
      const filter = id ? { name: { ilike: searchPattern }, id: { eq: id }, active: { eq: true } } : { name: { ilike: searchPattern }, active: { eq: true } };
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
  getStudents: async (search: string = "", page: number = 1, pageSize: number = 10, id: string | null = null, userRole: string, user_id: string, agency_id: string): Promise<ZohoStudent[]> => {
    
    try {
      const offset = (page ) * pageSize;
      const searchPattern = `%${search}%`;
      const filter =  { or: [ { first_name: { ilike: searchPattern } }, { last_name: { ilike: searchPattern } }, { email: { ilike: searchPattern } } ], ...(id ? { id: { eq: id } } : {}), ...(userRole === 'agency' ? { agency_id: { eq: agency_id } } : userRole === 'agent' ? { user_id: { eq: user_id } } : {}) };
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
