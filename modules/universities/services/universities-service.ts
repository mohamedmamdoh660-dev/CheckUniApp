import { executeGraphQLBackend } from "@/lib/graphql-server";
import {
  CREATE_UNIVERSITY,
  DELETE_UNIVERSITY,
  GET_CITIES_BY_COUNTRY,
  GET_COUNTRIES,
  GET_UNIVERSITIES,
  GET_UNIVERSITY_BY_ID,
  UPDATE_UNIVERSITY,
} from "./universities-graphql";
import { ZohoUniversity } from "@/types/types";
import { supabaseClient } from "@/lib/supabase-auth-client";

class UniversitiesService {
  // Get universities with pagination, search, and sorting
  async getUniversities({
    page = 0,
    pageSize = 10,
    searchQuery = "",
  }: {
    page?: number;
    pageSize?: number;
    searchQuery?: string;
  }) {
    try {
      const offset = page * pageSize;
      const searchPattern = `%${searchQuery}%`;
      const filter = { name: { ilike: searchPattern } };

      const response = await executeGraphQLBackend(GET_UNIVERSITIES, {
        filter,
        limit: pageSize,
        offset,
      });

      // Get total count
      const countResponse = await supabaseClient
        .from('zoho_universities')
        .select('id', { count: 'exact' })
        .ilike('name', searchPattern);

      return {
        universities: response.zoho_universitiesCollection.edges.map((edge: any) => edge.node),
        totalCount: countResponse.count || 0
      };
    } catch (error) {
      console.error("Error fetching universities:", error);
      throw error;
    }
  }

  // Get a single university by ID
  async getUniversityById(id: string) {
    try {
      const response = await executeGraphQLBackend(GET_UNIVERSITY_BY_ID, { id });
      return response.zoho_universitiesCollection.edges[0]?.node || null;
    } catch (error) {
      console.error(`Error fetching university with ID ${id}:`, error);
      throw error;
    }
  }

  // Get all countries
  async getCountries() {
    try {
      const response = await executeGraphQLBackend(GET_COUNTRIES, {
        limit: 100, // Fetch a reasonable number of countries
      });
      return response.zoho_countriesCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error("Error fetching countries:", error);
      throw error;
    }
  }

  // Get cities by country
  async getCitiesByCountry(countryId: string) {
    try {
      const response = await executeGraphQLBackend(GET_CITIES_BY_COUNTRY, { 
        countryId: parseInt(countryId)
      });
      return response.zoho_citiesCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error(`Error fetching cities for country ${countryId}:`, error);
      throw error;
    }
  }

  // Create a new university
  async createUniversity(universityData: Partial<ZohoUniversity>) {
    try {
      const response = await executeGraphQLBackend(CREATE_UNIVERSITY, {
        objects: [universityData]
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      return response.insertIntozoho_universitiesCollection.records[0];
    } catch (error) {
      console.error("Error creating university:", error);
      throw error;
    }
  }

  // Update an existing university
  async updateUniversity(id: string, universityData: Partial<ZohoUniversity>) {
    try {
      const response = await executeGraphQLBackend(UPDATE_UNIVERSITY, {
        id,
        ...universityData
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      return response.updatezoho_universitiesCollection.records[0];
    } catch (error) {
      console.error(`Error updating university with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a university
  async deleteUniversity(id: string) {
    try {
      const response = await executeGraphQLBackend(DELETE_UNIVERSITY, { id });
      
      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
      
      return response.deleteFromzoho_universitiesCollection.records[0];
    } catch (error) {
      console.error(`Error deleting university with ID ${id}:`, error);
      throw error;
    }
  }
}

export const universitiesService = new UniversitiesService();