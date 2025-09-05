import StudentInformationForm from "@/components/(main)/zoho-students/student-information-form";

interface EditStudentPageProps {
  params: {
    id: string;
  };
}

export default function EditStudentPage({ params }: EditStudentPageProps) {
  return (
    <div className=" mx-auto py-6 space-y-4">
      <StudentInformationForm mode="edit" studentId={params.id} />
    </div>
  );
}
