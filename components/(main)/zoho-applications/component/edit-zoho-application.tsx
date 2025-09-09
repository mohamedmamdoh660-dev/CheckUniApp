"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { zohoApplicationsService } from "@/modules/zoho-applications/services/zoho-applications-service";
import { updateApplicationViaWebhook } from "@/lib/actions/zoho-applications-actions";
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
import { ZohoApplication } from "@/types/types";

import { ZohoStudent } from "@/types/types";
import { SearchableDropdown } from "@/components/searchable-dropdown";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
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

      // First, call the n8n webhook
      const webhookResponse = await updateApplicationViaWebhook(
        updatedApplicationData
      );

      if (webhookResponse.status) {
        // If webhook was successful, then update in database
        // @ts-ignore
        await zohoApplicationsService.updateApplication(updatedApplicationData);
        toast.success("Application updated successfully");
        if (onOpenChange) onOpenChange(false);
        fetchApplications();
      } else {
        throw new Error(
          webhookResponse.message || "Failed to update application via webhook"
        );
      }
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
                    <SearchableDropdown
                      placeholder="Search Student..."
                      table="zoho-students"
                      searchField="first_name"
                      displayField="first_name"
                      displayField2="last_name"
                      initialValue={field.value?.toString() || ""}
                      onSelect={(item) => {
                        field.onChange(item.id);
                      }}
                      renderItem={(item) => (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={generateNameAvatar(
                                item.first_name + " " + item.last_name
                              )}
                            />
                          </Avatar>
                          <span>
                            {item.first_name} {item.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.email}
                          </span>
                        </div>
                      )}
                    />
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
                    <SearchableDropdown
                      placeholder="Search program..."
                      table="zoho-programs"
                      searchField="name"
                      displayField="name"
                      initialValue={field.value}
                      onSelect={(item) => {
                        field.onChange(item.id);
                      }}
                    />
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
                      <SearchableDropdown
                        placeholder="Search academic year..."
                        table="zoho-academic-years"
                        searchField="name"
                        displayField="name"
                        initialValue={field.value}
                        onSelect={(item) => {
                          field.onChange(item.id);
                        }}
                      />

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
                      <SearchableDropdown
                        placeholder="Search semester..."
                        table="zoho-semesters"
                        searchField="name"
                        displayField="name"
                        initialValue={field.value}
                        onSelect={(item) => {
                          field.onChange(item.id);
                        }}
                      />
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
                      <SearchableDropdown
                        placeholder="Search country..."
                        table="zoho-countries"
                        searchField="name"
                        displayField="name"
                        initialValue={field.value}
                        onSelect={(item: { id: string }) => {
                          field.onChange(item.id);
                          // Reset dependent fields
                          form.setValue("university", "");
                        }}
                      />
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
                      <SearchableDropdown
                        placeholder="Search university..."
                        table="zoho-universities"
                        searchField="name"
                        displayField="name"
                        initialValue={field.value}
                        // dependsOn={{
                        //   field: "country",
                        //   value: form.watch("country") || null
                        // }}
                        disabled={!form.watch("country")}
                        onSelect={(item: { id: string }) => {
                          field.onChange(item.id);
                        }}
                        renderItem={(item: any) => (
                          <div className="flex items-center gap-2">
                            {item.logo && (
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
                            )}
                            <div>
                              <div className="font-medium">{item.name}</div>
                            </div>
                          </div>
                        )}
                      />
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
                      <SearchableDropdown
                        placeholder="Search degree..."
                        table="zoho-degrees"
                        searchField="name"
                        displayField="name"
                        initialValue={field.value}
                        onSelect={(item: { id: string }) => {
                          field.onChange(item.id);
                        }}
                      />
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
