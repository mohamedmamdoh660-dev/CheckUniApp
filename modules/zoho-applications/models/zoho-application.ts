import { ZohoCountry, ZohoDegree, ZohoProgram, ZohoUniversity } from "@/modules/zoho-programs/models/zoho-program";
import { ZohoStudent } from "@/modules/zoho-students/models/zoho-student";

export interface ZohoAcademicYear {
  id: string;
  name?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ZohoSemester {
  id: string;
  name?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ZohoApplication {
  id: string;
  created_at?: string;
  updated_at?: string;
  student?: number | null;
  program?: number | null;
  acdamic_year?: number | null;
  semester?: number | null;
  country?: number | null;
  university?: number | null;
  stage?: string;
  degree?: number | null;
  
  // Related entities
  zoho_students?: ZohoStudent;
  zoho_programs?: ZohoProgram;
  zoho_academic_years?: ZohoAcademicYear;
  zoho_semesters?: ZohoSemester;
  zoho_countries?: ZohoCountry;
  zoho_universities?: ZohoUniversity;
  zoho_degrees?: ZohoDegree;
}
