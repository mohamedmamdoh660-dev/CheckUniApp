"use client";

import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Plus, RefreshCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ActionType, ResourceType, RoleAccess } from "@/types/types";
import { CreateProtected } from "@/components/auth/permission-protected";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
// import { rolesService } from "@/modules/roles";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role } from "@/types/types";
import MultipleSelector, { Option } from "@/components/ui/multiselect";
import { rolesService } from "@/modules";

// Convert enum to options array
const resourceOptions: Option[] = Object.values(ResourceType).map(
  (resource) => ({
    value: resource,
    label: resource,
  })
);

const actionOptions: Option[] = Object.values(ActionType).map((action) => ({
  value: action,
  label: action,
}));

const formSchema = z.object({
  role: z.string().min(1, { message: "Role is required" }),
  resources: z
    .array(z.string())
    .min(1, { message: "At least one resource is required" }),
  actions: z.string().min(1, { message: "Action is required" }),
});

interface DataTableToolbarProps<TData> {
  table?: Table<TData>;
  onRefresh?: () => void;
  onExport?: () => void;
  tableName?: string;
  onGlobalFilterChange?: (value: string) => void;
  onResourceFilterChange?: (value: string | null) => void;
  onActionFilterChange?: (value: string | null) => void;
  fetchRecords: () => void;
  type?: string;
  roles: Role[];
  selectedRoleId: string | null;
  handleRoleChange: (roleId: string) => void;
  selectedResource: string | null;
  selectedAction: string | null;
  setSelectedResource: (value: string | null) => void;
  setSelectedAction: (value: string | null) => void;
}

export function PermissionDataTableToolbar<TData>({
  table,
  onRefresh,
  onExport,
  tableName,
  onGlobalFilterChange,
  onResourceFilterChange,
  onActionFilterChange,
  fetchRecords,
  type,
  roles,
  selectedRoleId,
  handleRoleChange,
  selectedResource,
  selectedAction: filterSelectedAction,
  setSelectedResource,
  setSelectedAction,
}: DataTableToolbarProps<TData>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingPermissions, setExistingPermissions] = useState<RoleAccess[]>(
    []
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "",
      resources: [],
      actions: "",
    },
  });

  const formSelectedRole = form.watch("role");
  const formSelectedAction = form.watch("actions");

  // Load existing permissions when role changes
  useEffect(() => {
    const loadExistingPermissions = async (roleId: string) => {
      const permissions = await rolesService.getRoleAccess(roleId);
      setExistingPermissions(permissions);
    };

    if (formSelectedRole) {
      loadExistingPermissions(formSelectedRole);
    } else {
      setExistingPermissions([]);
    }
  }, [formSelectedRole]);

  // Update resources when role or action changes
  useEffect(() => {
    if (existingPermissions.length > 0 && formSelectedAction) {
      // Filter resources that have the selected action
      const resourcesForAction = existingPermissions
        .filter((p) => p.action === formSelectedAction)
        .map((p) => p.resource);

      form.setValue("resources", resourcesForAction);
    } else {
      form.setValue("resources", []);
    }
  }, [existingPermissions, formSelectedAction, form]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onGlobalFilterChange?.(value);
  };

  const handleResourceFilterChange = (value: string | null) => {
    setSelectedResource(value === "all" ? null : value);
    onResourceFilterChange?.(value === "all" ? null : value);
  };

  const handleActionFilterChange = (value: string | null) => {
    setSelectedAction(value === "all" ? null : value);
    onActionFilterChange?.(value === "all" ? null : value);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // First, get all existing permissions for the selected role
      const currentRolePermissions = existingPermissions.filter(
        (p) => p.role_id === data.role && p.action === data.actions
      );

      // Find permissions to remove:
      // 1. All permissions for the selected role and action that are not in the new resources list
      // 2. All permissions for the selected role that have different actions
      const permissionsToRemove = currentRolePermissions.filter(
        (p) =>
          (p.action === data.actions && !data.resources.includes(p.resource)) || // Remove if resource not selected
          (data.resources.includes(p.resource) && p.action !== data.actions) // Remove if action different
      );

      // Delete removed permissions
      for (const permission of permissionsToRemove) {
        await rolesService.deleteRoleAccess(permission.id);
      }

      // Find permissions to add:
      // Check each resource in the new selection
      const existingCombinations = currentRolePermissions.map(
        (p) => `${p.resource}-${p.action}`
      );

      const permissionsToAdd = data.resources
        .map((resource) => {
          const combo = `${resource}-${data.actions}`;
          // Only add if this combination doesn't exist
          if (!existingCombinations.includes(combo)) {
            return {
              role_id: data.role,
              resource,
              action: data.actions,
            };
          }
          return null;
        })
        .filter(Boolean);

      // Add new permissions
      const addPromises = permissionsToAdd.map(
        (permission) =>
          permission &&
          rolesService.createRoleAccess(
            permission.role_id,
            permission.resource,
            permission.action
          )
      );

      await Promise.all(addPromises);

      setIsDialogOpen(false);
      form.reset();
      fetchRecords();
      toast.success("Permissions updated successfully");
    } catch (error: any) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="min-w-[200px] max-w-max">
            <Select
              value={selectedRoleId || ""}
              onValueChange={handleRoleChange}
              disabled={roles.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[200px]">
            <Select
              value={selectedResource || ""}
              onValueChange={(value) =>
                handleResourceFilterChange(value || null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {Object.values(ResourceType).map((resource) => (
                  <SelectItem key={resource} value={resource}>
                    {resource}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[200px]">
            <Select
              value={filterSelectedAction || ""}
              onValueChange={(value) => handleActionFilterChange(value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {Object.values(ActionType).map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(filterSelectedAction || selectedResource) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAction(null);
                setSelectedResource(null);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecords}
            className="hidden lg:flex"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>

          {table && <DataTableViewOptions table={table} />}
          <CreateProtected resource={ResourceType.PERMISSIONS}>
            <div className="">
              <Button
                variant="default"
                size="sm"
                className=""
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Permission
              </Button>
            </div>
          </CreateProtected>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Manage Permissions</DialogTitle>
                <DialogDescription>
                  Select a role and action to manage resources. Resources will
                  be automatically loaded based on your selection.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset action when role changes
                            form.setValue("actions", "");
                            form.setValue("resources", []);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
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
                    name="actions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!formSelectedRole}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an action" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(ActionType)

                              .map((action) => (
                                <SelectItem key={action} value={action}>
                                  {action}
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
                    name="resources"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resources</FormLabel>
                        <MultipleSelector
                          value={field.value.map((value) => ({
                            value,
                            label: value,
                          }))}
                          onChange={(options) =>
                            field.onChange(options.map((opt) => opt.value))
                          }
                          defaultOptions={resourceOptions}
                          placeholder={
                            !formSelectedRole || !formSelectedAction
                              ? "Select a role and action first"
                              : "Select resources"
                          }
                          disabled={!formSelectedRole || !formSelectedAction}
                          hideClearAllButton={false}
                          emptyIndicator={
                            !formSelectedRole ? (
                              <p className="text-center text-sm">
                                Select a role first
                              </p>
                            ) : !formSelectedAction ? (
                              <p className="text-center text-sm">
                                Select an action first
                              </p>
                            ) : (
                              <p className="text-center text-sm">
                                No resources found
                              </p>
                            )
                          }
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        form.reset();
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        loading || !formSelectedRole || !formSelectedAction
                      }
                    >
                      {loading ? "Updating..." : "Update Permissions"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
