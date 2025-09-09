"use client";
import { useState, useEffect } from "react";

import { getZohoStudentsColumns } from "@/components/data-table/columns/column-zoho-students";
import { ZohoStudentsDataTableToolbar } from "@/components/data-table/toolbars/zoho-students-toolbar";
import { DataTable } from "@/components/data-table/data-table";
import { zohoStudentsService } from "@/modules/zoho-students/services/zoho-students-service";
import { ZohoStudent } from "@/types/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/context/AuthContext";

export default function ZohoStudentsManagementPage({ type }: { type: string }) {
  const [listStudents, setListStudents] = useState<ZohoStudent[]>([]);
  const [recordCount, setRecordCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const { userProfile } = useAuth();
  async function fetchStudents() {
    setIsRefetching(true);
    try {
      const studentsResponse: any =
        await zohoStudentsService.getStudentsPagination(
          `%${debouncedSearchTerm}%`,
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
      <DataTable
        data={listStudents || []}
        toolbar={
          <ZohoStudentsDataTableToolbar
            fetchRecords={fetchStudents}
            type={type}
          />
        }
        columns={getZohoStudentsColumns(fetchStudents)}
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
    </div>
  );
}
