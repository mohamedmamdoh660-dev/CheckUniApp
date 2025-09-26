"use client";
import { useState, useEffect, useCallback } from "react";

import { getZohoApplicationsColumns } from "@/components/data-table/columns/column-zoho-applications";
import { ZohoApplicationsDataTableToolbar } from "@/components/data-table/toolbars/zoho-applications-toolbar";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { ZohoApplication } from "@/types/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getApplicationsPagination } from "@/supabase/actions/db-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { generateNameAvatar } from "@/utils/generateRandomAvatar";
import {
  Calendar,
  Building2,
  GraduationCap,
  Globe,
  User,
  Boxes,
  Info,
  LayoutGrid,
  RefreshCcw,
} from "lucide-react";
import InfoGraphic from "@/components/ui/info-graphic";
import { Button } from "@/components/ui/button";

export default function ZohoApplicationsManagementPage({
  type,
}: {
  type: string;
}) {
  const [listApplications, setListApplications] = useState<ZohoApplication[]>(
    []
  );
  const [recordCount, setRecordCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const { userProfile } = useAuth();
  const router = useRouter();

  async function fetchApplications() {
    setIsRefetching(true);
    try {
      const applicationsResponse: any = await getApplicationsPagination(
        `${debouncedSearchTerm}`,
        pageSize,
        currentPage,
        userProfile?.id || "",
        userProfile?.roles?.name || "",
        userProfile?.agency_id || ""
      );

      setListApplications(applicationsResponse.applications);
      setRecordCount(applicationsResponse.totalCount);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setIsRefetching(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, [currentPage, pageSize, debouncedSearchTerm]);

  const handleGlobalFilterChange = (filter: string) => {
    if (!searchQuery && !filter) {
      setIsRefetching(true);
      fetchApplications();
    } else {
      setSearchQuery(filter);
    }
    setCurrentPage(0);
  };

  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 ">
      {viewMode === "table" ? (
        <DataTable
          data={listApplications || []}
          toolbar={
            <ZohoApplicationsDataTableToolbar
              fetchRecords={fetchApplications}
              type={type}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          }
          columns={getZohoApplicationsColumns(fetchApplications, router)}
          onGlobalFilterChange={handleGlobalFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSize={pageSize}
          currentPage={currentPage}
          loading={isRefetching}
          error={""}
          rowCount={recordCount}
          type="zoho-applications"
        />
      ) : (
        <>
          <ZohoApplicationsDataTableToolbar
            fetchRecords={fetchApplications}
            type={type}
            onGlobalFilterChange={handleGlobalFilterChange}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
          {isRefetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 w-full">
                      <div className="h-10 w-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 bg-muted rounded" />
                        <div className="h-3 w-1/3 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="h-6 w-20 bg-muted rounded" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <div key={j} className="h-4 w-full bg-muted rounded" />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (listApplications || []).length === 0 ? (
            <InfoGraphic
              icon={<LayoutGrid className="h-16 w-16 text-primary" />}
              title="No applications found"
              description="Try adjusting your search or filters, or add a new application."
              isLeftArrow={false}
              button={
                <Button variant="outline" size="sm" onClick={fetchApplications}>
                  <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(listApplications || []).map((app) => (
                <Card
                  key={app.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="border-foreground/10 border-[1px]">
                        <AvatarImage
                          src={
                            app.zoho_students?.photo_url ||
                            generateNameAvatar(
                              `${app.zoho_students?.first_name || ""} ${app.zoho_students?.last_name || ""}`
                            )
                          }
                        />
                      </Avatar>
                      <div className="min-w-0">
                        <CardTitle className="text-base font-semibold truncate">
                          {app.application_name ||
                            app.zoho_programs?.name ||
                            "Application"}
                        </CardTitle>
                        <div className="text-xs text-muted-foreground truncate">
                          {(app.zoho_students?.first_name || "") +
                            " " +
                            (app.zoho_students?.last_name || "")}
                        </div>
                      </div>
                    </div>
                    {app.stage ? (
                      <Badge
                        variant="outline"
                        className="capitalize whitespace-nowrap"
                      >
                        {app.stage}
                      </Badge>
                    ) : null}
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground inline-flex items-center gap-2">
                        <User className="h-4 w-4" /> Student
                      </span>
                      <span className="font-medium truncate">
                        {app.student ||
                          `${app.zoho_students?.first_name || ""} ${app.zoho_students?.last_name || ""}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground inline-flex items-center gap-2">
                        <Building2 className="h-4 w-4" /> University
                      </span>
                      <span className="font-medium truncate">
                        {app.zoho_universities?.name || app.university || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground inline-flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" /> Program
                      </span>
                      <span className="font-medium truncate">
                        {app.zoho_programs?.name || app.program || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground inline-flex items-center gap-2">
                        <Boxes className="h-4 w-4" /> Degree
                      </span>
                      <span className="font-medium truncate">
                        {app.zoho_degrees?.name || app.degree || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Academic/Semester
                      </span>
                      <span className="font-medium truncate">
                        {app.zoho_academic_years?.name || "-"} /{" "}
                        {app.zoho_semesters?.name || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground inline-flex items-center gap-2">
                        <Globe className="h-4 w-4" /> Country
                      </span>
                      <span className="font-medium truncate">
                        {app.zoho_countries?.name || app.country || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Created
                      </span>
                      <span className="font-medium">
                        {app.created_at
                          ? new Date(app.created_at).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <DataTablePagination
            table={{} as any}
            pageIndex={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            rowCount={recordCount}
          />
        </>
      )}
    </div>
  );
}
