"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { format } from "date-fns";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { dashboardService } from "@/modules/dashboard/services/dashboard-service";
import { useAuth } from "@/context/AuthContext";

const chartConfig = {
  pending: {
    label: "Pending",
    color: "var(--chart-1)",
  },
  processing: {
    label: "Processing",
    color: "var(--chart-2)",
  },
  completed: {
    label: "Completed",
    color: "var(--chart-3)",
  },
  failed: {
    label: "Failed",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function ApplicationChart() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30");
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { userProfile } = useAuth();

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("10");
    }
  }, [isMobile]);

  const loadData = async (days: number) => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getApplicationTimeline(
        days,
        userProfile?.id,
        userProfile?.agency_id,
        userProfile?.roles?.name
      );
      setChartData(data);
    } catch (error) {
      console.error("Error loading application timeline data:", error);
      toast.error("Failed to load application timeline");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData(parseInt(timeRange));
  }, [timeRange]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(parseInt(timeRange));
    setIsRefreshing(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-sm p-3">
          <p className="font-medium mb-2">
            {format(new Date(label), "MMM d, yyyy")}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div
                key={`tooltip-${index}`}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="font-medium">{entry.name}:</span>
                <span>{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <CardTitle>Application Timeline</CardTitle>
            <CardDescription>
              <span className="hidden @[540px]/card:block">
                Data for the last {timeRange} days
              </span>
              <span className="@[540px]/card:hidden">
                Last {timeRange} days
              </span>
            </CardDescription>
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
        </div>
        <CardAction className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => value && setTimeRange(value)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="7">7 days</ToggleGroupItem>
            <ToggleGroupItem value="30">30 days</ToggleGroupItem>
            <ToggleGroupItem value="90">90 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Select days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7" className="rounded-lg">
                7 days
              </SelectItem>
              <SelectItem value="30" className="rounded-lg">
                30 days
              </SelectItem>
              <SelectItem value="90" className="rounded-lg">
                90 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="aspect-auto h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="fillPending"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-pending)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-pending)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="fillProcessing"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-processing)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-processing)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="fillCompleted"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-completed)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-completed)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-failed)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-failed)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} opacity={0.1} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    name="Pending"
                    stroke="var(--color-pending)"
                    fill="url(#fillPending)"
                    stackId="a"
                  />
                  <Area
                    type="monotone"
                    dataKey="processing"
                    name="Processing"
                    stroke="var(--color-processing)"
                    fill="url(#fillProcessing)"
                    stackId="a"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke="var(--color-completed)"
                    fill="url(#fillCompleted)"
                    stackId="a"
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    name="Failed"
                    stroke="var(--color-failed)"
                    fill="url(#fillFailed)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
