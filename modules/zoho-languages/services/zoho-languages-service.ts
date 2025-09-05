import { executeGraphQLBackend } from "@/lib/graphql-server";
import {
  DELETE_LANGUAGE,
  GET_LANGUAGES,
  GET_LANGUAGE_BY_ID,
  GET_LANGUAGES_PAGINATION,
  INSERT_LANGUAGE,
  UPDATE_LANGUAGE
} from "./zoho-languages-graphql";
import { ZohoLanguage } from "../models/zoho-language";
import { supabaseClient } from "@/lib/supabase-auth-client";

export const zohoLanguagesService = {
  /**
   * Get all languages
   */
  getLanguages: async (search: string = "", page: number = 1, pageSize: number = 10, id: string | null = null) => {
    const offset = (page) * pageSize;
    const searchPattern = `%${search}%`;
    const filter = id ? { name: { ilike: searchPattern }, id: { eq: id } } : { name: { ilike: searchPattern } };
    const response = await executeGraphQLBackend(GET_LANGUAGES, { filter, limit: pageSize, offset });
    return response.zoho_languagesCollection.edges.map((edge: any) => edge.node);
  },

  /**
   * Get languages with pagination
   */
  getLanguagesPagination: async (search: string, limit: number, offset: number) => {
    const response = await executeGraphQLBackend(GET_LANGUAGES_PAGINATION, { search, limit, offset: limit * offset });
    const countResponse = await supabaseClient
      .from('zoho_languages')
      .select('id,name', { count: 'exact' })
      .ilike('name', `${search}`);
    return {
      languages: response.zoho_languagesCollection.edges.map((edge: any) => edge.node),
      totalCount: countResponse.count
    };
  },

  /**
   * Get a language by ID
   */
  getLanguageById: async (id: string) => {
    try {
      const response = await executeGraphQLBackend(GET_LANGUAGE_BY_ID, { id });
      return response.zoho_languagesCollection.edges[0]?.node || null;
    } catch (error) {
      console.error('Error getting language by id:', error);
      throw error;
    }
  },

  /**
   * Create a new language
   */
  createLanguage: async (data: Partial<ZohoLanguage>) => {
    try {
      const response = await executeGraphQLBackend(INSERT_LANGUAGE, {
        objects: [{
          name: data.name
        }]
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      return response.insertIntozoho_languagesCollection.records[0];
    } catch (error) {
      console.error('Error creating language:', error);
      throw error;
    }
  },

  /**
   * Update a language
   */
  updateLanguage: async (data: Partial<ZohoLanguage>): Promise<void> => {
    try {
      const response = await executeGraphQLBackend(UPDATE_LANGUAGE, {
        id: data.id,
        name: data.name
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }
    } catch (error) {
      console.error('Error updating language:', error);
      throw error;
    }
  },

  /**
   * Delete a language
   */
  deleteLanguage: async (id: string): Promise<void> => {
    try {
      await executeGraphQLBackend(DELETE_LANGUAGE, { id });
    } catch (error) {
      console.error('Error deleting language:', error);
      throw error;
    }
  }
};
