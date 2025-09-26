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
  Upload,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import AddZohoApplication from "@/components/(main)/zoho-applications/component/add-zoho-application";
import { useAuth } from "@/context/AuthContext";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DocumentAttachmentDialog } from "@/components/ui/document-attachment-dialog";

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
}

export function ZohoApplicationsDataTableToolbar<TData>({
  table,
  onRefresh,
  onExport,
  tableName,
  onGlobalFilterChange,
  fetchRecords,
  type,
  viewMode,
  setViewMode,
}: DataTableToolbarProps<TData>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [attachOpen, setAttachOpen] = useState(false);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);
    onGlobalFilterChange?.(value);
  };
  const { userProfile } = useAuth();
  const isCrmId = userProfile?.crm_id || userProfile?.agency?.crm_id;

  const isFiltered = globalFilter !== "";

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative w-1/2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Student, Program or Stage"
            value={globalFilter}
            onChange={handleFilterChange}
            className="h-8 pl-8 w-full focus-visible:ring-0"
          />
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              onGlobalFilterChange?.("");
              setGlobalFilter("");
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(v) => v && setViewMode(v as any)}
        variant="outline"
        className="hidden md:flex"
      >
        <ToggleGroupItem
          value="table"
          aria-label="Table view"
          className="gap-2"
        >
          <TableIcon className="h-4 w-4" /> Table
        </ToggleGroupItem>
        <ToggleGroupItem value="cards" aria-label="Card view" className="gap-2">
          <LayoutGrid className="h-4 w-4" /> Cards
        </ToggleGroupItem>
      </ToggleGroup> */}
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
      <div className="px-2 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchRecords}
          className="ml-auto hidden h-8 lg:flex"
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
        {/* {

        }
        <Button
          variant="outline"
          size="sm"
          className="hidden h-8 lg:flex"
          onClick={() => setAttachOpen(true)}
        >
          <Upload className="mr-2 h-4 w-4" /> Upload Missing
        </Button> */}
      </div>
      {table && <DataTableViewOptions table={table} />}
      {isCrmId && (
        <>
          <div className="pl-2">
            <Button
              variant="default"
              size="sm"
              className="ml-auto h-8"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" /> Add Application
            </Button>
          </div>
          <AddZohoApplication
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onRefresh={fetchRecords}
          />
          {/* <DocumentAttachmentDialog
            open={attachOpen}
            onOpenChange={setAttachOpen}
          /> */}
        </>
      )}
    </div>
  );
}
