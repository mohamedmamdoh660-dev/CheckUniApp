"use client";
import { useState, useEffect } from "react";

import { getZohoApplicationsColumns } from "@/components/data-table/columns/column-zoho-applications";
import { ZohoApplicationsDataTableToolbar } from "@/components/data-table/toolbars/zoho-applications-toolbar";
import { DataTable } from "@/components/data-table/data-table";
import { zohoApplicationsService } from "@/modules/zoho-applications/services/zoho-applications-service";
import { ZohoApplication } from "@/types/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/context/AuthContext";

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
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const { userProfile } = useAuth();
  async function fetchApplications() {
    setIsRefetching(true);
    try {
      const applicationsResponse: any =
        await zohoApplicationsService.getApplicationsPagination(
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
      <DataTable
        data={listApplications || []}
        toolbar={
          <ZohoApplicationsDataTableToolbar
            fetchRecords={fetchApplications}
            type={type}
          />
        }
        columns={getZohoApplicationsColumns(fetchApplications)}
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
    </div>
  );
}
