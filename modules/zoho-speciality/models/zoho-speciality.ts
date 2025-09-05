import { ZohoFaculty } from "../../zoho-faculty/models/zoho-faculty";

export interface ZohoSpeciality {
  id: string;
  name?: string;
  active?: boolean;
  created_at?: string;
  update_at?: string;
  faculty_id?: string;
  
  // Related entities
  zoho_faculty?: ZohoFaculty;
}
