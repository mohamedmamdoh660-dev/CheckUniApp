
export interface User {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  password?: string
  role_id?: string
  project_id?: string
  is_active?: boolean
  last_login?: string
  created_at?: string
  updated_at?: string
  profile?: string
  status?: string
  agency_id?: string
  roles?: {
    name: string
  }
  projects?: {
    name: string
  }
  agency?: {
    name: string
  }
} 

export enum UserRoles {
  ADMIN = "admin",
  AGENCY = "agency",
  AGENT = "agent"
}


