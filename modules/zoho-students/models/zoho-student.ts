import { ZohoCountry } from "@/modules/zoho-programs/models/zoho-program";

export interface ZohoStudent {
  id: string;
  created_at?: string;
  updated_at?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string;
  nationality?: string;
  passport_number?: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  country_of_residence?: string;
  email?: string;
  mobile?: string;
  father_name?: string;
  father_mobile?: string;
  father_job?: string;
  mother_name?: string;
  mother_mobile?: string;
  mother_job?: string;
  nationality_record?: ZohoCountry;
  country_of_residence_record?: ZohoCountry;
}
