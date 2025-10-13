import { ResourceType, ActionType } from "@/types/types";

interface RoleAccess {
  action: string;
  resource: string;
}

interface Role {
  name: string;
  description: string;
  role_accessCollection: {
    edges: Array<{
      node: RoleAccess;
    }>;
  };
}

interface UserProfile {
  id: string;
  email: string;
  roles: Role;
  role_id: string;
  is_active: boolean;
  first_name: string;
  last_name: string;
  created_at: string;
  last_login: string | null;
  updated_at: string;
  profile: string;
}

interface UserData {
  user: {
    user_profileCollection: {
      edges: Array<{
        node: UserProfile;
      }>;
    };
  };
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userData: UserData, 
  resource: ResourceType | string, 
  action: ActionType | string
): boolean {
  try {
    const userProfile = userData.user.user_profileCollection.edges[0]?.node;
    if (!userProfile) return false;

    const roleAccess = userProfile.roles.role_accessCollection.edges;
    
    return roleAccess.some(
      (access) => access.node.resource === resource && access.node.action === action
    );
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

/**
 * Check if user can access a module (has read permission)
 */
export function canAccessModule(userData: UserData, resource: ResourceType | string): boolean {
  return hasPermission(userData, resource, ActionType.READ) || hasPermission(userData, resource, ActionType.VIEW);
}

/**
 * Check if user can create resources
 */
export function canCreate(userData: UserData, resource: ResourceType | string): boolean {
  return hasPermission(userData, resource, ActionType.CREATE);
}

/**
 * Check if user can edit resources
 */
export function canEdit(userData: UserData, resource: ResourceType | string): boolean {
  return hasPermission(userData, resource, ActionType.EDIT);
}

/**
 * Check if user can delete resources
 */
export function canDelete(userData: UserData, resource: ResourceType | string): boolean {
  return hasPermission(userData, resource, ActionType.DELETE);
}

/**
 * Check if user can view specific resource details
 */
export function canView(userData: UserData, resource: ResourceType | string): boolean {
  return hasPermission(userData, resource, ActionType.VIEW);
}

/**
 * Parse user data from cookie string
 */
export function parseUserData(cookieData: string): UserData | null {
  try {
    const decodedData = decodeURIComponent(cookieData);
    return JSON.parse(decodedData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(userData: UserData): Array<{ resource: string; action: string }> {
  try {
    const userProfile = userData.user.user_profileCollection.edges[0]?.node;
    if (!userProfile) return [];

    const roleAccess = userProfile.roles.role_accessCollection.edges;
    
    return roleAccess.map((access) => ({
      resource: access.node.resource,
      action: access.node.action,
    }));
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
} 