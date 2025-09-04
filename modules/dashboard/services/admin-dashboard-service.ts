import { supabase } from "@/lib/supabase-auth-client";

export const adminDashboardService = {
  /**
   * Get admin dashboard statistics
   */
  getAdminDashboardStats: async () => {
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
    
    if (error) {
      console.error("Error:", error);
    } else {
      return data;
    }
  },

  /**
   * Get application funnel data
   */
  getApplicationFunnel: async () => {
    try {
      const { data, error } = await supabase
        .from('zoho_applications')
        .select('stage')
      
      if (error) throw error;
      
      // Count applications by status
      const statusCounts: Record<string, number> = {};
      
      // Count each status
      data.forEach(item => {
        const status = item.stage || 'Unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      // Convert to array format for funnel chart
      const totalApplications = data.length;
      
      const funnelData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        value: count,
        percentage: totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0
      }));
      
      return funnelData;
    } catch (error) {
      console.error("Error fetching application funnel data:", error);
      throw error;
    }
  },

  /**
   * Get best programs data
   */
  getBestPrograms: async (filters: { degree?: string, university?: string, stage?: string } = {}) => {
    try {
      let query = supabase
        .from('zoho_applications')
        .select(`
          zoho_programs (
            id,
            name,
            degree_id
          ),
          zoho_universities (
            id,
            name
          ),
          stage
        `);
      
      // Apply filters if provided
      if (filters.degree && filters.degree !== 'All') {
        query = query.eq('zoho_programs.degree_id', filters.degree);
      }
      
      if (filters.university && filters.university !== 'All') {
        query = query.eq('zoho_universities.name', filters.university);
      }
      
      if (filters.stage && filters.stage !== 'All') {
        query = query.eq('stage', filters.stage.toLowerCase());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Count applications per program
      const programCounts = data.reduce((acc: Record<string, any>, item: any) => {
        const programName = item.zoho_programs?.name || 'Unknown Program';
        const programId = item.zoho_programs?.id || 'unknown';
        
        if (!acc[programId]) {
          acc[programId] = {
            name: programName,
            applications: 0,
            degree: item.zoho_programs?.degree_id || 'Unknown'
          };
        }
        
        acc[programId].applications++;
        return acc;
      }, {});
      
      // Transform to array for chart and sort by applications count
      const chartData = Object.values(programCounts)
        .sort((a: any, b: any) => b.applications - a.applications)
        .slice(0, 10); // Limit to top 10
      
      return chartData;
    } catch (error) {
      console.error("Error fetching best programs data:", error);
      throw error;
    }
  }
};
