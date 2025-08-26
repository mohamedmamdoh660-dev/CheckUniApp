export interface University {
  id: string;
  name?: string;
  sector?: string;
  acomodation?: string;
  phone?: string;
  wesbite?: string;
  logo?: string;
  profile_image?: string;
  address?: string;
  city?: number;
  country?: number;
  created_at?: string;
  update_at?: string;
  
  // Related entities
  zoho_cities?: {
    id: string;
    name?: string;
  };
  zoho_countries?: {
    id: string;
    name: string;
    country_code?: string;
  };
}
