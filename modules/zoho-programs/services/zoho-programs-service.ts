import { executeGraphQLBackend } from "@/lib/graphql-server";
import {
  DELETE_PROGRAM,
  GET_PROGRAMS,
  GET_PROGRAMS_COUNT,
  GET_PROGRAM_BY_ID,
  GET_PROGRAMS_PAGINATION,
  INSERT_PROGRAM,
  UPDATE_PROGRAM,
  GET_ZOHO_COUNTRIES,
  GET_ZOHO_DEGREES,
  GET_ZOHO_FACILITIES,
  GET_ZOHO_LANGUAGES,
  GET_ZOHO_SPECIALITIES,
  GET_ZOHO_CITIES,
  GET_ZOHO_CITIES_BY_COUNTRY,
  GET_ZOHO_UNIVERSITIES,
  GET_ZOHO_UNIVERSITIES_BY_CITY,
  GET_ZOHO_UNIVERSITIES_BY_COUNTRY
} from "./zoho-programs-graphql";
import { ZohoCity, ZohoCountry, ZohoDegree, Zohofaculty, ZohoLanguage, ZohoProgram, ZohoSpeciality, ZohoUniversity } from "../models/zoho-program";
import { supabaseClient } from "@/lib/supabase-auth-client";

export const zohoProgramsService = {
  /**
   * Get all programs
   */
  getPrograms: async () => {
    const response = await executeGraphQLBackend(GET_PROGRAMS);
    return response.zoho_programsCollection.edges.map((edge: any) => edge.node);
  },

  /**
   * Get programs with pagination
   */
  getProgramsPagination: async (search: string, limit: number, offset: number) => {
    const response = await executeGraphQLBackend(GET_PROGRAMS_PAGINATION, { search, limit, offset });
    const countResponse = await supabaseClient
    .from('zoho_programs')
    .select('id,name', { count: 'exact' })
    .eq('active', true)
    .ilike('name', `${search}`);
      return {
      programs: response.zoho_programsCollection.edges.map((edge: any) => edge.node),
      totalCount: countResponse.count
    };
  },

  /**
   * Get a program by ID
   */
  getProgramById: async (id: string) => {
    try {
      const response = await executeGraphQLBackend(GET_PROGRAM_BY_ID, { id });
      return response.zoho_programsCollection.edges[0]?.node || null;
    } catch (error) {
      console.error('Error getting program by id:', error);
      throw error;
    }
  },

  /**
   * Create a new program
   */
  createProgram: async (data: Partial<ZohoProgram>) => {
    try {
      const response = await executeGraphQLBackend(INSERT_PROGRAM, {
        objects: [{
          name: data.name,
          faculty: data.faculty,
          speciality: data.speciality,
          degree: data.degree,
          language: data.language,
          university: data.university,
          city: data.city,
          country: data.country,
          official_tuition: data.official_tuition,
          discounted_tuition: data.discounted_tuition,
          tuition_currency: data.tuition_currency,
          active: data.active !== undefined ? data.active : false,
          active_applications: data.active_applications !== undefined ? data.active_applications : false,
          study_years: data.study_years
        }]
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      return response.insertIntozoho_programsCollection.records[0];
    } catch (error) {
      console.error('Error creating program:', error);
      throw error;
    }
  },

  /**
   * Update a program
   */
  updateProgram: async (data: Partial<ZohoProgram>): Promise<void> => {
    try {
      const response = await executeGraphQLBackend(UPDATE_PROGRAM, {
        id: data.id,
        name: data.name,
        faculty: data.faculty,
        speciality: data.speciality,
        degree: data.degree,
        language: data.language,
        university: data.university,
        city: data.city,
        country: data.country,
        official_tuition: data.official_tuition,
        discounted_tuition: data.discounted_tuition,
        tuition_currency: data.tuition_currency,
        active: data.active,
        active_applications: data.active_applications,
        study_years: data.study_years
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
    } catch (error) {
      console.error('Error updating program:', error);
      throw error;
    }
  },

  /**
   * Delete a program
   */
  deleteProgram: async (id: string): Promise<void> => {
    try {
      await executeGraphQLBackend(DELETE_PROGRAM, { id });
    } catch (error) {
      console.error('Error deleting program:', error);
      throw error;
    }
  },

  /**
   * Get all countries
   */
  getCountries: async (): Promise<ZohoCountry[]> => {
    try {
      const response = await executeGraphQLBackend(GET_ZOHO_COUNTRIES);
      return response.zoho_countriesCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error getting countries:', error);
      throw error;
    }
  },

  /**
   * Get all cities
   */
  getCities: async (): Promise<ZohoCity[]> => {
    try {
      const response = await executeGraphQLBackend(GET_ZOHO_CITIES);
      return response.zoho_citiesCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error getting cities:', error);
      throw error;
    }
  },

  /**
   * Get cities by country ID
   */
  getCitiesByCountry: async (countryId: number): Promise<ZohoCity[]> => {
    try {
      const response = await executeGraphQLBackend(GET_ZOHO_CITIES_BY_COUNTRY, { countryId });
      return response.zoho_citiesCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error getting cities by country:', error);
      throw error;
    }
  },

  /**
   * Get all universities
   */
  getUniversities: async (): Promise<ZohoUniversity[]> => {
    try {
      const response = await executeGraphQLBackend(GET_ZOHO_UNIVERSITIES);
      return response.zoho_universitiesCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error getting universities:', error);
      throw error;
    }
  },

  /**
   * Get universities by city ID
   */
  getUniversitiesByCity: async (cityId: number): Promise<ZohoUniversity[]> => {
    try {
      const response = await executeGraphQLBackend(GET_ZOHO_UNIVERSITIES_BY_CITY, { cityId });
      return response.zoho_universitiesCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error getting universities by city:', error);
      throw error;
    }
  },

  /**
   * Get universities by country ID
   */
  getUniversitiesByCountry: async (countryId: number): Promise<ZohoUniversity[]> => {
    try {
      const response = await executeGraphQLBackend(GET_ZOHO_UNIVERSITIES_BY_COUNTRY, { countryId });
      return response.zoho_universitiesCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error getting universities by country:', error);
      throw error;
    }
  },

  /**
   * Get all degrees
   */
  getDegrees: async (): Promise<ZohoDegree[]> => {
    try {
      const response = await executeGraphQLBackend(GET_ZOHO_DEGREES);
      return response.zoho_degreesCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error getting degrees:', error);
      throw error;
    }
  },

  /**
   * Get all facilities
   */
  getFacilities: async (): Promise<Zohofaculty[]> => {
    try {
      const response = await executeGraphQLBackend(GET_ZOHO_FACILITIES);
      return response.zoho_facultyCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error getting facilities:', error);
      throw error;
    }
  },

  /**
   * Get all languages
   */
  getLanguages: async (): Promise<ZohoLanguage[]> => {
    try {
      const response = await executeGraphQLBackend(GET_ZOHO_LANGUAGES);
      return response.zoho_languagesCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error getting languages:', error);
      throw error;
    }
  },

  /**
   * Get all specialities
   */
  getSpecialities: async (): Promise<ZohoSpeciality[]> => {
    try {
      const response = await executeGraphQLBackend(GET_ZOHO_SPECIALITIES);
      return response.zoho_specialityCollection.edges.map((edge: any) => edge.node);
    } catch (error) {
      console.error('Error getting specialities:', error);
      throw error;
    }
  },

  /**
   * Get specialities by faculty ID
   */
  getSpecialitiesByFaculty: async (facultyId: number): Promise<ZohoSpeciality[]> => {
    try {
      const response = await executeGraphQLBackend(GET_ZOHO_SPECIALITIES);
      const specialities = response.zoho_specialityCollection.edges.map((edge: any) => edge.node);
      return specialities.filter((spec: ZohoSpeciality) => spec.faculty_id === facultyId);
    } catch (error) {
      console.error('Error getting specialities by faculty:', error);
      throw error;
    }
  }
};