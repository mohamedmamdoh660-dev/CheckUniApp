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
  student?: string | null;
  program?: string | null;
  acdamic_year?: string | null;
  semester?: string | null;
  country?: string | null;
  university?: string | null;
  stage?: string;
  degree?: string | null;
  
  // Related entities
  zoho_students?: ZohoStudent;
  zoho_programs?: ZohoProgram;
  zoho_academic_years?: ZohoAcademicYear;
  zoho_semesters?: ZohoSemester;
  zoho_countries?: ZohoCountry;
  zoho_universities?: ZohoUniversity;
  zoho_degrees?: ZohoDegree;
}
