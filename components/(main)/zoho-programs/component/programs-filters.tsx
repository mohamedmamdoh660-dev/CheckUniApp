"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ListFilterPlus, X } from "lucide-react";
import { SearchableDropdown } from "@/components/searchable-dropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClearLocationSelections } from "@/context/SearchableDropdownContext";
import React, { useEffect } from "react";

export interface ProgramsFiltersProps {
  filters: Record<string, string>;
  onFiltersChange: (filters: Record<string, string>) => void;
  clearFilters: boolean;
  setClearFilters: (clearFilters: boolean) => void;
}

export default function ProgramsFilters({
  filters,
  onFiltersChange,
  clearFilters,
  setClearFilters,
}: ProgramsFiltersProps) {
  const [openFilters, setOpenFilters] = React.useState(false);
  const LOCATION = "programs-filters";
  const clearLocationSelections = useClearLocationSelections();
  const [university, setUniversity] = React.useState(filters.university || "");
  const [faculty, setFaculty] = React.useState(filters.faculty || "");
  const [speciality, setSpeciality] = React.useState(filters.speciality || "");
  const [degree, setDegree] = React.useState(filters.degree || "");
  const [country, setCountry] = React.useState(filters.country || "");
  const [city, setCity] = React.useState(filters.city || "");
  const [language, setLanguage] = React.useState(filters.language || "");
  const [active, setActive] = React.useState(filters.active || "");
  const [appsOpen, setAppsOpen] = React.useState(
    filters.active_applications || ""
  );
  const [createdFrom, setCreatedFrom] = React.useState(
    filters.created_from || ""
  );
  const [createdTo, setCreatedTo] = React.useState(filters.created_to || "");

  const activeCount = Object.keys(filters || {}).length;

  useEffect(() => {
    if (clearFilters) {
      setUniversity("");
      setFaculty("");
      setSpeciality("");
      setDegree("");
      setCountry("");
      setCity("");
      setLanguage("");
      setActive("");
      setAppsOpen("");
      setCreatedFrom("");
      setCreatedTo("");
      clearLocationSelections(LOCATION);
      setClearFilters(false);
    }
  }, [clearFilters]);

  return (
    <div className="px-2 flex items-center gap-2">
      <Popover open={openFilters} onOpenChange={setOpenFilters}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <ListFilterPlus className="mr-2 !h-5 !w-5" /> Advanced Filters
            {activeCount > 0 && (
              <Badge className="ml-2 h-5 px-1 text-[10px]" variant="secondary">
                {activeCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[780px] p-4" align="start">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SearchableDropdown
              placeholder="University"
              table="zoho-universities"
              searchField="name"
              displayField="name"
              initialValue={university}
              location={LOCATION}
              onSelect={(it: any) => setUniversity(it?.id || "")}
            />
            <SearchableDropdown
              placeholder="Faculty"
              table="zoho-faculties"
              searchField="name"
              displayField="name"
              initialValue={faculty}
              location={LOCATION}
              onSelect={(it: any) => setFaculty(it?.id || "")}
            />
            <SearchableDropdown
              placeholder="Speciality"
              table="zoho-specialities"
              searchField="name"
              displayField="name"
              initialValue={speciality}
              location={LOCATION}
              onSelect={(it: any) => setSpeciality(it?.id || "")}
            />
            <SearchableDropdown
              placeholder="Degree"
              table="zoho-degrees"
              searchField="name"
              displayField="name"
              initialValue={degree}
              location={LOCATION}
              onSelect={(it: any) => setDegree(it?.id || "")}
            />
            <SearchableDropdown
              placeholder="Country"
              table="zoho-countries"
              label="filter countries"
              searchField="name"
              displayField="name"
              initialValue={country}
              location={LOCATION}
              onSelect={(it: any) => setCountry(it?.id || "")}
            />
            <SearchableDropdown
              placeholder="Language"
              table="zoho-languages"
              searchField="name"
              displayField="name"
              initialValue={language}
              location={LOCATION}
              onSelect={(it: any) => setLanguage(it?.id || "")}
            />
            <Select
              value={active}
              onValueChange={(it: any) =>
                it === "null" ? setActive("") : setActive(it)
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Status (any)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Status (any)</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={appsOpen}
              onValueChange={(it: any) =>
                it === "null" ? setAppsOpen("") : setAppsOpen(it)
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Applications (any)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Applications (any)</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUniversity("");
                setFaculty("");
                setSpeciality("");
                setDegree("");
                setCountry("");
                setCity("");
                setLanguage("");
                setActive("");
                setAppsOpen("");
                setCreatedFrom("");
                setCreatedTo("");
                clearLocationSelections(LOCATION);
                onFiltersChange({});
                setOpenFilters(false);
              }}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const next: Record<string, string> = {
                  university,
                  faculty,
                  speciality,
                  degree,
                  country,
                  city,
                  language,
                  active,
                  active_applications: appsOpen,
                  created_from: createdFrom,
                  created_to: createdTo,
                };
                Object.keys(next).forEach((k) => {
                  if (!next[k]) delete next[k];
                });
                onFiltersChange(next);
                setOpenFilters(false);
              }}
            >
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
