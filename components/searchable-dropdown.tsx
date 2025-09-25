"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronDown, Search, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { zohoProgramsService } from "@/modules/zoho-programs/services/zoho-programs-service";
import { useDebounce } from "@/hooks/use-debounce";
import { User, zohoApplicationsService } from "@/modules";
import { useAuth } from "@/context/AuthContext";

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
  label?: string;
  dependsOn?: {
    field: string;
    value: string | number | null;
  }[];
  renderItem?: (item: DropdownItem) => React.ReactNode;
  disabled?: boolean;
  bottom?: boolean;
}

// Function to fetch data from services based on table name
const fetchTableData = async ({
  table,
  searchTerm,
  searchField,
  page,
  pageSize,
  dependsOn,
  id,
  label,
  userProfile,
}: {
  table: string;
  searchTerm: string;
  searchField: string;
  page: number;
  pageSize: number;
  dependsOn?: { field: string; value: string | number | null }[];
  id?: string;
  label?: string;
  userProfile?: any;
}) => {
  try {
    let data: any[] = [];
    let count = 0;
    let hasMore = false;

    // Fetch data based on table type
    switch (table) {
      case "zoho-universities":
        const allUniversities = await zohoProgramsService.getUniversities(
          searchTerm,
          page,
          pageSize,
          id,
          dependsOn?.[0]
        );

        data = allUniversities;
        count = allUniversities.length;
        hasMore = allUniversities.length >= pageSize;
        break;

      case "zoho-countries":
        const allCountries = await zohoProgramsService.getCountries(
          searchTerm,
          page,
          pageSize,
          id,
          label,
          dependsOn?.[0],
          true,
          true
        );

        data = allCountries;
        count = allCountries.length;
        hasMore = allCountries.length >= pageSize;
        break;

      case "zoho-cities":
        const allCities = await zohoProgramsService.getCities(
          searchTerm,
          page,
          pageSize,
          id,
          dependsOn?.[0]
        );

        data = allCities;
        count = allCities.length;
        hasMore = allCities.length >= pageSize;
        break;

      case "zoho-degrees":
        const allDegrees = await zohoProgramsService.getDegrees(
          searchTerm,
          page,
          pageSize,
          id,
          dependsOn?.[0]
        );

        data = allDegrees;
        count = allDegrees.length;
        hasMore = allDegrees.length >= pageSize;
        break;

      case "zoho-languages":
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
        const allSpecialities = await zohoProgramsService.getSpecialities(
          searchTerm,
          page,
          pageSize,
          id,
          dependsOn?.[0]
        );

        data = allSpecialities;
        count = allSpecialities.length;
        hasMore = allSpecialities.length >= pageSize;
        break;

      case "zoho-faculties":
        const allFaculties = await zohoProgramsService.getFacilities(
          searchTerm,
          page,
          pageSize,
          id,
          dependsOn?.[0]
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
          id,
          dependsOn?.[0]
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
          id,
          dependsOn
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
          id,
          userProfile?.roles?.name || "",
          userProfile?.id || "",
          userProfile?.id || "",
          dependsOn?.[0]
        );
        data = allStudents;
        count = allStudents.length;
        hasMore = allStudents.length >= pageSize;
        break;

      default:
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
  label,
  dependsOn,
  renderItem,
  disabled = false,
  bottom = true,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<DropdownItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState<DropdownItem | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { userProfile } = useAuth();
  const dependsKey = useMemo(
    () => JSON.stringify(dependsOn || []),
    [dependsOn]
  );
  // Load initial data or search results
  const loadData = useCallback(
    async (currentPage = 0, search = "") => {
      setLoading(true);
      try {
        const result = await fetchTableData({
          table,
          searchTerm: search,
          searchField: searchField,
          page: currentPage,
          pageSize: 10,
          dependsOn: dependsOn || [],
          label,
          userProfile,
        });

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
    [table, searchField, dependsKey, label, userProfile]
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
    setHighlightedIndex(-1);
  }, [debouncedSearchTerm, loadData]);

  // Reset list and selection when dependency values change
  useEffect(() => {
    // When dependsOn value changes, clear selection and reload from first page
    if (dependsOn) {
      setSelectedItem(null);
      setItems([]);
      setPage(0);
      setSearchTerm("");
      setInitialLoaded(false);
      loadData(0, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependsKey]);

  // Handle initial value
  useEffect(() => {
    if (initialValue && initialLoaded === false) {
      const found = items.find((item) => item.id === initialValue);

      if (found) {
        setSelectedItem(found);
        setInitialLoaded(true);
      } else {
        const fetchInitialItem = async () => {
          try {
            const result = await fetchTableData({
              table,
              searchTerm: "",
              searchField: "id",
              page: 0,
              pageSize: 1,
              dependsOn: dependsOn || [],
              id: initialValue as string,
              label: "",
              userProfile,
            });

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
  }, [initialValue, items, loading, initialLoaded, table, userProfile]);

  // Handle scroll for pagination
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 5) {
      loadMore();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < items.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < items.length) {
          handleSelect(items[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        break;
    }
  };

  const handleSelect = (item: DropdownItem) => {
    setSelectedItem(item);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
    onSelect(item);
  };

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Custom outside click handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      // Add delay to avoid immediate closing
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn("w-full relative", className)} ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between text-left font-normal bg-transparent"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <span className="truncate text-ellipsis overflow-hidden max-w-[198px]">
          {selectedItem
            ? selectedItem[displayField] +
              " " +
              (selectedItem[displayField2] || "")
            : placeholder}
        </span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md",
            bottom === false && "bottom-[44px]"
          )}
          style={{
            minWidth: "var(--radix-popover-trigger-width)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground">
            {/* Search Input */}
            <div className="flex h-9 items-center gap-2 border-b px-3">
              <Search className="h-4 w-4 shrink-0 opacity-50" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={`Search ${table}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                autoComplete="off"
              />
            </div>

            {/* Items List */}
            <div
              ref={listRef}
              className="max-h-54 scroll-py-1 overflow-x-hidden overflow-y-auto"
              onScroll={handleScroll}
            >
              {/* Empty State */}
              {!loading && items.length === 0 && (
                <div className="py-6 text-center text-sm">No results found</div>
              )}

              {/* Loading State */}
              {loading && items.length === 0 && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">
                    Loading...
                  </span>
                </div>
              )}

              {/* Items */}
              <div className="overflow-hidden p-1">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(item);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "relative flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none cursor-pointer",
                      highlightedIndex === index
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
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
                  </div>
                ))}

                {/* Loading More */}
                {loading && items.length > 0 && (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                )}

                {/* No More Results */}
                {!hasMore && items.length > 0 && (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    No more results
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
