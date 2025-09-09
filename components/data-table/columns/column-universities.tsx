"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ZohoUniversity } from "@/types/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { UniversitiesActions } from "../actions/universities-actions";
import { Globe } from "lucide-react";
import { currentTimezone } from "@/lib/helper/current-timezone";

export const columnsUniversities: ColumnDef<ZohoUniversity>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
          {row.original.sector && (
            <span className="text-xs text-muted-foreground">
              {row.original.sector}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "zoho_countries",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Country" />
    ),
    cell: ({ row }) => {
      const country = row.original.zoho_countries;
      return (
        <div className="flex items-center">
          {country ? country.name : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "zoho_cities",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: ({ row }) => {
      const city = row.original.zoho_cities;
      return (
        <div className="flex items-center">{city ? city.name : "N/A"}</div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          {row.getValue("phone") || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "wesbite",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Website" />
    ),
    cell: ({ row }) => {
      const website = row.getValue("wesbite") as string | undefined;
      return (
        <div className="flex items-center">
          {website ? (
            <a
              href={website.startsWith("http") ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-500 hover:underline"
            >
              <Globe className="h-4 w-4 mr-1" />
              Visit
            </a>
          ) : (
            "N/A"
          )}
        </div>
      );
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
        <div className="flex items-center">{currentTimezone(created_at)}</div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const university = row.original;

      return <UniversitiesActions university={university} />;
    },
  },
];
