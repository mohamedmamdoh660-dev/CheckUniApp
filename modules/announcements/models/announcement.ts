import { ZohoProgram } from "@/modules/zoho-programs/models/zoho-program";
import { University } from "@/modules/universities/models/university";

export interface Announcement {
  id: string;
  title?: string;
  category?: string;
  description?: string;
  university?: string | null;
  program?: string | null;
  created_at?: string;
  updated_at?: string;
  
  // Related entities
  zoho_universities?: University;
  zoho_programs?: ZohoProgram;
}

export type AnnouncementCategory = "General" | "Admission" | "Academic" | "Event" | "Other";

export const ANNOUNCEMENT_CATEGORIES: AnnouncementCategory[] = [
  "General",
  "Admission",
  "Academic",
  "Event",
  "Other"
];
