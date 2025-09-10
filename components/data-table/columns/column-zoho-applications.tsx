"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table-column-header";
import { currentTimezone } from "@/lib/helper/current-timezone";
import { ZohoApplication } from "@/types/types";
import { StatusBadge } from "@/components/ui/status-badge";
import Image from "next/image";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { generateNameAvatar } from "@/utils/generateRandomAvatar";
import { ZohoApplicationsTableRowActions } from "../actions/zoho-applications-actions";

export function getZohoApplicationsColumns(
  fetchApplications: () => void
): ColumnDef<ZohoApplication>[] {
  const columns: ColumnDef<ZohoApplication, unknown>[] = [
    {
      accessorKey: "student",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student" />
      ),
      cell: ({ row }) => {
        const student = row.original.zoho_students;
        const fullName = student
          ? `${student.first_name || ""} ${student.last_name || ""}`.trim()
          : "-";
        const initials = student
          ? `${student.first_name?.[0] || ""}${student.last_name?.[0] || ""}`.toUpperCase()
          : "";

        return (
          <div className="flex items-center w-full">
            <Avatar className="border-foreground/10 border-[1px]">
              <AvatarImage src={generateNameAvatar(fullName)} />
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight ml-3">
              <span className=" font-semibold">{fullName}</span>
              <span className=" text-xs text-muted-foreground">
                {student?.email || "-"}
              </span>
            </div>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: "program",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Program" />
      ),
      cell: ({ row }) => {
        const program = row.original.zoho_programs;

        return (
          <div className="text-left">
            {program?.name ||
              (row.original.program ? `ID: ${row.original.program}` : "-")}
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
            {university?.logo && (
              <div className="w-8 h-8 relative overflow-hidden rounded-full">
                <Image
                  src={university.logo}
                  alt={university?.name || "University"}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="text-left">
              {university?.name ||
                (row.original.university
                  ? `ID: ${row.original.university}`
                  : "-")}
            </div>
          </div>
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
          <div className="text-left">
            {row.original.zoho_degrees?.name ||
              (row.original.degree ? `ID: ${row.original.degree}` : "-")}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: "academic",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Academic Year/Semester" />
      ),
      cell: ({ row }) => {
        const academicYear = row.original.zoho_academic_years?.name;
        const semester = row.original.zoho_semesters?.name;

        return (
          <div className="text-left">
            {academicYear || "-"} / {semester || "-"}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: "country",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Country" />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-left">
            {row.original.zoho_countries?.name ||
              (row.original.country ? `ID: ${row.original.country}` : "-")}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: "stage",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stage" />
      ),
      cell: ({ row }) => {
        const stage = row.original.stage?.toLowerCase() || "";

        if (stage === "completed") {
          return <StatusBadge status="completed" />;
        } else if (stage === "pending") {
          return <StatusBadge status="pending" />;
        } else if (stage === "processing") {
          return <StatusBadge status="processing" />;
        } else if (stage === "failed") {
          return <StatusBadge status="failed" />;
        } else {
          return <div className="text-left">{row.original.stage || "-"}</div>;
        }
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "agent",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Agent" />
      ),
      cell: ({ row }) => {
        const agent = row.original.agent;
        const fullName =
          `${agent?.first_name || ""} ${agent?.last_name || ""}`.trim();

        return (
          <div className="flex items-center w-full">
            <Avatar className="border-foreground/10 border-[1px]">
              <AvatarImage
                src={
                  agent?.profile?.includes("http")
                    ? agent.profile
                    : generateNameAvatar(fullName)
                }
              />
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight ml-3">
              <span className=" font-semibold">{fullName}</span>
              <span className=" text-xs text-muted-foreground">
                {agent?.email || "-"}
              </span>
            </div>
          </div>
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
        <div className="text-center">
          <ZohoApplicationsTableRowActions
            row={row}
            fetchApplications={fetchApplications}
          />
        </div>
      ),
    },
  ];

  return columns;
}
