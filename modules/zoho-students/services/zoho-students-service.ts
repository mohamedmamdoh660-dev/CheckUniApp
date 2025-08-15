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
import { ZohoStudent } from "../models/zoho-student";
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
  getStudentsPagination: async (search: string, limit: number, offset: number) => {
    const response = await executeGraphQLBackend(GET_STUDENTS_PAGINATION, { search, limit, offset });
    const countResponse = await supabaseClient
    .from('zoho_students')
    .select('id', { count: 'exact' })
    .or(`first_name.ilike.${search},last_name.ilike.${search},email.ilike.${search}`);
    return {
      students: response.zoho_studentsCollection.edges.map((edge: any) => edge.node),
      totalCount: countResponse.count
    };
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
