"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table-column-header";
import { currentTimezone } from "@/lib/helper/current-timezone";
import { ZohoApplication } from "@/types/types";
import Image from "next/image";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { generateNameAvatar } from "@/utils/generateRandomAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DownloadIcon, Info } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  conditionalButtonDisabled,
  finalAcceptanceButtonDisabled,
} from "@/components/(main)/zoho-applications/component/stages-conditions";

export function getZohoApplicationsColumns(
  fetchApplications: () => void,
  router: any
): ColumnDef<ZohoApplication>[] {
  const columns: ColumnDef<ZohoApplication, unknown>[] = [
    {
      accessorKey: "application_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Application" />
      ),
      cell: ({ row }) => {
        const applicationName = row.original.application_name;
        const student = row.original.zoho_students;
        const fullName =
          `${student?.first_name || ""} ${student?.last_name || ""}`.trim();

        return (
          <div className="flex items-center w-full">
            <Avatar className="border-foreground/10 border-[1px]">
              <AvatarImage
                src={student?.photo_url || generateNameAvatar(fullName)}
              />
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight ml-3">
              <span className="font-semibold">{applicationName}</span>
              <span className="text-xs text-muted-foreground ">
                {fullName || "-"}
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
        const stage = row.original.stage || "";

        return (
          <Badge variant="outline" className="capitalize text-[12px]">
            {stage}
          </Badge>
        );
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
      accessorKey: "download_conditional",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Download Conditional" />
      ),
      cell: ({ row }) => {
        const disabled = conditionalButtonDisabled(
          row?.original?.stage?.toLowerCase() || ""
        );
        const handleClick = async (btn: HTMLButtonElement) => {
          if (disabled) return;
          try {
            btn.disabled = true;
            const icon = btn.querySelector("svg");
            if (icon) icon.classList.add("hidden");
            const spinner = document.createElement("span");
            spinner.className = "mr-1 inline-flex";
            spinner.innerHTML = `<svg class=\"h-4 w-4 animate-spin\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle><path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h3z\"></path></svg>`;
            btn.insertBefore(spinner, btn.firstChild);
            const url = `/api/attachments/download?record_id=${encodeURIComponent(
              row.original.id
            )}&type=${encodeURIComponent("Conditional Acceptance.pdf")}`;
            const res = await fetch(url);
            if (!res.ok) {
              const err = await res.json().catch(() => ({}) as any);
              throw new Error(err?.error || `Download failed (${res.status})`);
            }
            const blob = await res.blob();
            const link = document.createElement("a");
            const objectUrl = URL.createObjectURL(blob);
            link.href = objectUrl;
            link.download = "Conditional Acceptance.pdf";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(objectUrl);
          } catch (e: any) {
            toast.error(e?.message || "Download failed");
          } finally {
            btn.disabled = false;
            const spinner = btn.querySelector("span");
            if (spinner) spinner.remove();
            const icon = btn.querySelector("svg.hidden");
            if (icon) icon.classList.remove("hidden");
          }
        };
        return (
          <div className="text-left overflow-hidden whitespace-nowrap">
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={(e) => handleClick(e.currentTarget)}
            >
              <DownloadIcon className="mr-1 h-4 w-4" />
              Download Conditional
            </Button>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },

    {
      accessorKey: "final_acceptance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Final Acceptance" />
      ),
      cell: ({ row }) => {
        const disabled = finalAcceptanceButtonDisabled(
          row?.original?.stage?.toLowerCase() || ""
        );
        const handleClick = async (btn: HTMLButtonElement) => {
          if (disabled) return;
          try {
            btn.disabled = true;
            const icon = btn.querySelector("svg");
            if (icon) icon.classList.add("hidden");
            const spinner = document.createElement("span");
            spinner.className = "mr-1 inline-flex";
            spinner.innerHTML = `<svg class=\"h-4 w-4 animate-spin\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle><path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h3z\"></path></svg>`;
            btn.insertBefore(spinner, btn.firstChild);
            const url = `/api/attachments/download?record_id=${encodeURIComponent(
              row.original.id
            )}&type=${encodeURIComponent("Final Acceptance.pdf")}`;
            const res = await fetch(url);
            if (!res.ok) {
              const err = await res.json().catch(() => ({}) as any);
              throw new Error(err?.error || `Download failed (${res.status})`);
            }
            const blob = await res.blob();
            const link = document.createElement("a");
            const objectUrl = URL.createObjectURL(blob);
            link.href = objectUrl;
            link.download = "Final Acceptance.pdf";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(objectUrl);
          } catch (e: any) {
            toast.error(e?.message || "Download failed");
          } finally {
            btn.disabled = false;
            const spinner = btn.querySelector("span");
            if (spinner) spinner.remove();
            const icon = btn.querySelector("svg.hidden");
            if (icon) icon.classList.remove("hidden");
          }
        };
        return (
          <div className="text-left overflow-hidden whitespace-nowrap">
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={(e) => handleClick(e.currentTarget)}
            >
              <DownloadIcon className="mr-1 h-4 w-4" />
              Download Final Acceptance
            </Button>
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
                onClick={() => router.push(`/applications/${row.original.id}`)}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>View Details</p>
            </TooltipContent>
          </Tooltip>
          {/* <ZohoApplicationsTableRowActions
            row={row}
            fetchApplications={fetchApplications}
          /> */}
        </div>
      ),
    },
  ];

  return columns;
}
