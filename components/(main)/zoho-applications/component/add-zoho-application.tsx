"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zohoApplicationsService } from "@/modules/zoho-applications/services/zoho-applications-service";
import { zohoProgramsService } from "@/modules/zoho-programs/services/zoho-programs-service";
import { createApplicationViaWebhook } from "@/lib/actions/zoho-applications-actions";
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

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { generateNameAvatar } from "@/utils/generateRandomAvatar";
import { SearchableDropdown } from "@/components/searchable-dropdown";
import { useAuth } from "@/context/AuthContext";

// Define form validation schema
const formSchema = z.object({
  student: z.string().min(1, "Student is required"),
  program: z.string().min(1, "Program is required"),
  stage: z.string(),
  acdamic_year: z.string().optional(),
  semester: z.string().optional(),
  country: z.string().optional(),
  university: z.string().optional(),
  degree: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

interface AddZohoApplicationProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRefresh?: () => void;
}

export default function AddZohoApplication({
  open = false,
  onOpenChange,
  onRefresh,
}: AddZohoApplicationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { userProfile } = useAuth();

  // Initialize form
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student: "",
      program: "",
      stage: "pending review",
      acdamic_year: "",
      semester: "",
      country: "",
      university: "",
      degree: "",
    },
  });

  // Handler for creating application
  const onSubmit = async (values: FormSchema) => {
    setIsLoading(true);

    try {
      // Create application
      const applicationData = {
        student: values.student || null,
        program: values.program || null,
        acdamic_year: values.acdamic_year || null,
        semester: values.semester || null,
        country: values.country || null,
        university: values.university || null,
        degree: values.degree || null,
        user_id: userProfile?.id,
        agency_id:
          userProfile?.roles?.name === "agent"
            ? userProfile?.id
            : userProfile?.roles?.name === "admin"
              ? null
              : userProfile?.agency_id,
      };

      // First, call the n8n webhook
      const webhookResponse = await createApplicationViaWebhook({
        ...applicationData,
        crm_id: userProfile?.crm_id || userProfile?.agency?.crm_id || "",
      });

      if (webhookResponse.status) {
        // If webhook was successful, then create in database with the ID from webhook
        const applicationDataWithId = {
          ...applicationData,
          id: webhookResponse.id,
          stage: "pending review",
        };

        // @ts-ignore
        await zohoApplicationsService.createApplication(applicationDataWithId);
        toast.success("Application created successfully");

        // Close dialog and refresh application list
        if (onOpenChange) onOpenChange(false);
        if (onRefresh) onRefresh();
      } else {
        throw new Error(
          webhookResponse.message || "Failed to create application via webhook"
        );
      }
    } catch (error) {
      console.error("Error creating application:", error);
      toast.error("Failed to create application");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] pb-2 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Application</DialogTitle>
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
                      placeholder="Select Student..."
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
                      placeholder="Select Program..."
                      table="zoho-programs"
                      searchField="name"
                      displayField="name"
                      initialValue={field.value?.toString() || ""}
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
                        placeholder="Select academic year..."
                        table="zoho-academic-years"
                        searchField="name"
                        displayField="name"
                        bottom={false}
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
                        placeholder="Select semester..."
                        table="zoho-semesters"
                        searchField="name"
                        displayField="name"
                        bottom={false}
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
                        placeholder="Select country..."
                        table="zoho-countries"
                        searchField="name"
                        displayField="name"
                        initialValue={field.value}
                        bottom={false}
                        onSelect={(item: { id: string }) => {
                          field.onChange(item.id);
                          // Reset dependent fields
                          // form.setValue("university", "");
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
                        placeholder="Select university..."
                        table="zoho-universities"
                        searchField="name"
                        displayField="name"
                        initialValue={field.value}
                        bottom={false}
                        // dependsOn={{
                        //   field: "country",
                        //   value: form.watch("country") || null
                        // }}
                        // disabled={!form.watch("country")}
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
                        placeholder="Select degree..."
                        table="zoho-degrees"
                        searchField="name"
                        displayField="name"
                        bottom={false}
                        initialValue={field.value}
                        onSelect={(item: { id: string }) => {
                          field.onChange(item.id);
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange?.(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Application"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
