"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { zohoApplicationsService } from "@/modules/zoho-applications/services/zoho-applications-service";
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
import {
  ZohoAcademicYear,
  ZohoApplication,
  ZohoSemester,
} from "@/modules/zoho-applications/models/zoho-application";
import {
  ZohoCountry,
  ZohoDegree,
  ZohoProgram,
  ZohoUniversity,
} from "@/modules/zoho-programs/models/zoho-program";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ZohoStudent } from "@/modules/zoho-students/models/zoho-student";
import { generateNameAvatar } from "@/utils/generateRandomAvatar";

// Define form validation schema
const formSchema = z.object({
  student: z.string().min(1, "Student is required"),
  program: z.string().min(1, "Program is required"),
  acdamic_year: z.string().optional(),
  semester: z.string().optional(),
  country: z.string().optional(),
  university: z.string().optional(),
  stage: z.string(),
  degree: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

interface EditZohoApplicationProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  applicationData?: ZohoApplication;
  fetchApplications: () => void;
}

export default function EditZohoApplication({
  open = false,
  onOpenChange,
  applicationData,
  fetchApplications,
}: EditZohoApplicationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<ZohoStudent[]>([]);
  const [programs, setPrograms] = useState<ZohoProgram[]>([]);
  const [academicYears, setAcademicYears] = useState<ZohoAcademicYear[]>([]);
  const [semesters, setSemesters] = useState<ZohoSemester[]>([]);
  const [countries, setCountries] = useState<ZohoCountry[]>([]);
  const [universities, setUniversities] = useState<ZohoUniversity[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<
    ZohoUniversity[]
  >([]);
  const [degrees, setDegrees] = useState<ZohoDegree[]>([]);

  // Initialize form
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student: applicationData?.student?.toString() || "",
      program: applicationData?.program?.toString() || "",
      acdamic_year: applicationData?.acdamic_year?.toString() || "",
      semester: applicationData?.semester?.toString() || "",
      country: applicationData?.country?.toString() || "",
      university: applicationData?.university?.toString() || "",
      stage: applicationData?.stage || "pending",
      degree: applicationData?.degree?.toString() || "",
    },
  });

  // Fetch reference data
  useEffect(() => {
    if (open) {
      const fetchReferenceData = async () => {
        try {
          const [
            studentsData,
            programsData,
            academicYearsData,
            semestersData,
            countriesData,
            universitiesData,
            degreesData,
          ] = await Promise.all([
            zohoApplicationsService.getStudents(),
            zohoProgramsService.getPrograms(),
            zohoApplicationsService.getAcademicYears(),
            zohoApplicationsService.getSemesters(),
            zohoProgramsService.getCountries(),
            zohoProgramsService.getUniversities(),
            zohoProgramsService.getDegrees(),
          ]);

          setStudents(studentsData);
          setPrograms(programsData);
          setAcademicYears(academicYearsData);
          setSemesters(semestersData);
          setCountries(countriesData);
          setUniversities(universitiesData);
          setDegrees(degreesData);
        } catch (error) {
          console.error("Error fetching reference data:", error);
          toast.error("Failed to load reference data");
        }
      };

      fetchReferenceData();
    }
  }, [open]);

  // Reset form when applicationData changes
  useEffect(() => {
    if (applicationData) {
      form.reset({
        student: applicationData.student?.toString() || "",
        program: applicationData.program?.toString() || "",
        acdamic_year: applicationData.acdamic_year?.toString() || "",
        semester: applicationData.semester?.toString() || "",
        country: applicationData.country?.toString() || "",
        university: applicationData.university?.toString() || "",
        stage: applicationData.stage || "pending",
        degree: applicationData.degree?.toString() || "",
      });
    }
  }, [applicationData, form]);

  // Handler for saving changes
  const onSubmit = async (values: FormSchema) => {
    if (!applicationData) return;

    setIsLoading(true);
    try {
      // Update application
      const updatedApplicationData = {
        id: applicationData.id,
        student: values.student || null,
        program: values.program || null,
        acdamic_year: values.acdamic_year || null,
        semester: values.semester || null,
        country: values.country || null,
        university: values.university || null,
        stage: values.stage,
        degree: values.degree || null,
      };

      // @ts-ignore
      await zohoApplicationsService.updateApplication(updatedApplicationData);
      toast.success("Application updated successfully");
      if (onOpenChange) onOpenChange(false);
      fetchApplications();
    } catch (error) {
      console.error("Error saving application data:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update application"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Application stage options
  const stageOptions = ["pending", "processing", "completed", "failed"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] pb-2 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Application</DialogTitle>
        </DialogHeader>
        <div className="">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="student"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Student*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student) => {
                          const fullName =
                            `${student.first_name || ""} ${student.last_name || ""}`.trim();
                          const initials =
                            `${student.first_name?.[0] || ""}${student.last_name?.[0] || ""}`.toUpperCase();

                          return (
                            <SelectItem key={student.id} value={student.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={generateNameAvatar(fullName)}
                                  />
                                </Avatar>
                                <span>{fullName}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="program"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Program*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
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
                  name="acdamic_year"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Academic Year</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem key={year.id} value={year.id}>
                              {year.name}
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
                  name="semester"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Semester</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {semesters.map((semester) => (
                            <SelectItem key={semester.id} value={semester.id}>
                              {semester.name}
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
                  name="university"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>University</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        // disabled={!form.watch("country")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select university" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {universities.map((university) => (
                            <SelectItem
                              key={university.id}
                              value={university.id}
                            >
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
                  name="stage"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Stage</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stageOptions.map((stage) => (
                            <SelectItem key={stage} value={stage}>
                              {stage.charAt(0).toUpperCase() + stage.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
