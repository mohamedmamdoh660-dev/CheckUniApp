export interface ZohoCountry {
  id: string;
  name?: string;
  country_code?: string;
}

export interface ZohoCity {
  id: string;
  name?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
  
  // Related entities
  zoho_countries?: ZohoCountry;
}
