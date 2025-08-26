import { executeGraphQLBackend } from "@/lib/graphql-server";
import {
  CREATE_SEMESTER,
  DELETE_SEMESTER,
  GET_SEMESTERS,
  GET_SEMESTER_BY_ID,
  UPDATE_SEMESTER,
} from "./semesters-graphql";
import { Semester } from "../models/semester";
import { supabaseClient } from "@/lib/supabase-auth-client";

class SemestersService {
  // Get semesters with pagination, search, and sorting
  async getSemesters({
    page = 0,
    pageSize = 10,
    searchQuery = "",
    orderBy = [{ created_at: "desc" }],
  }: {
    page?: number;
    pageSize?: number;
    searchQuery?: string;
    orderBy?: any[];
  }) {
    try {
      const offset = page * pageSize;
      const searchPattern = `%${searchQuery}%`;
      const filter = { name: { ilike: searchPattern } };

      const response = await executeGraphQLBackend(GET_SEMESTERS, {
        filter,
        limit: pageSize,
        offset,
        orderBy
      });

      // Get total count
      const countResponse = await supabaseClient
        .from('zoho_semesters')
        .select('id', { count: 'exact' })
        .ilike('name', searchPattern);

      return {
        semesters: response.zoho_semestersCollection.edges.map((edge: any) => edge.node),
        totalCount: countResponse.count || 0
      };
    } catch (error) {
      console.error("Error fetching semesters:", error);
      throw error;
    }
  }

  // Get a single semester by ID
  async getSemesterById(id: string) {
    try {
      const response = await executeGraphQLBackend(GET_SEMESTER_BY_ID, { id });
      return response.zoho_semestersCollection.edges[0]?.node || null;
    } catch (error) {
      console.error(`Error fetching semester with ID ${id}:`, error);
      throw error;
    }
  }

  // Create a new semester
  async createSemester(semesterData: Partial<Semester>) {
    try {
      const response = await executeGraphQLBackend(CREATE_SEMESTER, {
        objects: [semesterData]
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      return response.insertIntozoho_semestersCollection.records[0];
    } catch (error) {
      console.error("Error creating semester:", error);
      throw error;
    }
  }

  // Update an existing semester
  async updateSemester(id: string, semesterData: Partial<Semester>) {
    try {
      const response = await executeGraphQLBackend(UPDATE_SEMESTER, {
        id,
        ...semesterData
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      return response.updatezoho_semestersCollection.records[0];
    } catch (error) {
      console.error(`Error updating semester with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a semester
  async deleteSemester(id: string) {
    try {
      const response = await executeGraphQLBackend(DELETE_SEMESTER, { id });
      
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
      
      return response.deleteFromzoho_semestersCollection.records[0];
    } catch (error) {
      console.error(`Error deleting semester with ID ${id}:`, error);
      throw error;
    }
  }

  // Toggle semester active status
  async toggleSemesterStatus(id: string, active: boolean) {
    try {
      const response = await executeGraphQLBackend(UPDATE_SEMESTER, {
        id,
        active
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      return response.updatezoho_semestersCollection.records[0];
    } catch (error) {
      console.error(`Error toggling semester status with ID ${id}:`, error);
      throw error;
    }
  }
}

export const semestersService = new SemestersService();