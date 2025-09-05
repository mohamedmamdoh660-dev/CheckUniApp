"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table-column-header";
import { currentTimezone } from "@/lib/helper/current-timezone";
import { ZohoSpeciality } from "@/modules/zoho-speciality/models/zoho-speciality";
import { StatusBadge } from "@/components/ui/status-badge";
import { ZohoSpecialityTableRowActions } from "../actions/zoho-speciality-actions";

export function getZohoSpecialityColumns(
  fetchSpecialities: () => void
): ColumnDef<ZohoSpeciality>[] {
  const columns: ColumnDef<ZohoSpeciality, unknown>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Speciality Name" />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-left font-medium">
            {row.original.name || "-"}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: "faculty",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Faculty" />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-left">
            {row.original.zoho_faculty?.name || "-"}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: "active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        return row.original.active ? (
          <StatusBadge status="active" />
        ) : (
          <StatusBadge status="inactive" />
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const created = row.original.created_at;
        return (
          <div className="text-left overflow-hidden whitespace-nowrap">
            {created
              ? currentTimezone(created)?.toLocaleString()?.replace("GMT", "")
              : "-"}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <ZohoSpecialityTableRowActions
            row={row}
            fetchSpecialities={fetchSpecialities}
          />
        </div>
      ),
    },
  ];

  return columns;
}
