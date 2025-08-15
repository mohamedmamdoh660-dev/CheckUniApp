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
        <Badge className="bg-green-50 text-green-700 border-green-200 flex items-center gap-2">
          <CheckCircle className="h-3 w-3" />
          Completed
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 flex items-center gap-2">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-2">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "active":
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 flex items-center gap-2">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 flex items-center gap-2">
          <AlertCircle className="h-3 w-3" />
          Inactive
        </Badge>
      );
    default:
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </Badge>
      );
  }
};
