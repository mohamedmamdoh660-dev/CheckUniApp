"use client";
import { useState, useEffect } from "react";

import { getZohoProgramsColumns } from "@/components/data-table/columns/column-zoho-programs";
import { ZohoProgramsDataTableToolbar } from "@/components/data-table/toolbars/zoho-programs-toolbar";
import { DataTable } from "@/components/data-table/data-table";
import { zohoProgramsService } from "@/modules/zoho-programs/services/zoho-programs-service";
import { ZohoProgram } from "@/modules/zoho-programs/models/zoho-program";
import { useDebounce } from "@/hooks/use-debounce";

export default function ZohoProgramsManagementPage({ type }: { type: string }) {
  const [listPrograms, setListPrograms] = useState<ZohoProgram[]>([]);
  const [recordCount, setRecordCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);

  async function fetchPrograms() {
    setIsRefetching(true);
    try {
      const programsResponse: any =
        await zohoProgramsService.getProgramsPagination(
          `%${debouncedSearchTerm}%`,
          pageSize,
          currentPage
        );

      setListPrograms(programsResponse.programs);
      setRecordCount(programsResponse.totalCount);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setIsRefetching(false);
    }
  }

  useEffect(() => {
    fetchPrograms();
  }, [currentPage, pageSize, debouncedSearchTerm]);

  const handleGlobalFilterChange = (filter: string) => {
    if (!searchQuery && !filter) {
      setIsRefetching(true);
      fetchPrograms();
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
        data={listPrograms || []}
        toolbar={
          <ZohoProgramsDataTableToolbar
            fetchRecords={fetchPrograms}
            type={type}
          />
        }
        columns={getZohoProgramsColumns(fetchPrograms)}
        onGlobalFilterChange={handleGlobalFilterChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSize={pageSize}
        currentPage={currentPage}
        loading={isRefetching}
        error={""}
        rowCount={recordCount}
        type="zoho-programs"
      />
    </div>
  );
}
