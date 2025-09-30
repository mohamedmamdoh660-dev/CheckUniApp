"use client";
import { useState, useEffect } from "react";

import { getZohoCitiesColumns } from "@/components/data-table/columns/column-zoho-cities";
import { ZohoCitiesDataTableToolbar } from "@/components/data-table/toolbars/zoho-cities-toolbar";
import { DataTable } from "@/components/data-table/data-table";

import { useDebounce } from "@/hooks/use-debounce";
import { ZohoCity } from "@/types/types";
import { zohoCitiesService } from "@/modules/zoho-cities/services/zoho-cities-service";

export default function ZohoCitiesManagementPage({ type }: { type: string }) {
  const [listCities, setListCities] = useState<ZohoCity[]>([]);
  const [recordCount, setRecordCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(12);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);

  async function fetchCities() {
    setIsRefetching(true);
    try {
      const citiesResponse: any = await zohoCitiesService.getCitiesPagination(
        `%${debouncedSearchTerm}%`,
        pageSize,
        currentPage
      );

      setListCities(citiesResponse.cities);
      setRecordCount(citiesResponse.totalCount);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setIsRefetching(false);
    }
  }

  useEffect(() => {
    fetchCities();
  }, [currentPage, pageSize, debouncedSearchTerm]);

  const handleGlobalFilterChange = (filter: string) => {
    if (!searchQuery && !filter) {
      setIsRefetching(true);
      fetchCities();
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
        data={listCities || []}
        toolbar={
          <ZohoCitiesDataTableToolbar fetchRecords={fetchCities} type={type} />
        }
        columns={getZohoCitiesColumns(fetchCities)}
        onGlobalFilterChange={handleGlobalFilterChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSize={pageSize}
        currentPage={currentPage}
        loading={isRefetching}
        error={""}
        rowCount={recordCount}
        type="zoho-cities"
      />
    </div>
  );
}
