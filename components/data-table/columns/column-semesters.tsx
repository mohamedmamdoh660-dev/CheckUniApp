"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Semester } from "@/modules/semesters/models/semester";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { SemestersActions } from "../actions/semesters-actions";
import { StatusBadge } from "@/components/ui/status-badge";

export const columnsSemesters: ColumnDef<Semester>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("active");

      return (
        <div className="flex w-[100px] items-center">
          {isActive ? (
            <StatusBadge status="active" />
          ) : (
            <StatusBadge status="inactive" />
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const created_at = row.getValue("created_at") as string;
      if (!created_at) return null;

      return (
        <div className="flex items-center">
          {format(new Date(created_at), "MMM d, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const semester = row.original;

      return <SemestersActions semester={semester} />;
    },
  },
];
