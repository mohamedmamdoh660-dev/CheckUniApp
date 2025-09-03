export interface ZohoCountry {
  id: string;
  name: string;
  country_code?: string;
  active_on_nationalities?: boolean;
  active_on_university?: boolean;
}

export interface ZohoCity {
  id: string;
  name?: string;
  country?: string;
  created_at?: string;
  update_at?: string;
}

export interface ZohoUniversity {
  id: string;
  name?: string;
  sector?: string;
  acomodation?: string;
  phone?: string;
  wesbite?: string;
  logo?: string;
  profile_image?: string;
  address?: string;
  city?: string;
  country?: string;
  created_at?: string;
  update_at?: string;
}

export interface ZohoDegree {
  id: string;
  name?: string;
  code?: string;
  active?: boolean;
}

export interface Zohofaculty {
  id: string;
  name?: string;
  active?: boolean;
}

export interface ZohoLanguage {
  id: string;
  name?: string;
}

export interface ZohoSpeciality {
  id: string;
  name?: string;
  active?: boolean;
  faculty_id?: string;
}

export interface ZohoProgram {
  id: string;
  name?: string;
  faculty_id?: string;
  speciality_id?: string;
  degree_id?: string;
  language_id?: string;
  university_id?: string;
  city_id?: string;
  country_id?: string;
  created_at?: string;
  updated_at?: string;
  official_tuition?: string;
  discounted_tuition?: string;
  tuition_currency?: string;
  active?: boolean;
  active_applications?: boolean;
  study_years?: string;
  
  // Related entities
  zoho_countries?: ZohoCountry;
  zoho_degrees?: ZohoDegree;
  zoho_faculty?: Zohofaculty;
  zoho_languages?: ZohoLanguage;
  zoho_speciality?: ZohoSpeciality;
  zoho_cities?: ZohoCity;
  zoho_universities?: ZohoUniversity;
}