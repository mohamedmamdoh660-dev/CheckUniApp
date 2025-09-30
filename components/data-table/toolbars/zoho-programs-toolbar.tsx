"use client";

import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import {
  Download,
  Plus,
  RefreshCcw,
  X,
  Search,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import AddZohoProgram from "@/components/(main)/zoho-programs/component/add-zoho-program";
import { useAuth } from "@/context/AuthContext";
import { SearchableDropdown } from "@/components/searchable-dropdown";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface DataTableToolbarProps<TData> {
  table?: Table<TData>;
  onRefresh?: () => void;
  onExport?: () => void;
  tableName?: string;
  onGlobalFilterChange?: (value: string) => void;
  fetchRecords: () => void;
  type?: string;
  viewMode: "table" | "cards";
  setViewMode: (viewMode: "table" | "cards") => void;
  onFiltersChange?: (filters: Record<string, string>) => void;
  filters?: Record<string, string>;
  globalFilter?: string;
  setGlobalFilter?: (value: string) => void;
}

export function ZohoProgramsDataTableToolbar<TData>({
  table,
  onRefresh,
  onExport,
  tableName,
  onGlobalFilterChange,
  fetchRecords,
  type,
  onFiltersChange,
  filters = {},
  viewMode,
  setViewMode,
  globalFilter,
  setGlobalFilter,
}: DataTableToolbarProps<TData>) {
  const [openFilters, setOpenFilters] = useState(false);

  // Advanced filter local state reflecting columns
  const [university, setUniversity] = useState(filters.university || "");
  const [faculty, setFaculty] = useState(filters.faculty || "");
  const [speciality, setSpeciality] = useState(filters.speciality || "");
  const [degree, setDegree] = useState(filters.degree || "");
  const [country, setCountry] = useState(filters.country || "");
  const [city, setCity] = useState(filters.city || "");
  const [language, setLanguage] = useState(filters.language || "");
  const [tuitionMin, setTuitionMin] = useState(filters.tuition_min || "");
  const [tuitionMax, setTuitionMax] = useState(filters.tuition_max || "");
  const [active, setActive] = useState(filters.active || ""); // "true" | "false" | ""
  const [appsOpen, setAppsOpen] = useState(filters.active_applications || ""); // "open" | "closed" | ""
  const [createdFrom, setCreatedFrom] = useState(filters.created_from || "");
  const [createdTo, setCreatedTo] = useState(filters.created_to || "");

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter?.(value);
    onGlobalFilterChange?.(value);
  };

  const isFiltered = globalFilter !== "";
  const activeCount = Object.keys(filters || {}).length;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative w-1/2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Program Name"
            value={globalFilter}
            onChange={handleFilterChange}
            className="h-8 pl-8 w-full focus-visible:ring-0"
          />
        </div>

        <div className="px-2 flex items-center gap-2">
          <Popover open={openFilters} onOpenChange={setOpenFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <TableIcon className="mr-2 h-4 w-4" /> Advanced Filters
                {activeCount > 0 && (
                  <Badge
                    className="ml-2 h-5 px-1 text-[10px]"
                    variant="secondary"
                  >
                    {activeCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[780px] p-4" align="start">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SearchableDropdown
                  placeholder="University"
                  table="zoho-universities"
                  searchField="name"
                  displayField="name"
                  initialValue={university}
                  onSelect={(it: any) => setUniversity(it?.id || "")}
                />
                <SearchableDropdown
                  placeholder="Faculty"
                  table="zoho-faculties"
                  searchField="name"
                  displayField="name"
                  initialValue={faculty}
                  onSelect={(it: any) => setFaculty(it?.id || "")}
                />
                <SearchableDropdown
                  placeholder="Speciality"
                  table="zoho-specialities"
                  searchField="name"
                  displayField="name"
                  initialValue={speciality}
                  onSelect={(it: any) => setSpeciality(it?.id || "")}
                />
                <SearchableDropdown
                  placeholder="Degree"
                  table="zoho-degrees"
                  searchField="name"
                  displayField="name"
                  initialValue={degree}
                  onSelect={(it: any) => setDegree(it?.id || "")}
                />

                <SearchableDropdown
                  placeholder="Language"
                  table="zoho-languages"
                  searchField="name"
                  displayField="name"
                  initialValue={language}
                  onSelect={(it: any) => setLanguage(it?.id || "")}
                />
                <Select
                  value={active}
                  onValueChange={(it: any) =>
                    it === "null" ? setActive("") : setActive(it)
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Status (any)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Status (any)</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={appsOpen}
                  onValueChange={(it: any) =>
                    it === "null" ? setAppsOpen("") : setAppsOpen(it)
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Applications (any)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Applications (any)</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUniversity("");
                    setFaculty("");
                    setSpeciality("");
                    setDegree("");
                    setCountry("");
                    setCity("");
                    setLanguage("");
                    setTuitionMin("");
                    setTuitionMax("");
                    setActive("");
                    setAppsOpen("");
                    setCreatedFrom("");
                    setCreatedTo("");
                    onFiltersChange?.({});
                    setOpenFilters(false);
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const next: Record<string, string> = {
                      university,
                      faculty,
                      speciality,
                      degree,
                      country,
                      city,
                      language,
                      active,
                      active_applications: appsOpen,
                      created_from: createdFrom,
                      created_to: createdTo,
                    };
                    if (tuitionMin) next.tuition_min = tuitionMin;
                    if (tuitionMax) next.tuition_max = tuitionMax;
                    Object.keys(next).forEach((k) => {
                      if (!next[k]) delete next[k];
                    });
                    onFiltersChange?.(next);
                    setOpenFilters(false);
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          {(activeCount > 0 || isFiltered) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setGlobalFilter?.("");
                onGlobalFilterChange?.("");

                onFiltersChange?.({});
              }}
              className="h-8 px-2"
            >
              Clear Search
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(v) => v && setViewMode(v as any)}
        variant="outline"
        className="hidden md:flex"
      >
        <ToggleGroupItem
          value="table"
          aria-label="Table view"
          className="gap-2 h-8"
        >
          <TableIcon className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="cards"
          aria-label="Card view"
          className="gap-2 h-8"
        >
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      {tableName && (
        <div className="px-2">
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
            onClick={onExport}
          >
            <Download className="p-1" />
            Export
          </Button>
        </div>
      )}
      <div className="px-2">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchRecords}
          className="ml-auto hidden h-8 lg:flex"
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {table && <DataTableViewOptions table={table} />}
      {/* {userProfile?.roles?.name === "admin" && (
        <div className="pl-2">
          <Button
            variant="default"
            size="sm"
            className="ml-auto h-8"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" /> Add Program
          </Button>
        </div>
      )} */}
      {/* <AddZohoProgram
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onRefresh={fetchRecords}
      /> */}
    </div>
  );
}
