"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zohoProgramsService } from "@/modules/zoho-programs/services/zoho-programs-service";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ZohoCity,
  ZohoCountry,
  ZohoDegree,
  Zohofaculty,
  ZohoLanguage,
  ZohoProgram,
  ZohoSpeciality,
  ZohoUniversity,
} from "@/modules/zoho-programs/models/zoho-program";
import Image from "next/image";

// Define form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  faculty: z.string().optional(),
  speciality: z.string().optional(),
  degree: z.string().optional(),
  language: z.string().optional(),
  university: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  official_tuition: z.string().optional(),
  discounted_tuition: z.string().optional(),
  tuition_currency: z.string().optional(),
  active: z.boolean(),
  active_applications: z.boolean(),
  study_years: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

interface EditZohoProgramProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  programData?: ZohoProgram;
  fetchPrograms: () => void;
}

export default function EditZohoProgram({
  open = false,
  onOpenChange,
  programData,
  fetchPrograms,
}: EditZohoProgramProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<ZohoCountry[]>([]);
  const [cities, setCities] = useState<ZohoCity[]>([]);
  const [filteredCities, setFilteredCities] = useState<ZohoCity[]>([]);
  const [universities, setUniversities] = useState<ZohoUniversity[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<
    ZohoUniversity[]
  >([]);
  const [degrees, setDegrees] = useState<ZohoDegree[]>([]);
  const [facilities, setFacilities] = useState<Zohofaculty[]>([]);
  const [languages, setLanguages] = useState<ZohoLanguage[]>([]);
  const [specialities, setSpecialities] = useState<ZohoSpeciality[]>([]);
  const [filteredSpecialities, setFilteredSpecialities] = useState<
    ZohoSpeciality[]
  >([]);

  // Initialize form
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: programData?.name || "",
      faculty: programData?.faculty?.toString() || "",
      speciality: programData?.speciality?.toString() || "",
      degree: programData?.degree?.toString() || "",
      language: programData?.language?.toString() || "",
      university: programData?.university?.toString() || "",
      city: programData?.city?.toString() || "",
      country: programData?.country?.toString() || "",
      official_tuition: programData?.official_tuition || "",
      discounted_tuition: programData?.discounted_tuition || "",
      tuition_currency: programData?.tuition_currency || "",
      active: programData?.active || false,
      active_applications: programData?.active_applications || false,
      study_years: programData?.study_years || "",
    },
  });

  // Fetch reference data
  useEffect(() => {
    if (open) {
      const fetchReferenceData = async () => {
        try {
          const [
            countriesData,
            citiesData,
            universitiesData,
            degreesData,
            facilitiesData,
            languagesData,
            specialitiesData,
          ] = await Promise.all([
            zohoProgramsService.getCountries(),
            zohoProgramsService.getCities(),
            zohoProgramsService.getUniversities(),
            zohoProgramsService.getDegrees(),
            zohoProgramsService.getFacilities(),
            zohoProgramsService.getLanguages(),
            zohoProgramsService.getSpecialities(),
          ]);

          setCountries(countriesData);
          setCities(citiesData);
          setUniversities(universitiesData);
          setDegrees(degreesData);
          setFacilities(facilitiesData);
          setLanguages(languagesData);
          setSpecialities(specialitiesData);
        } catch (error) {
          console.error("Error fetching reference data:", error);
          toast.error("Failed to load reference data");
        }
      };

      fetchReferenceData();
    }
  }, [open]);

  // Reset form when programData changes
  useEffect(() => {
    if (programData) {
      form.reset({
        name: programData.name || "",
        faculty: programData.faculty?.toString() || "",
        speciality: programData.speciality?.toString() || "",
        degree: programData.degree?.toString() || "",
        language: programData.language?.toString() || "",
        university: programData.university?.toString() || "",
        city: programData.city?.toString() || "",
        country: programData.country?.toString() || "",
        official_tuition: programData.official_tuition || "",
        discounted_tuition: programData.discounted_tuition || "",
        tuition_currency: programData.tuition_currency || "",
        active: programData.active || false,
        active_applications: programData.active_applications || false,
        study_years: programData.study_years || "",
      });
    }
  }, [programData, form]);

  // Filter specialities based on selected faculty
  useEffect(() => {
    const facultyId = form.watch("faculty");
    if (facultyId) {
      const filtered = specialities.filter(
        (spec) => spec.faculty_id === parseInt(facultyId)
      );
      setFilteredSpecialities(filtered);
    } else {
      setFilteredSpecialities(specialities);
    }
  }, [form.watch("faculty"), specialities]);

  // Filter cities based on selected country
  useEffect(() => {
    const countryId = form.watch("country");
    if (countryId) {
      const filtered = cities.filter(
        (city) => city.country === parseInt(countryId)
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [form.watch("country"), cities]);

  // Filter universities based on selected city and country
  useEffect(() => {
    const cityId = form.watch("city");
    const countryId = form.watch("country");

    if (cityId) {
      const filtered = universities.filter(
        (uni) => uni.city === parseInt(cityId)
      );
      setFilteredUniversities(filtered);
    } else if (countryId) {
      const filtered = universities.filter(
        (uni) => uni.country === parseInt(countryId)
      );
      setFilteredUniversities(filtered);
    } else {
      setFilteredUniversities(universities);
    }
  }, [form.watch("city"), form.watch("country"), universities]);

  // Handler for saving changes
  const onSubmit = async (values: FormSchema) => {
    if (!programData) return;

    setIsLoading(true);
    try {
      // Update program
      const updatedProgramData = {
        id: programData.id,
        name: values.name,
        faculty: values.faculty ? parseInt(values.faculty) : undefined,
        speciality: values.speciality ? parseInt(values.speciality) : undefined,
        degree: values.degree ? parseInt(values.degree) : undefined,
        language: values.language ? parseInt(values.language) : undefined,
        university: values.university ? parseInt(values.university) : undefined,
        city: values.city ? parseInt(values.city) : undefined,
        country: values.country ? parseInt(values.country) : undefined,
        official_tuition: values.official_tuition,
        discounted_tuition: values.discounted_tuition,
        tuition_currency: values.tuition_currency,
        active: values.active,
        active_applications: values.active_applications,
        study_years: values.study_years,
      };

      await zohoProgramsService.updateProgram(updatedProgramData);
      toast.success("Program updated successfully");
      if (onOpenChange) onOpenChange(false);
      fetchPrograms();
    } catch (error) {
      console.error("Error saving program data:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update program"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Currency options
  const currencies = ["USD", "EUR", "GBP", "AED"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Program</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[80vh]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Program Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter program name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>City</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={!form.watch("country")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCities.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>University</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!form.watch("country")}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select university" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredUniversities.map((university) => (
                          <SelectItem key={university.id} value={university.id}>
                            <div className="flex items-center gap-2">
                              {university.logo && (
                                <div className="w-5 h-5 relative overflow-hidden rounded-full">
                                  <Image
                                    src={university.logo}
                                    alt={university.name || ""}
                                    width={20}
                                    height={20}
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <span>{university.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="faculty"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Faculty</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select faculty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {facilities.map((faculty) => (
                            <SelectItem key={faculty.id} value={faculty.id}>
                              {faculty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="speciality"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Speciality</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={!form.watch("faculty")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select speciality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredSpecialities.map((speciality) => (
                            <SelectItem
                              key={speciality.id}
                              value={speciality.id}
                            >
                              {speciality.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Degree</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select degree" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {degrees.map((degree) => (
                            <SelectItem key={degree.id} value={degree.id}>
                              {degree.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages.map((language) => (
                            <SelectItem key={language.id} value={language.id}>
                              {language.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="study_years"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Study Years</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 4 years" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="official_tuition"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Official Tuition</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 10000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discounted_tuition"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Discounted Tuition</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 8500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tuition_currency"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Program Active</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active_applications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Applications Open</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange?.(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
