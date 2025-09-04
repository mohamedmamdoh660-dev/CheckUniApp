"use client";

import React, { useState } from "react";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Ellipsis, Edit, Trash } from "lucide-react";
import { ZohoStudent } from "@/modules/zoho-students/models/zoho-student";
import { zohoStudentsService } from "@/modules/zoho-students/services/zoho-students-service";
import { deleteStudentViaWebhook } from "@/lib/actions/zoho-students-actions";
import ConfirmationDialogBox from "@/components/ui/confirmation-dialog-box";
import EditZohoStudent from "@/components/(main)/zoho-students/component/edit-zoho-student";

interface ZohoStudentsTableRowActionsProps {
  row: Row<ZohoStudent>;
  fetchStudents: () => void;
}

export function ZohoStudentsTableRowActions({
  row,
  fetchStudents,
}: ZohoStudentsTableRowActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    action: "delete" | null;
  }>({ isOpen: false, action: null });

  const values: ZohoStudent = { ...row.original };

  const handleConfirmation = (action: "delete") => {
    setConfirmationDialog({ isOpen: true, action });
  };

  const onConfirm = async () => {
    if (!values?.id) {
      return;
    }
    try {
      setLoading(true);
      const action = confirmationDialog.action;

      if (action === "delete") {
        // First call the n8n webhook
        const webhookResponse = await deleteStudentViaWebhook(values.id);

        if (webhookResponse.status) {
          // If webhook was successful, then delete from database
          await zohoStudentsService.deleteStudent(values.id);
          toast.success("Student deleted successfully");
        } else {
          throw new Error(
            webhookResponse.message || "Failed to delete student via webhook"
          );
        }
      }

      setConfirmationDialog({ isOpen: false, action: null });
      fetchStudents(); // Refresh the student list after action
    } catch (error: any) {
      toast.error(error?.message || "Unknown error");
    } finally {
      setLoading(false);
      setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
          >
            <Ellipsis className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-max">
          <DropdownMenuItem
            onClick={() => {
              setIsEditDialogOpen(true);
            }}
            className="cursor-pointer flex items-center"
          >
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleConfirmation("delete")}
            className="cursor-pointer flex items-center"
          >
            <Trash className="mr-1 h-4 w-4" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isEditDialogOpen && (
        <EditZohoStudent
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          studentData={values}
          fetchStudents={fetchStudents}
        />
      )}

      <ConfirmationDialogBox
        title="Are you sure you want to delete this student?"
        description="This action cannot be undone. This will permanently delete the selected student."
        cancelText="Cancel"
        confirmText="Delete"
        isOpen={confirmationDialog.isOpen}
        setIsOpen={(isOpen: boolean) =>
          setConfirmationDialog((prev) => ({ ...prev, isOpen }))
        }
        loading={loading}
        onConfirm={onConfirm}
        icon={<Trash className="mr-2 h-4 w-4" />}
      />
    </>
  );
}
