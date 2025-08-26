"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status.toLowerCase()) {
    case "completed":
      return (
        <Badge
          className="bg-green-50 text-green-700 border-green-200 flex items-center gap-2 
                          dark:bg-green-900 dark:text-green-300 dark:border-green-800"
        >
          <CheckCircle className="h-3 w-3" />
          Completed
        </Badge>
      );
    case "failed":
      return (
        <Badge
          className="bg-red-50 text-red-700 border-red-200 flex items-center gap-2 
                          dark:bg-red-900 dark:text-red-300 dark:border-red-800"
        >
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    case "pending":
      return (
        <Badge
          className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-2 
                          dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800"
        >
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "active":
      return (
        <Badge
          className="bg-green-50 text-green-700 border-green-200 flex items-center gap-2 
                          dark:bg-green-900 dark:text-green-300 dark:border-green-800"
        >
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge
          className="bg-red-50 text-red-700 border-red-200 flex items-center gap-2 
                          dark:bg-red-900 dark:text-red-300 dark:border-red-800"
        >
          <AlertCircle className="h-3 w-3" />
          Inactive
        </Badge>
      );
    default:
      return (
        <Badge
          className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-2 
                          dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </Badge>
      );
  }
};
