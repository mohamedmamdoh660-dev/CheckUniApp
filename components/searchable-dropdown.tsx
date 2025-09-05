"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Search, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { zohoProgramsService } from "@/modules/zoho-programs/services/zoho-programs-service";
import { useDebounce } from "@/hooks/use-debounce";
import { zohoApplicationsService } from "@/modules";

export interface DropdownItem {
  id: string;
  name: string;
  email?: string;
  logo?: string;
  [key: string]: any;
}

export interface SearchableDropdownProps {
  placeholder?: string;
  table?: string;
  searchField?: string;
  displayField?: string;
  displayField2?: string;
  onSelect: (item: DropdownItem) => void;
  className?: string;
  initialValue?: string;
  dependsOn?: {
    field: string;
    value: string | number | null;
  };
  renderItem?: (item: DropdownItem) => React.ReactNode;
  disabled?: boolean;
}

// Function to fetch data from services based on table name
const fetchTableData = async (
  table: string,
  searchTerm: string,
  searchField: string,
  page: number,
  pageSize = 10,
  dependsOn?: { field: string; value: string | number | null },
  id?: string
) => {
  try {
    let data: any[] = [];
    let count = 0;
    let hasMore = false;

    // Fetch data based on table type
    switch (table) {
      case "zoho-universities":
        // Fetch universities and filter client-side for now
        const allUniversities = await zohoProgramsService.getUniversities(
          searchTerm,
          page,
          pageSize,
          id
        );

        data = allUniversities;
        count = allUniversities.length;
        hasMore = allUniversities.length >= pageSize;
        break;

      case "zoho-countries":
        // Fetch countries and filter client-side for now
        const allCountries = await zohoProgramsService.getCountries(
          searchTerm,
          page,
          pageSize,
          id
        );

        data = allCountries;
        count = allCountries.length;
        hasMore = allCountries.length >= pageSize;
        break;

      case "zoho-cities":
        // Fetch cities and filter client-side for now
        const allCities = await zohoProgramsService.getCities(
          searchTerm,
          page,
          pageSize,
          id
        );

        data = allCities;
        count = allCities.length;
        hasMore = allCities.length >= pageSize;
        break;

      case "zoho-degrees":
        // For now, we'll use the regular getDegrees method and filter client-side
        // This can be updated when a paginated version is available
        const allDegrees = await zohoProgramsService.getDegrees(
          searchTerm,
          page,
          pageSize,
          id
        );

        data = allDegrees;
        count = allDegrees.length;
        hasMore = allDegrees.length >= pageSize;
        break;

      case "zoho-languages":
        // For now, we'll use the regular getLanguages method and filter client-side
        const allLanguages = await zohoProgramsService.getLanguages(
          searchTerm,
          page,
          pageSize,
          id
        );

        data = allLanguages;
        count = allLanguages.length;
        hasMore = allLanguages.length >= pageSize;
        break;

      case "zoho-specialities":
        // For now, we'll use the regular getSpecialities method and filter client-side
        const allSpecialities = await zohoProgramsService.getSpecialities(
          searchTerm,
          page,
          pageSize,
          id
        );

        data = allSpecialities;
        count = allSpecialities.length;
        hasMore = allSpecialities.length >= pageSize;
        break;

      case "zoho-faculties":
        // For now, we'll use the regular getFacilities method and filter client-side
        const allFaculties = await zohoProgramsService.getFacilities(
          searchTerm,
          page,
          pageSize,
          id
        );

        data = allFaculties;
        count = allFaculties.length;
        hasMore = allFaculties.length >= pageSize;
        break;

      case "zoho-academic-years":
        const allAcademicYears = await zohoApplicationsService.getAcademicYears(
          searchTerm,
          page,
          pageSize,
          id
        );
        data = allAcademicYears;
        count = allAcademicYears.length;
        hasMore = allAcademicYears.length >= pageSize;
        break;

      case "zoho-semesters":
        const allSemesters = await zohoApplicationsService.getSemesters(
          searchTerm,
          page,
          pageSize,
          id
        );
        data = allSemesters;
        count = allSemesters.length;
        hasMore = allSemesters.length >= pageSize;
        break;

      case "zoho-programs":
        const allPrograms = await zohoProgramsService.getPrograms(
          searchTerm,
          page,
          pageSize,
          id
        );
        data = allPrograms;
        count = allPrograms.length;
        hasMore = allPrograms.length >= pageSize;
        break;

      case "zoho-students":
        const allStudents = await zohoApplicationsService.getStudents(
          searchTerm,
          page,
          pageSize,
          id
        );
        data = allStudents;
        count = allStudents.length;
        hasMore = allStudents.length >= pageSize;
        break;

      default:
        // Fallback to mock data for testing or unknown tables
        console.warn(
          `No service method defined for table: ${table}, using mock data`
        );
    }

    // Convert to DropdownItem format
    const items: DropdownItem[] = data.map((item) => ({
      id: item.id,
      name: item.name || "",
      ...item,
    }));

    return {
      data: items,
      count,
      hasMore,
    };
  } catch (error) {
    console.error(`Error fetching data for table ${table}:`, error);
    return { data: [], count: 0, hasMore: false };
  }
};

export function SearchableDropdown({
  placeholder = "Search...",
  table = "users",
  searchField = "name",
  displayField = "name",
  displayField2 = "email",
  onSelect,
  className,
  initialValue,
  dependsOn,
  renderItem,
  disabled = false,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<DropdownItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState<DropdownItem | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Load initial data or search results
  const loadData = useCallback(
    async (currentPage = 0, search = "") => {
      setLoading(true);
      try {
        const result = await fetchTableData(
          table,
          search,
          searchField,
          currentPage,
          10,
          dependsOn
        );

        if (currentPage === 0) {
          setItems(result.data);
          setPage(0);
        } else {
          setItems((prev) => [...prev, ...result.data]);
        }

        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    },
    [table, searchField, dependsOn]
  );

  // Load more data when scrolling to bottom
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(page + 1);
      loadData(page + 1, searchTerm);
    }
  };

  useEffect(() => {
    loadData(0, debouncedSearchTerm);
  }, [debouncedSearchTerm, loadData]);

  // Handle initial value
  useEffect(() => {
    if (initialValue && initialLoaded === false) {
      // Find the item with the matching id in the loaded items
      const found = items.find((item) => item.id === initialValue);

      if (found) {
        setSelectedItem(found);
        setInitialLoaded(true);
      } else {
        // If we've loaded items but didn't find a match, try to fetch the specific item
        const fetchInitialItem = async () => {
          try {
            // This is a simplified approach - in a real app, you might need a specific API call
            // to fetch a single item by ID
            const result = await fetchTableData(
              table,
              "", // No search term
              "id", // Search by ID
              0, // First page
              1, // Just need one item
              { field: "id", value: initialValue },
              initialValue as string
            );

            if (result.data.length > 0) {
              setSelectedItem(result.data[0]);
            }
          } catch (error) {
            console.error("Error fetching initial item:", error);
          }
          setInitialLoaded(true);
        };

        fetchInitialItem();
      }
    }
  }, [initialValue, items, loading, initialLoaded, table]);

  // Handle scroll for pagination
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 5) {
      loadMore();
    }
  };

  const handleSelect = (item: DropdownItem) => {
    setSelectedItem(item);
    setIsOpen(false);
    setSearchTerm("");
    onSelect(item);
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between text-left font-normal bg-transparent"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedItem
                ? selectedItem[displayField] +
                  " " +
                  (selectedItem[displayField2] || "")
                : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          sideOffset={4}
          style={{
            width: "var(--radix-popover-trigger-width)",
            pointerEvents: "auto",
          }}
        >
          <Command className="w-full">
            <CommandInput
              placeholder={`Search ${table}...`}
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="h-9 pointer-events-auto"
              autoFocus
            />
            <CommandList className="max-h-60" onScroll={handleScroll}>
              <CommandEmpty>
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                ) : (
                  "No results found"
                )}
              </CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSelect(item)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center w-full">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedItem?.id === item.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        {renderItem ? (
                          renderItem(item)
                        ) : (
                          <>
                            <div className="font-medium">
                              {item[displayField]}
                            </div>
                            {item.email && (
                              <div className="text-sm text-muted-foreground">
                                {item.email}
                              </div>
                            )}
                            {item.category && (
                              <div className="text-sm text-muted-foreground">
                                {item.category}
                              </div>
                            )}
                            {item.logo && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-5 h-5 relative overflow-hidden rounded-full bg-muted">
                                  <div className="w-full h-full">
                                    {typeof item.logo === "string" &&
                                      item.logo.startsWith("http") && (
                                        <div
                                          className="w-full h-full bg-cover bg-center"
                                          style={{
                                            backgroundImage: `url(${item.logo})`,
                                          }}
                                        />
                                      )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
                {loading && (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                )}
                {!hasMore && items.length > 0 && (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    No more results
                  </div>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
