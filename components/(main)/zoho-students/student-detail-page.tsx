"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Download,
  Edit,
  GraduationCap,
  Users,
  CreditCard,
  Home,
  Eye,
} from "lucide-react";
import { ZohoStudent } from "@/types/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";
import InfoGraphic from "@/components/ui/info-graphic";
import { getStudentById } from "@/supabase/actions/students";
import { DocumentIcon } from "@/utils/file-icons";
import { useAuth } from "@/context/AuthContext";
import { formatFileSize } from "@/utils/format-file-size";
import { generateNameAvatar } from "@/utils/generateRandomAvatar";

export function StudentDetailPage() {
  const [student, setStudent] = useState<ZohoStudent | null>(null);
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const studentId = params.id as string;
  const { userProfile } = useAuth();

  const getStudent = async () => {
    try {
      setIsLoading(true);
      const student = await getStudentById(studentId);
      setIsLoading(false);
      setStudent({
        ...student,
      });
    } catch (error) {
      console.log("🚀 ~ getStudent ~ error:", error);
    }
  };

  const downloadStudentCsv = (s: ZohoStudent) => {
    if (!s) return;
    const safe = (v?: any) => (v === undefined || v === null ? "" : String(v));
    const fields: Record<string, string> = {
      id: safe(s.id),
      first_name: safe(s.first_name),
      last_name: safe(s.last_name),
      gender: safe(s.gender),
      date_of_birth: safe(s.date_of_birth),
      nationality: safe(s.nationality_record?.name || s.nationality),
      email: safe(s.email),
      mobile: safe(s.mobile),
      transfer_student: safe(s.transfer_student),
      have_tc: safe(s.have_tc),
      tc_number: safe(s.tc_number),
      blue_card: safe(s.blue_card),
      passport_number: safe(s.passport_number),
      passport_issue_date: safe(s.passport_issue_date),
      passport_expiry_date: safe(s.passport_expiry_date),
      address_line_1: safe(s.address_line_1),
      city_district: safe(s.city_district),
      state_province: safe(s.state_province),
      postal_code: safe(s.postal_code),
      address_country: safe(
        s.address_country_record?.name || s.address_country
      ),
      father_name: safe(s.father_name),
      father_mobile: safe(s.father_mobile),
      father_job: safe(s.father_job),
      mother_name: safe(s.mother_name),
      mother_mobile: safe(s.mother_mobile),
      mother_job: safe(s.mother_job),
      education_level: safe(s.education_level),
      education_level_name: safe(s.education_level_name),
      high_school_name: safe(s.high_school_name),
      high_school_country: safe(
        s.high_school_country_record?.name || s.high_school_country
      ),
      high_school_gpa_percent: safe(s.high_school_gpa_percent),
      bachelor_school_name: safe(s.bachelor_school_name),
      bachelor_country: safe(
        s.bachelor_country_record?.name || s.bachelor_country
      ),
      bachelor_gpa_percent: safe(s.bachelor_gpa_percent),
      master_school_name: safe(s.master_school_name),
      master_country: safe(s.master_country_record?.name || s.master_country),
      master_gpa_percent: safe(s.master_gpa_percent),
      photo_url: safe(s.photo_url),
      documents_count: String(
        Array.isArray(s.documents) ? s.documents.length : 0
      ),
      documents: safe(JSON.stringify(s.documents)),
    };

    const headers = Object.keys(fields);
    const escapeCsv = (val: string) => {
      const needsQuotes = /[",\n]/.test(val);
      let out = val.replace(/"/g, '""');
      return needsQuotes ? `"${out}"` : out;
    };
    const row = headers.map((h) => escapeCsv(fields[h])).join(",");
    const csv = `${headers.join(",")}\n${row}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const filename = `${safe(s.first_name)}_${safe(s.last_name)}_${safe(s.id)}.csv`;
    a.href = url;
    a.download = filename.replace(/\s+/g, "_");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (studentId) {
      getStudent();
    }
  }, [studentId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!student) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <InfoGraphic
          title="Student Not Found"
          description="The student you are looking for does not exist."
          icon={<FileText className="!w-16 !h-16 text-primary" />}
          isLeftArrow={false}
          gradient={false}
        />
      </div>
    );
  }

  return (
    <div className=" bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card border-b border-border">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <Avatar className="h-24 w-24 ring-4 ring-accent/20">
                <AvatarImage
                  src={
                    student?.photo_url ||
                    generateNameAvatar(
                      `${student?.first_name} ${student?.last_name}`
                    )
                  }
                  alt={`${student?.first_name} ${student?.last_name}`}
                />
                <AvatarFallback className="text-xl font-bold bg-accent/10 text-primary">
                  {getInitials(student?.first_name, student?.last_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground text-balance">
                    {student?.first_name} {student?.last_name}
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Student ID: {student?.id || "N/A"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    <User className="w-3 h-3 mr-1" />
                    {student?.gender || "N/A"}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(student?.date_of_birth || "")}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    {student?.nationality_record?.name ||
                      student?.nationality ||
                      "N/A"}
                  </Badge>
                  {student?.education_level_name ? (
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      <GraduationCap className="w-3 h-3 mr-1" />
                      {student.education_level_name}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="flex gap-3">
                {userProfile?.crm_id && (
                  <Button
                    onClick={() => {
                      router.push(`/students/edit/${student.id}`);
                    }}
                    variant="outline"
                    className="border-primary/20 hover:bg-primary/5 bg-transparent"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
                <Button
                  onClick={() => downloadStudentCsv(student)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger
                value="personal"
                className="data-[state=active]:bg-accent dark:data-[state=active]:text-primary-foreground"
              >
                Personal Details
              </TabsTrigger>
              <TabsTrigger
                value="education"
                className="data-[state=active]:bg-accent dark:data-[state=active]:text-primary-foreground"
              >
                Education History
              </TabsTrigger>
              <TabsTrigger
                value="family"
                className="data-[state=active]:bg-accent dark:data-[state=active]:text-primary-foreground"
              >
                Family Info
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="data-[state=active]:bg-accent dark:data-[state=active]:text-primary-foreground"
              >
                Documents
              </TabsTrigger>
            </TabsList>

            {/* Personal Details Tab */}
            <TabsContent value="personal" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-0">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Mail className="w-5 h-5 text-primary" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Email
                        </p>
                        <p className="font-medium break-all">
                          {student?.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Mobile
                        </p>
                        <p className="font-medium">
                          {student?.mobile || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Have TC
                        </p>
                        <p className="font-medium">
                          {student?.have_tc || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Transfer Student
                        </p>
                        <p className="font-medium">
                          {student?.transfer_student || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Blue Card
                        </p>
                        <p className="font-medium">
                          {student?.blue_card || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-0">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Home className="w-5 h-5 text-primary" />
                      Address Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Address
                      </p>
                      <p className="font-medium">
                        {student?.address_line_1 || "N/A"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          City/District
                        </p>
                        <p className="font-medium">
                          {student?.city_district || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          State/Province
                        </p>
                        <p className="font-medium">
                          {student?.state_province || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Postal Code
                        </p>
                        <p className="font-medium">
                          {student?.postal_code || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Country
                        </p>
                        <p className="font-medium">
                          {student?.address_country_record?.name ||
                            student?.address_country ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Passport Details */}
              <Card className="shadow-sm">
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Passport & Identity Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Passport Number
                      </p>
                      <p className="font-mono font-medium">
                        {student?.passport_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Issue Date
                      </p>
                      <p className="font-medium">
                        {formatDate(student?.passport_issue_date || "")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Expiry Date
                      </p>
                      <p className="font-medium">
                        {formatDate(student?.passport_expiry_date || "")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        TC Number
                      </p>
                      <p className="font-medium">
                        {student?.tc_number || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Education History Tab */}
            <TabsContent value="education" className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Educational Background
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* High School */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <h4 className="font-semibold text-lg">High School</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            School Name
                          </p>
                          <p className="font-medium">
                            {student?.high_school_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Country
                          </p>
                          <p className="font-medium">
                            {student?.high_school_country_record?.name ||
                              student?.high_school_country ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            GPA
                          </p>
                          <Badge variant="outline" className="font-mono">
                            {student?.high_school_gpa_percent || "N/A"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Bachelor's */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <h4 className="font-semibold text-lg">
                          Bachelor's Degree
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            School Name
                          </p>
                          <p className="font-medium">
                            {student?.bachelor_school_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Country
                          </p>
                          <p className="font-medium">
                            {student?.bachelor_country_record?.name ||
                              student?.bachelor_country ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            GPA
                          </p>
                          <Badge variant="outline" className="font-mono">
                            {student?.bachelor_gpa_percent || "N/A"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Master's */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <h4 className="font-semibold text-lg">
                          Master's Degree
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            School Name
                          </p>
                          <p className="font-medium">
                            {student?.master_school_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Country
                          </p>
                          <p className="font-medium">
                            {student?.master_country_record?.name ||
                              student?.master_country ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            GPA
                          </p>
                          <Badge variant="outline" className="font-mono">
                            {student?.master_gpa_percent || "N/A"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-8" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Current Education Level
                      </p>
                      <p className="font-medium text-lg">
                        {student?.academic_level_record?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Education Level Name
                      </p>
                      <p className="font-medium text-lg">
                        {student?.education_level_name || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Family Information Tab */}
            <TabsContent value="family" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Father's Information */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-0">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="w-5 h-5 text-primary" />
                      Father's Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Name
                      </p>
                      <p className="font-medium text-lg">
                        {student?.father_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Mobile
                      </p>
                      <p className="font-medium">
                        {student?.father_mobile || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Occupation
                      </p>
                      <p className="font-medium">
                        {student?.father_job || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Mother's Information */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-0">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="w-5 h-5 text-primary" />
                      Mother's Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Name
                      </p>
                      <p className="font-medium text-lg">
                        {student?.mother_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Mobile
                      </p>
                      <p className="font-medium">
                        {student?.mother_mobile || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Occupation
                      </p>
                      <p className="font-medium">
                        {student?.mother_job || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    Student Documents ({student?.documents?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {student?.documents?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                      {student?.documents?.map(
                        (
                          doc: {
                            type: string;
                            url: string;
                            filename: string;
                            size: string;
                          },
                          index: number
                        ) => (
                          <Card
                            key={index}
                            className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50  border border-border/60 hover:border-primary/30 transition-all duration-500  rounded-2xl backdrop-blur-sm"
                          >
                            <CardContent className="p-6 py-2">
                              {/* Animated background glow */}
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                              {/* Header with enhanced badge */}
                              <div className="relative flex items-center justify-between mb-4">
                                <Badge
                                  variant="outline"
                                  className="text-xs font-medium px-3 py-1 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-colors duration-300"
                                >
                                  {doc?.type?.toUpperCase?.() || "DOCUMENT"}
                                </Badge>

                                {/* Status indicator */}
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                  <span className="text-xs text-muted-foreground">
                                    Active
                                  </span>
                                </div>
                              </div>

                              {/* Enhanced document info section */}
                              <div className="relative mb-6 flex items-center gap-4">
                                <div className="relative">
                                  <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
                                    <DocumentIcon
                                      fileType={doc?.type}
                                      className="w-6 h-6"
                                    />
                                  </div>
                                  {/* Floating indicator */}
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h3
                                    className="font-bold text-lg text-foreground line-clamp-2 break-words leading-tight group-hover:text-primary transition-colors duration-300 mb-1"
                                    title={doc?.filename}
                                  >
                                    {doc?.filename || "Untitled Document"}
                                  </h3>

                                  {/* File info */}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="px-2 py-1 bg-muted/50 rounded-md">
                                      {formatFileSize(Number(doc?.size)) ||
                                        "Unknown size"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced action buttons */}
                              <div className="relative flex gap-3">
                                <Button
                                  onClick={() =>
                                    window.open(doc?.url, "_blank")
                                  }
                                  className="bg-background/80 text-foreground hover:bg-accent hover:text-accent-foreground justify-center h-11 px-4 text-sm font-medium rounded-xl border-1 w-[50%]"
                                >
                                  <Eye className="w-4 h-4 mr-2 " />
                                  <span className=" font-semibold">
                                    Preview
                                  </span>
                                </Button>

                                <a
                                  href={`/api/proxy-download?url=${encodeURIComponent(doc?.url)}&filename=${encodeURIComponent(doc?.filename || "document")}`}
                                  download
                                  className="w-[50%]"
                                >
                                  <Button className=" h-11 group/btn w-full">
                                    <Download className="w-4 h-4 mr-2 " />
                                    <span className=" font-semibold">
                                      Download
                                    </span>
                                  </Button>
                                </a>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-lg">
                        No documents found
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
