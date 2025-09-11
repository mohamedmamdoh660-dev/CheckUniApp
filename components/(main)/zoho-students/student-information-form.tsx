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
import "@/styles/phone-input.css";
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
import {
  CalendarIcon,
  Upload,
  X,
  Plus,
  ArrowLeft,
  User,
  IdCard,
  Phone,
  GraduationCap,
  Image,
  FileText,
  Home,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchableDropdown } from "@/components/searchable-dropdown";
import { saveFile } from "@/supabase/actions/save-file";
import { useAuth } from "@/context/AuthContext";
import { ZohoCountry } from "@/types/types";
import { zohoProgramsService } from "@/modules/zoho-programs/services/zoho-programs-service";

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
    Array<{
      attachment_type: string;
      file: File | null;
      uploading: boolean;
      url?: string;
    }>
  >([{ attachment_type: "", file: null, uploading: false }]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [dropdown] =
    useState<React.ComponentProps<typeof Calendar>["captionLayout"]>(
      "dropdown"
    );
  const { userProfile } = useAuth();
  const [contries, setContries] = useState<ZohoCountry[]>([]);
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
      // Prepare documents data - passing URLs instead of file objects
      const documentsData = documents
        .filter((doc) => doc.attachment_type && doc.url)
        .map((doc) => ({
          type: doc.attachment_type,
          url: doc.url,
          filename: doc.file?.name || "",
        }));

      // Data for webhook - include ALL fields and files from every section
      const webhookStudentData = {
        // Student Basic Info Card
        transfer_student: values.transfer_student,
        have_tc: values.have_tc,
        blue_card: values.blue_card,

        // Personal Details
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
        student_id: values.student_id,

        // Contact & Address Information
        email: values.email,
        mobile: values.mobile,
        address_line_1: values.address_line_1,
        city_district: values.city_district,
        state_province: values.state_province,
        postal_code: values.postal_code,
        address_country: values.address_country,

        // Family Information
        father_name: values.father_name,
        father_mobile: values.father_mobile,
        father_job: values.father_occupation,
        mother_name: values.mother_name,
        mother_mobile: values.mother_mobile,
        mother_job: values.mother_occupation,

        // Academic Information
        education_level: values.education_level,

        // Photo Upload
        photo_url: values.photo, // Pass the URL instead of file

        // Documents
        documents: documentsData,
        user_id: userProfile?.id,
        agency_id:
          userProfile?.roles?.name === "agency"
            ? userProfile?.id
            : userProfile?.roles?.name === "admin"
              ? null
              : userProfile?.agency_id,
      };

      // Data for database - only include the fields we're already passing
      const dbStudentData = {
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
        const webhookResponse =
          await createStudentViaWebhook(webhookStudentData);

        if (webhookResponse.status) {
          const studentDataWithId = {
            ...dbStudentData,
            id: webhookResponse.id,
            user_id: userProfile?.id,
            agency_id:
              userProfile?.roles?.name === "agency"
                ? userProfile?.id
                : userProfile?.roles?.name === "admin"
                  ? null
                  : userProfile?.agency_id,
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
          ...webhookStudentData,
        });

        if (webhookResponse.status) {
          await zohoStudentsService.updateStudent({
            id: studentId,
            ...dbStudentData, // Only update the fields we're already passing
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
        `Failed to ${mode === "create" ? "create" : "update"} student`
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
    label,
  }: {
    field: any;
    placeholder: string;
    label: string;
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
          captionLayout="dropdown"
          disabled={(date) => {
            // Only apply date restrictions when it's not an expiry date field
            if (label !== "Expiry Date") {
              return date > new Date() || date < new Date("1900-01-01");
            }
            // For expiry dates, allow future dates
            return date < new Date("1900-01-01");
          }}
          initialFocus
          defaultMonth={
            label === "Date of Birth" ? new Date(2000, 0, 1) : undefined
          }
        />
      </PopoverContent>
    </Popover>
  );

  // Handle photo upload
  const handlePhotoUpload = async (file: File) => {
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Photo size must be less than 10MB");
      return;
    }

    // Check file type
    const allowedPhotoTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
    ];
    if (!allowedPhotoTypes.includes(file.type)) {
      toast.error(
        "Please select a valid image file (JPG, JPEG, PNG, GIF, BMP)"
      );
      return;
    }

    setPhotoUploading(true);
    try {
      // Upload file to Supabase and get URL
      const url = await saveFile(file);
      if (url) {
        setPhotoUrl(url);
        form.setValue("photo", url); // Store URL instead of file
        toast.success("Photo uploaded successfully");
      } else {
        toast.error("Failed to upload photo");
      }
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error("Failed to upload photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  // Add new document row
  const addDocumentRow = () => {
    setDocuments([
      ...documents,
      { attachment_type: "", file: null, uploading: false },
    ]);
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

  // Handle document file upload
  const handleDocumentUpload = async (index: number, file: File | null) => {
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Document size must be less than 10MB");
      return;
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Please select a valid document file (PDF, DOC, DOCX, JPG, PNG)"
      );
      return;
    }

    const newDocs = [...documents];
    newDocs[index].uploading = true;
    setDocuments([...newDocs]);

    try {
      // Upload file to Supabase and get URL
      const url = await saveFile(file);
      if (url) {
        newDocs[index].file = file; // Keep file for reference
        newDocs[index].url = url; // Store the actual Supabase URL
        newDocs[index].uploading = false;
        setDocuments([...newDocs]);
        toast.success(`${file.name} uploaded successfully`);
      } else {
        newDocs[index].uploading = false;
        setDocuments([...newDocs]);
        toast.error("Failed to upload document");
      }
    } catch (error) {
      console.error("Document upload error:", error);
      newDocs[index].uploading = false;
      setDocuments([...newDocs]);
      toast.error("Failed to upload document");
    }
  };

  useEffect(() => {
    const fetchCountries = async () => {
      const countries = await zohoProgramsService.getCountries(
        "",
        0,
        1000,
        null
      );
      setContries(countries);
    };
    fetchCountries();
  }, []);

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Student Basic Info Card */}
          <Card className="">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} className="text-primary" />
                Student Information
              </CardTitle>
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
                      <FormLabel>Blue Card *</FormLabel>
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
          <Card className="">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IdCard size={20} className="text-primary" />
                Personal Details
              </CardTitle>
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
                      <DatePicker
                        field={field}
                        placeholder="yyyy-MM-dd"
                        label="Issue Date"
                      />
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
                      <DatePicker
                        field={field}
                        placeholder="yyyy-MM-dd"
                        label="Expiry Date"
                      />
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
                      <DatePicker
                        field={field}
                        placeholder="yyyy-MM-dd"
                        label="Date of Birth"
                      />
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
                          {contries
                            .filter(
                              (country) =>
                                country.active_on_nationalities === true
                            )
                            .map((country) => (
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
                  name="country_of_residence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country of Residence *</FormLabel>
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
                          {contries.map((country) => (
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
              <CardTitle className="flex items-center gap-2">
                <Phone size={20} className="text-primary" />
                Contact & Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <PhoneInput
                          defaultCountry="ae"
                          value={field.value}
                          onChange={(phone: any) => field.onChange(phone)}
                          placeholder="Enter mobile number"
                          inputClassName="h-11 rounded-md px-3 text-sm w-full"
                        />
                        {/* <Input placeholder="Mobile number" {...field} /> */}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Home size={16} className="text-muted-foreground" />
                  Address
                </h4>

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            {contries.map((country) => (
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
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Users size={16} className="text-muted-foreground" />
                  Family Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <PhoneInput
                            defaultCountry="ae"
                            value={field.value}
                            onChange={(phone: any) => field.onChange(phone)}
                            placeholder="Enter mobile number"
                            inputClassName="h-11 rounded-md px-3 text-sm w-full"
                          />
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
                        <FormLabel>Mother Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Mother's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mother_mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother Mobile</FormLabel>
                        <FormControl>
                          <PhoneInput
                            defaultCountry="ae"
                            value={field.value}
                            onChange={(phone: any) => field.onChange(phone)}
                            placeholder="Enter mobile number"
                            inputClassName="h-11 rounded-md px-3 text-sm w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mother_occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother Occupation</FormLabel>
                        <FormControl>
                          <Input placeholder="Mother's occupation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap size={20} className="text-primary" />
                Academic Information
              </CardTitle>
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
              <CardTitle className="flex items-center gap-2">
                <Image size={20} className="text-primary" />
                Photo Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-4">
                        {photoUrl && (
                          <div className="flex items-center justify-center">
                            <img
                              src={photoUrl}
                              alt="Student photo"
                              className="w-32 h-32 rounded-lg object-cover border"
                            />
                          </div>
                        )}
                        <div
                          className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors w-full cursor-pointer"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) handlePhotoUpload(file);
                            };
                            input.click();
                          }}
                        >
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                              <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <Button
                                type="button"
                                variant="outline"
                                disabled={photoUploading}
                                className="flex items-center gap-2 w-[200px]"
                              >
                                {photoUploading ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    Choose Image
                                    <Upload className="h-4 w-4" />
                                  </>
                                )}
                              </Button>
                              <p className="text-sm text-muted-foreground mt-2">
                                PNG, JPG, GIF up to 10MB
                              </p>
                            </div>
                          </div>
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
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Document Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="p-5 border-2 border-dashed rounded-lg bg-muted/10 space-y-4  transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between ">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        Document {index + 1}
                      </h4>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocumentRow(index)}
                          className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="w-full">
                        {/* <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                          Document Type
                        </label> */}
                        <Select
                          onValueChange={(value) =>
                            handleDocumentTypeChange(index, value)
                          }
                          value={doc.attachment_type}
                        >
                          <SelectTrigger className="w-full">
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

                      <div className="w-full">
                        {/* <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                          Document File
                        </label> */}
                        <div className="flex items-center gap-2">
                          {doc.file && doc.url ? (
                            <div className="flex flex-col w-full">
                              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-900">
                                <div className="w-10 h-10 rounded-md bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-300">
                                  <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-green-700 dark:text-green-300 truncate">
                                    {doc.file.name}
                                  </p>
                                  <p className="text-xs text-green-600 dark:text-green-400">
                                    {(doc.file.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(doc.url, "_blank")}
                                  className="h-8 px-2 text-xs border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/50"
                                >
                                  View
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-xs self-end"
                                onClick={() => {
                                  const input = document.createElement("input");
                                  input.type = "file";
                                  input.accept =
                                    ".pdf,.doc,.docx,.jpg,.jpeg,.png";
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement)
                                      .files?.[0];
                                    if (file) handleDocumentUpload(index, file);
                                  };
                                  input.click();
                                }}
                              >
                                Replace file
                              </Button>
                            </div>
                          ) : (
                            // <div
                            //   className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/5 hover:bg-muted/10 transition-colors hover:border-primary/50"
                            //   onClick={() => {
                            //     const input = document.createElement("input");
                            //     input.type = "file";
                            //     input.accept =
                            //       ".pdf,.doc,.docx,.jpg,.jpeg,.png";
                            //     input.onchange = (e) => {
                            //       const file = (e.target as HTMLInputElement)
                            //         .files?.[0];
                            //       if (file) handleDocumentUpload(index, file);
                            //     };
                            //     input.click();
                            //   }}
                            // >
                            //   {doc.uploading ? (
                            //     <div className="flex flex-col items-center justify-center gap-2">
                            //       <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                            //       <p className="text-sm text-muted-foreground">
                            //         Uploading...
                            //       </p>
                            //     </div>
                            //   ) : (
                            //     <div className="flex flex-col items-center justify-center gap-2">
                            //       <Upload className="h-8 w-8 text-muted-foreground" />
                            //       <p className="text-sm text-muted-foreground">
                            //         Click to upload document
                            //       </p>
                            //       <p className="text-xs text-muted-foreground">
                            //         PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                            //       </p>
                            //     </div>
                            //   )}
                            // </div>
                            <div
                              className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors w-full cursor-pointer"
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept =
                                  ".pdf,.doc,.docx,.jpg,.jpeg,.png";
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement)
                                    .files?.[0];
                                  if (file) handleDocumentUpload(index, file);
                                };
                                input.click();
                              }}
                            >
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                  <Upload className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="w-full flex flex-col items-center justify-center">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={doc.uploading}
                                    className="flex items-center gap-2 w-[200px]"
                                  >
                                    {doc.uploading ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                                        Uploading...
                                      </>
                                    ) : (
                                      <>
                                        Choose Document
                                        <Upload className="h-4 w-4" />
                                      </>
                                    )}
                                  </Button>
                                  <p className="text-sm text-muted-foreground mt-2">
                                    PDF, DOC, DOCX, JPG, PNG up to 10MB
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addDocumentRow}
                className="flex items-center gap-2 w-full border-dashed border-2 py-6 hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Add New Document</span>
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-2">
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
