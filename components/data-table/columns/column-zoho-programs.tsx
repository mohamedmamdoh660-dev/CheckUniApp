"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table-column-header";
import { ZohoProgramsTableRowActions } from "../actions/zoho-programs-actions";
import { Badge } from "@/components/ui/badge";
import { currentTimezone } from "@/lib/helper/current-timezone";
import { ZohoProgram } from "@/types/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export function getZohoProgramsColumns(
  fetchPrograms: () => void,
  router?: any
): ColumnDef<ZohoProgram>[] {
  const columns: ColumnDef<ZohoProgram, unknown>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Program Name" />
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
      accessorKey: "university",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="University" />
      ),
      cell: ({ row }) => {
        const university = row.original.zoho_universities;

        return (
          <div className="flex items-center gap-2">
            {/* {university?.logo && (
              <div className="w-8 h-8 relative overflow-hidden rounded-full">
                <Image
                  src={generateNameAvatar(university?.name || "")}
                  alt={university?.name || "University"}
                  fill
                  className="object-cover"
                />
              </div>
            )} */}
            <div className="text-left">{university?.name}</div>
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
          <div className="text-left">{row.original.zoho_faculty?.name}</div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: "speciality",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Speciality" />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-left">{row.original.zoho_speciality?.name}</div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: "degree",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Degree" />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-left">{row.original.zoho_degrees?.name}</div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => {
        const city = row.original.zoho_cities?.name;
        const country = row.original.zoho_countries?.name;

        return (
          <div className="text-left">
            {city && country ? (
              <span>
                {city}, {country}
              </span>
            ) : city ? (
              <span>{city}</span>
            ) : country ? (
              <span>{country}</span>
            ) : (
              <span>-</span>
            )}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: "language",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Language" />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-left">{row.original.zoho_languages?.name}</div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: "tuition",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tuition" />
      ),
      cell: ({ row }) => {
        const currency = row.original.tuition_currency || "";
        const tuition = row.original.official_tuition || "-";
        const discounted = row.original.discounted_tuition;

        return (
          <div className="text-left">
            <div>{`${tuition} ${currency}`}</div>
            {discounted && (
              <div className="text-xs text-green-600">{`Discounted: ${discounted} ${currency}`}</div>
            )}
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
      accessorKey: "active_applications",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Applications" />
      ),
      cell: ({ row }) => {
        return row.original.active_applications ? (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            Open
          </Badge>
        ) : (
          <Badge className="bg-gray-50 text-gray-700 border-gray-200">
            Closed
          </Badge>
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
            {currentTimezone(created)}
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
        <div className="flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Info
                className="!h-6 !w-6 hover:cursor-pointer hover:text-primary"
                onClick={() => router?.push(`/programs/${row.original.id}`)}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>View Details</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  return columns;
}
