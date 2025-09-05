"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { zohoStudentsService } from "@/modules/zoho-students/services/zoho-students-service";
import {
  createStudentViaWebhook,
  updateStudentViaWebhook,
} from "@/lib/actions/zoho-students-actions";
import { toast } from "sonner";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Upload, X, Plus, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchableDropdown } from "@/components/searchable-dropdown";
import { ZohoStudent } from "@/modules/zoho-students/models/zoho-student";

// Enhanced form validation schema based on the images
const formSchema = z.object({
  // Basic student info
  transfer_student: z.enum(["yes", "no"]).optional(),
  have_tc: z.enum(["yes", "no"]).optional(),
  blue_card: z.enum(["yes", "no"]).optional(),

  // Personal Information
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.string().optional(),
  date_of_birth: z.date().optional(),
  nationality: z.string().optional(),
  passport_number: z.string().optional(),
  passport_issue_date: z.date().optional(),
  passport_expiry_date: z.date().optional(),
  country_of_residence: z.string().optional(),
  student_id: z.string().optional(),

  // Contact Information
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  mobile: z.string().optional(),

  // Address Information
  address_line_1: z.string().optional(),
  city_district: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  address_country: z.string().optional(),

  // Parent Information
  father_name: z.string().optional(),
  father_mobile: z.string().optional(),
  father_occupation: z.string().optional(),
  mother_name: z.string().optional(),
  mother_mobile: z.string().optional(),
  mother_occupation: z.string().optional(),

  // Education Information
  education_level: z.string().optional(),

  // Photo
  photo: z.any().optional(),

  // Documents
  documents: z
    .array(
      z.object({
        attachment_type: z.string(),
        file: z.any(),
      })
    )
    .optional(),
});

interface StudentInformationFormProps {
  mode: "create" | "edit";
}

export default function StudentInformationForm({
  mode,
}: StudentInformationFormProps) {
  const params = useParams();
  const studentId = params.id as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<
    Array<{ attachment_type: string; file: File | null }>
  >([{ attachment_type: "", file: null }]);
  const [dropdown] =
    useState<React.ComponentProps<typeof Calendar>["captionLayout"]>(
      "dropdown"
    );

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transfer_student: undefined,
      have_tc: undefined,
      blue_card: undefined,
      first_name: "",
      last_name: "",
      gender: "",
      date_of_birth: undefined,
      nationality: "",
      passport_number: "",
      passport_issue_date: undefined,
      passport_expiry_date: undefined,
      country_of_residence: "",
      student_id: "",
      email: "",
      mobile: "",
      address_line_1: "",
      city_district: "",
      state_province: "",
      postal_code: "",
      address_country: "",
      father_name: "",
      father_mobile: "",
      father_occupation: "",
      mother_name: "",
      mother_mobile: "",
      mother_occupation: "",
      education_level: "",
      photo: null,
      documents: [],
    },
  });

  // Load student data for edit mode
  useEffect(() => {
    if (mode === "edit" && studentId) {
      loadStudentData();
    }
  }, [mode, studentId]);

  const loadStudentData = async () => {
    try {
      setIsLoading(true);
      const student = await zohoStudentsService.getStudentById(studentId!);
      if (student) {
        // Populate form with existing data
        form.reset({
          first_name: student.first_name || "",
          last_name: student.last_name || "",
          gender: student.gender || "",
          date_of_birth: student.date_of_birth
            ? new Date(student.date_of_birth)
            : undefined,
          nationality: student.nationality || "",
          passport_number: student.passport_number || "",
          passport_issue_date: student.passport_issue_date
            ? new Date(student.passport_issue_date)
            : undefined,
          passport_expiry_date: student.passport_expiry_date
            ? new Date(student.passport_expiry_date)
            : undefined,
          country_of_residence: student.country_of_residence || "",
          email: student.email || "",
          mobile: student.mobile || "",
          father_name: student.father_name || "",
          father_mobile: student.father_mobile || "",
          father_occupation: student.father_job || "",
          mother_name: student.mother_name || "",
          mother_mobile: student.mother_mobile || "",
          mother_occupation: student.mother_job || "",
        });
      }
    } catch (error) {
      console.error("Error loading student data:", error);
      toast.error("Failed to load student data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const studentData = {
        first_name: values.first_name,
        last_name: values.last_name,
        gender: values.gender,
        date_of_birth: values.date_of_birth?.toISOString().split("T")[0],
        nationality: values.nationality
          ? values.nationality.toString()
          : undefined,
        passport_number: values.passport_number,
        passport_issue_date: values.passport_issue_date
          ?.toISOString()
          .split("T")[0],
        passport_expiry_date: values.passport_expiry_date
          ?.toISOString()
          .split("T")[0],
        country_of_residence: values.country_of_residence
          ? values.country_of_residence.toString()
          : undefined,
        email: values.email,
        mobile: values.mobile,
        father_name: values.father_name,
        father_mobile: values.father_mobile,
        father_job: values.father_occupation,
        mother_name: values.mother_name,
        mother_mobile: values.mother_mobile,
        mother_job: values.mother_occupation,
      };

      if (mode === "create") {
        // Create new student
        const webhookResponse = await createStudentViaWebhook(studentData);

        if (webhookResponse.status) {
          const studentDataWithId = {
            ...studentData,
            id: webhookResponse.id,
          };

          await zohoStudentsService.createStudent(studentDataWithId);
          toast.success("Student created successfully");
          router.push("/students");
        } else {
          throw new Error(
            webhookResponse.message || "Failed to create student via webhook"
          );
        }
      } else {
        // Update existing student
        const webhookResponse = await updateStudentViaWebhook({
          id: studentId,
          ...studentData,
        });

        if (webhookResponse.status) {
          await zohoStudentsService.updateStudent({
            id: studentId,
            ...studentData,
          });
          toast.success("Student updated successfully");
          router.push("/students");
        } else {
          throw new Error(
            webhookResponse.message || "Failed to update student via webhook"
          );
        }
      }
    } catch (error) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} student:`,
        error
      );
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${mode === "create" ? "create" : "update"} student`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Education level options
  const educationLevels = ["Associate", "Bachelor", "Master", "Phd"];

  // Document attachment types
  const attachmentTypes = [
    "Passport",
    "HighSchool Transcript",
    "Diploma",
    "English Skills",
    "Motivation Letter",
    "Recommendation Letter",
  ];

  // Gender options
  const genders = ["Male", "Female", "Other"];

  // Custom Date Picker Component
  const DatePicker = ({
    field,
    placeholder,
  }: {
    field: any;
    placeholder: string;
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant={"outline"}
            className={cn(
              "w-full pl-3 text-left font-normal",
              !field.value && "text-muted-foreground"
            )}
          >
            {field.value ? (
              format(field.value, "yyyy-MM-dd")
            ) : (
              <span>{placeholder}</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={field.value}
          onSelect={field.onChange}
          captionLayout={dropdown}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

  // Add new document row
  const addDocumentRow = () => {
    setDocuments([...documents, { attachment_type: "", file: null }]);
  };

  // Remove document row
  const removeDocumentRow = (index: number) => {
    if (documents.length > 1) {
      const newDocs = documents.filter((_, i) => i !== index);
      setDocuments(newDocs);
    }
  };

  // Handle document type change
  const handleDocumentTypeChange = (index: number, type: string) => {
    const newDocs = [...documents];
    newDocs[index].attachment_type = type;
    setDocuments(newDocs);
  };

  // Handle file upload
  const handleFileUpload = (index: number, file: File | null) => {
    const newDocs = [...documents];
    newDocs[index].file = file;
    setDocuments(newDocs);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Student Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Radio button questions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="transfer_student"
                  render={({ field }) => (
                    <FormItem className="gap-5">
                      <FormLabel>Transfer student? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="transfer-yes" />
                            <Label htmlFor="transfer-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="transfer-no" />
                            <Label htmlFor="transfer-no">No</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="have_tc"
                  render={({ field }) => (
                    <FormItem className="gap-5">
                      <FormLabel>Have T.C</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="tc-yes" />
                            <Label htmlFor="tc-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="tc-no" />
                            <Label htmlFor="tc-no">No</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="blue_card"
                  render={({ field }) => (
                    <FormItem className="gap-5">
                      <FormLabel>Blue_Card *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="blue-yes" />
                            <Label htmlFor="blue-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="blue-no" />
                            <Label htmlFor="blue-no">No</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Personal Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passport_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passport No *</FormLabel>
                      <FormControl>
                        <Input placeholder="Passport number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passport_issue_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date *</FormLabel>
                      <DatePicker field={field} placeholder="yyyy-MM-dd" />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="-Select-" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {genders.map((gender) => (
                            <SelectItem key={gender} value={gender}>
                              {gender}
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
                  name="passport_expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date *</FormLabel>
                      <DatePicker field={field} placeholder="yyyy-MM-dd" />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <DatePicker field={field} placeholder="yyyy-MM-dd" />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality *</FormLabel>
                      <SearchableDropdown
                        placeholder="-Select-"
                        table="zoho-countries"
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
                  name="country_of_residence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country of Residence *</FormLabel>
                      <SearchableDropdown
                        placeholder="-Select-"
                        table="zoho-countries"
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
                  name="student_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Student ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact & Address Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact & Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile</FormLabel>
                      <FormControl>
                        {/* <PhoneInput
                          defaultCountry="ae"
                          value={field.value}
                          onChange={(phone: any) => field.onChange(phone)}
                          placeholder="Enter mobile number"
                          inputClassName="h-11 rounded-md px-3 text-sm placeholder:text-dark-600 w-full"
                        /> */}
                        <Input placeholder="Mobile number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h4 className="font-medium">Address</h4>

                <FormField
                  control={form.control}
                  name="address_line_1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Address Line 1"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city_district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City / District</FormLabel>
                        <FormControl>
                          <Input placeholder="City / District" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state_province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State / Province</FormLabel>
                        <FormControl>
                          <Input placeholder="State / Province" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Postal Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="-Select-" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ae">
                              United Arab Emirates
                            </SelectItem>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Family Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Family Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="father_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father_Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Father's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="father_mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father Mobile</FormLabel>
                      <FormControl>
                        {/* <PhoneInput
                          defaultCountry="ae"
                          value={field.value}
                          onChange={(phone: any) => field.onChange(phone)}
                          placeholder="Enter mobile number"
                          inputClassName="h-11 rounded-md px-3 text-sm placeholder:text-dark-600 w-full  bg-transparent"
                        /> */}
                        <Input placeholder="Father's mobile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="father_occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="Father's occupation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mother_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mother_Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mother's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Academic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="education_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student will apply for</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full md:w-1/2">
                          <SelectValue placeholder="-Select-" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {educationLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Photo Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Photo Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>Student Photo</FormLabel> */}
                    <FormControl>
                      <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <Button
                              type="button"
                              variant="outline"
                              className="flex items-center gap-2 w-[200px]"
                            >
                              Choose Image
                              <Upload className="h-4 w-4" />
                            </Button>
                            <p className="text-sm text-muted-foreground mt-2">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              field.onChange(file);
                            }}
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Document Attachments Card */}
          <Card>
            <CardHeader>
              <CardTitle>Document Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocumentRow(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Select
                      onValueChange={(value) =>
                        handleDocumentTypeChange(index, value)
                      }
                      value={doc.attachment_type}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {attachmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      Choose File
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleFileUpload(index, file);
                      }}
                    />
                    {doc.file && (
                      <span className="text-sm text-green-600 font-medium">
                        ✓ {doc.file.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                onClick={addDocumentRow}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6">
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? mode === "create"
                    ? "Creating..."
                    : "Updating..."
                  : mode === "create"
                    ? "Create Student"
                    : "Update Student"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
