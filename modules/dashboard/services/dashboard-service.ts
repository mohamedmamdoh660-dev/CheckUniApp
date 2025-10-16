import { supabase } from "@/lib/supabase-auth-client";
import { adminDashboardService } from "./admin-dashboard-service";

export const dashboardService = {
  // Admin dashboard services
  getAdminDashboardStats: adminDashboardService.getAdminDashboardStats,
  getApplicationFunnel: adminDashboardService.getApplicationFunnel,
  getBestPrograms: adminDashboardService.getBestPrograms,
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (role: string | undefined, agencyId: string | undefined, userId: string | undefined) => {
    try {
      const { data, error } = await supabase
      .rpc('get_dashboard_stats', {
        p_role: role,          // 'admin' | 'agency' | 'agent'
        p_agency_id: agencyId, // required if role = 'agency'
        p_user_id: userId      // required if role = 'agent'
      });

    if (error) {
      console.error(error);
      throw error;
    } else {
            // { totalStudents, totalApplications, totalUniversities, successRate }

      return data;

    }
    
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  /**
   * Get application stages count
   */
  getApplicationStagesCount: async () => {
    try {
      // Get pending applications count
      const { count: pending, error: pendingError } = await supabase
        .from('zoho_applications')
        .select('*', { count: 'exact', head: true })
        .eq('stage', 'pending');

      if (pendingError) throw pendingError;

      // Get processing applications count
      const { count: processing, error: processingError } = await supabase
        .from('zoho_applications')
        .select('*', { count: 'exact', head: true })
        .eq('stage', 'processing');

      if (processingError) throw processingError;

      // Get completed applications count
      const { count: completed, error: completedError } = await supabase
        .from('zoho_applications')
        .select('*', { count: 'exact', head: true })
        .eq('stage', 'completed');

      if (completedError) throw completedError;

      // Get failed applications count
      const { count: failed, error: failedError } = await supabase
        .from('zoho_applications')
        .select('*', { count: 'exact', head: true })
        .eq('stage', 'failed');

      if (failedError) throw failedError;

      return {
        pending: pending || 0,
        processing: processing || 0,
        completed: completed || 0,
        failed: failed || 0
      };
    } catch (error) {
      console.error("Error fetching application stages count:", error);
      throw error;
    }
  },

  /**
   * Get university distribution
   */
  getUniversityDistribution: async (userId: string | undefined, agencyId: string | undefined, role: string | undefined) => {
    try {
        const query = supabase
        .from('zoho_applications')
        .select('university::text, zoho_universities(id::text, name)')
        .not('university', 'is', null);

      if (role === 'agent') {
         query.eq('agency_id', userId);
      } else if (role === 'sub agent') {
        query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Count applications per university
      const universityCounts = data?.reduce((acc: Record<string, any>, item: any) => {
        const universityId = item.university;
        const universityName = item.zoho_universities?.name || `University ${universityId}`;
        
        if (!acc[universityId]) {
          acc[universityId] = {
            university: universityName,
            applications: 0
          };
        }
        
        acc[universityId].applications++;
        return acc;
      }, {});

      // Transform to array for chart
      const chartData = Object.values(universityCounts || {}).map((item: any, index: number) => ({
        ...item,
        fill: `var(--chart-${(index % 5) + 1})`
      }));

      return chartData;
    } catch (error) {
      console.error("Error fetching university distribution:", error);
      throw error;
    }
  },

  /**
   * Get gender distribution
   */
  getGenderDistribution: async (userId: string | undefined, agencyId: string | undefined, role: string | undefined) => {
    try {
      // Get students grouped by gender
      const query =  supabase
        .from('zoho_students')
        .select('gender')
        .not('gender', 'is', null);

      if (role === 'agent') {
         query.eq('agency_id', userId);
      } else if (role === 'sub agent') {
        query.eq('user_id', userId);
      }


      const { data, error } = await query;

      if (error) throw error;

      // Count students per gender
      const genderCounts = data?.reduce((acc: Record<string, any>, item: any) => {
        const gender = item.gender.charAt(0).toUpperCase() + item.gender.slice(1);
        
        if (!acc[gender]) {
          acc[gender] = {
            gender,
            students: 0
          };
        }
        
        acc[gender].students++;
        return acc;
      }, {});

      // Transform to array for chart
      const chartData = Object.values(genderCounts || {}).map((item: any, index: number) => ({
        ...item,
        fill: `var(--chart-${(index % 5) + 1})`
      }));

      return chartData;
    } catch (error) {
      console.error("Error fetching gender distribution:", error);
      throw error;
    }
  },

  /**
   * Get recent applications
   */
  getRecentApplications: async (limit = 10, userId: string | undefined, agencyId: string | undefined, role: string | undefined) => {
    try {
      const query = supabase
        .from('zoho_applications')
        .select(`
          id,
          created_at,
          updated_at,
          stage,
          zoho_students (
            id,
            first_name,
            last_name,
            email,
            photo_url
          ),
          zoho_programs (
            id,
            name
          ),
          zoho_universities (
            id,
            name,
            logo
          ),
          zoho_academic_years (
            id,
            name
          ),
          zoho_semesters (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (role === 'agent') {
         query.eq('agency_id', userId);
      } else if (role === 'sub agent') {
        query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching recent applications:", error);
      throw error;
    }
  },

  /**
   * Get all available application stages
   */
  getApplicationStages: async (userId?: string, agencyId?: string, role?: string) => {
    try {
      const query = supabase
        .from('zoho_applications')
        .select('stage')
        .not('stage', 'is', null);

      // Apply role-based filtering if needed
      if (role === 'agent') {
        query.eq('agency_id', userId);
      } else if (role === 'sub agent') {
        query.eq('user_id', userId);
      }

      const { data, error } = await query.order('stage');
      
      if (error) throw error;
      
      // Extract unique stages and preserve original casing
      const uniqueStages = Array.from(
        new Set(data.map((item: any) => item.stage?.toLowerCase()).filter(Boolean))
      );
      
      
      return uniqueStages;
    } catch (error) {
      console.error("Error fetching application stages:", error);
      throw error;
    }
  },

  /**
   * Get application timeline data
   */
  getApplicationTimeline: async (days = 30, userId: string | undefined, agencyId: string | undefined, role: string | undefined) => {
    try {
      // Calculate the date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch applications within the date range
      const query = supabase
        .from('zoho_applications')
        .select('created_at, stage')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (role === 'agent') {
         query.eq('agency_id', userId);
      } else if (role === 'sub agent') {
        query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;


      if (!data || data.length === 0) {
        const result = Array.from(new Array(days).keys()).map((i) => {
          const date = new Date(endDate);
          date.setDate(date.getDate() - (days - 1 - i));
          return { date: date.toISOString().split('T')[0] };
        });
        return { data: result, stages: [] };
      }

      // First pass: Collect ALL unique stages from the actual data
      const allStagesSet = new Set<string>();
      data.forEach((app: any) => {
        const stage = app.stage?.toLowerCase().trim();
        if (stage) {
          allStagesSet.add(stage);
        }
      });

      // Use all stages found in the data
      const allStages = Array.from(allStagesSet).sort();

      // Create a map for each day in the range
      const dateMap = new Map();
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Create empty entry with all stages initialized to 0
        const entry: Record<string, any> = { date: dateStr };
        allStages.forEach(stage => {
          entry[stage] = 0;
        });
        
        dateMap.set(dateStr, entry);
      }

      // Group applications by date and stage
      const dailyCounts = new Map<string, Map<string, number>>();
      
      data.forEach((app: any) => {
        const appDate = new Date(app.created_at);
        const dateStr = appDate.toISOString().split('T')[0];
        const stage = app.stage?.toLowerCase().trim();
        
        if (!stage) return;
        
        if (!dailyCounts.has(dateStr)) {
          dailyCounts.set(dateStr, new Map());
        }
        
        const dayStageCounts = dailyCounts.get(dateStr)!;
        dayStageCounts.set(stage, (dayStageCounts.get(stage) || 0) + 1);
      });

      // Calculate cumulative counts for each date in our range
      const cumulativeCounts = new Map<string, number>();
      allStages.forEach(stage => cumulativeCounts.set(stage, 0));

      // Process each date in chronological order
      const sortedDates = Array.from(dateMap.keys()).sort();
      
      sortedDates.forEach(dateStr => {
        const entry = dateMap.get(dateStr)!;
        
        // Add today's applications to cumulative count
        const todaysCounts = dailyCounts.get(dateStr);
        if (todaysCounts) {
          todaysCounts.forEach((count, stage) => {
            const currentCount = cumulativeCounts.get(stage) || 0;
            cumulativeCounts.set(stage, currentCount + count);
          });
        }
        
        // Set cumulative values for this date
        allStages.forEach(stage => {
          entry[stage] = cumulativeCounts.get(stage) || 0;
        });
      });

      // Convert map to array (already sorted by our processing order)
      const result = Array.from(dateMap.values());
      
     
     
      return { data: result, stages: allStages };
    } catch (error) {
      console.error("Error fetching application timeline:", error);
      throw error;
    }
  }
};