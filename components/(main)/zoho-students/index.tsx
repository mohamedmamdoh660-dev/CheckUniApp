"use client";
import { useState, useEffect, useCallback } from "react";

import { getZohoStudentsColumns } from "@/components/data-table/columns/column-zoho-students";
import { ZohoStudentsDataTableToolbar } from "@/components/data-table/toolbars/zoho-students-toolbar";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { ZohoStudent } from "@/types/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getStudentsPagination } from "@/supabase/actions/db-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { generateNameAvatar } from "@/utils/generateRandomAvatar";
import {
  Mail,
  Phone,
  Globe,
  Calendar,
  LayoutGrid,
  RefreshCcw,
} from "lucide-react";
import InfoGraphic from "@/components/ui/info-graphic";
import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/lib/supabase-auth-client";
export default function ZohoStudentsManagementPage({ type }: { type: string }) {
  const [listStudents, setListStudents] = useState<ZohoStudent[]>([]);
  const [recordCount, setRecordCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(12);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const { userProfile } = useAuth();
  const router = useRouter();

  async function fetchStudents() {
    setIsRefetching(true);
    try {
      const studentsResponse: any = await getStudentsPagination(
        `${debouncedSearchTerm}`,
        pageSize,
        currentPage,
        userProfile?.id || "",
        userProfile?.roles?.name || "",
        userProfile?.agency_id || ""
      );

      setListStudents(studentsResponse.students);
      setRecordCount(studentsResponse.totalCount);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsRefetching(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, [currentPage, pageSize, debouncedSearchTerm]);

  // Realtime list updates for students table
  useEffect(() => {
    const channel = supabaseClient
      .channel("rt-students-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "zoho_students" },
        () => fetchStudents()
      )
      .subscribe();
    return () => {
      try {
        supabaseClient.removeChannel(channel);
      } catch {}
    };
  }, []);

  const handleGlobalFilterChange = (filter: string) => {
    if (!searchQuery && !filter) {
      setIsRefetching(true);
      fetchStudents();
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
          data={listStudents || []}
          toolbar={
            <ZohoStudentsDataTableToolbar
              fetchRecords={fetchStudents}
              type={type}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          }
          columns={getZohoStudentsColumns(fetchStudents, router)}
          onGlobalFilterChange={handleGlobalFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSize={pageSize}
          currentPage={currentPage}
          loading={isRefetching}
          error={""}
          rowCount={recordCount}
          type="zoho-students"
        />
      ) : (
        <>
          <ZohoStudentsDataTableToolbar
            fetchRecords={fetchStudents}
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
                    <div className="h-6 w-24 bg-muted rounded" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <div key={j} className="h-4 w-full bg-muted rounded" />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (listStudents || []).length === 0 ? (
            <InfoGraphic
              icon={<LayoutGrid className="h-16 w-16 text-primary" />}
              title="No students found"
              description="Try adjusting your search or filters, or add a new student."
              isLeftArrow={false}
              button={
                <Button variant="outline" size="sm" onClick={fetchStudents}>
                  <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(listStudents || []).map((student) => (
                <Card
                  key={student.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="border-foreground/10 border-[1px]">
                        <AvatarImage
                          src={generateNameAvatar(
                            `${student.first_name || ""} ${student.last_name || ""}`
                          )}
                        />
                      </Avatar>
                      <div className="min-w-0">
                        <CardTitle className="text-base font-semibold truncate">
                          {(student.first_name || "") +
                            " " +
                            (student.last_name || "")}
                        </CardTitle>
                        <div className="text-xs text-muted-foreground truncate">
                          {student.email || "-"}
                        </div>
                      </div>
                    </div>
                    {student.education_level_name ? (
                      <Badge
                        variant="outline"
                        className="capitalize whitespace-nowrap"
                      >
                        {student.education_level_name}
                      </Badge>
                    ) : null}
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground inline-flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email
                      </span>
                      <span className="font-medium truncate">
                        {student.email || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground inline-flex items-center gap-2">
                        <Phone className="h-4 w-4" /> Mobile
                      </span>
                      <span className="font-medium truncate">
                        {student.mobile || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground inline-flex items-center gap-2">
                        <Globe className="h-4 w-4" /> Nationality
                      </span>
                      <span className="font-medium truncate">
                        {student.nationality ||
                          student.nationality_record?.name ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground inline-flex items-center gap-2">
                        <Globe className="h-4 w-4" /> Residence
                      </span>
                      <span className="font-medium truncate">
                        {student.country_of_residence ||
                          student.country_of_residence_record?.name ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Created
                      </span>
                      <span className="font-medium">
                        {student.created_at
                          ? new Date(student.created_at).toLocaleDateString()
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
