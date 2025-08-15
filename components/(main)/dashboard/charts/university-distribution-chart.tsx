"use client";

import { useEffect, useState } from "react";
import { Pie, PieChart, Cell, Legend } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dashboardService } from "@/modules/dashboard/services/dashboard-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom legend component that shows both color and value
const CustomLegend = (props: any) => {
  const { payload } = props;

  return (
    <ul className="flex flex-wrap gap-4 justify-center mt-4">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm">
            {entry.value}: {entry.payload.applications}
          </span>
        </li>
      ))}
    </ul>
  );
};

export function UniversityDistributionChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [colors, setColors] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const data = await dashboardService.getUniversityDistribution();

      // Limit to top 5 universities for better visualization if there are many
      const sortedData = [...data].sort(
        (a, b) => b.applications - a.applications
      );
      const topData = sortedData.slice(0, 8);

      setChartData(topData);

      // Generate colors for the chart
      const chartColors = topData.map(
        (_, index) => `var(--chart-${(index % 5) + 1})`
      );
      setColors(chartColors);
    } catch (error) {
      console.error("Error fetching university distribution:", error);
      toast.error("Failed to load university distribution data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>University Distribution</CardTitle>
          <CardDescription>Applications by university</CardDescription>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw
            className={cn(
              "h-4 w-4",
              (isLoading || isRefreshing) && "animate-spin"
            )}
          />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <PieChart width={400} height={250} className="mx-auto">
              {/* <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              /> */}
              <Pie
                data={chartData}
                dataKey="applications"
                nameKey="university"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                // label={(entry) => {
                //   // Truncate long university names
                //   const name = entry.university.length > 12
                //     ? entry.university.substring(0, 10) + '...'
                //     : entry.university;
                //   return `${name}: ${entry.applications}`;
                // }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Legend
                content={<CustomLegend />}
                layout="horizontal"
                verticalAlign="bottom"
              />
            </PieChart>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
