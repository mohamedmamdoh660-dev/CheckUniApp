import React from "react";
import { Skeleton } from "../ui/skeleton";

const DataTableSkeleton = ({ type }: { type: string }) => {
  return (
    <div className="animate-pulse w-full mb-4">
      {[...Array(type === "selections" ? 5 : 10)].map((_, i) => (
        <div key={i} className="p-2 align-middle h-[41px] relative border-b border-border">
          <Skeleton className="h-[20px] w-[97%] rounded-sm absolute bg-primary/10" />
        </div>
      ))}
    </div>
  );
};

export default DataTableSkeleton;
