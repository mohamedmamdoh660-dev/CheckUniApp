"use server";

import { ZohoStudent } from "@/types/types";

// N8n webhook URLs
const CREATE_WEBHOOK_URL = "https://n8n.browserautomations.com/webhook/da599eaf-7f5e-45aa-9d53-33d1f185515a";
const EDIT_WEBHOOK_URL = "https://n8n.browserautomations.com/webhook/fd05f4dc-7652-41ee-8c4b-64cd4164662d";
const DELETE_WEBHOOK_URL = "https://n8n.browserautomations.com/webhook/c5aecacb-b462-4725-bca6-f7a1a80603eb";

/**
 * Create student via n8n webhook
 */
export async function createStudentViaWebhook(studentData: Partial<ZohoStudent>) {
  try {
    const response = await fetch(CREATE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(data.message || "Failed to create student via webhook");
    }
    
    return data;
  } catch (error) {
    console.error("Error in createStudentViaWebhook:", error);
    throw error;
  }
}

/**
 * Update student via n8n webhook
 */
export async function updateStudentViaWebhook(studentData: Partial<ZohoStudent>) {
  try {
    const response = await fetch(EDIT_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(data.message || "Failed to update student via webhook");
    }
    
    return data;
  } catch (error) {
    console.error("Error in updateStudentViaWebhook:", error);
    throw error;
  }
}

/**
 * Delete student via n8n webhook
 */
export async function deleteStudentViaWebhook(studentId: string) {
  try {
    const response = await fetch(DELETE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: studentId }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(data.message || "Failed to delete student via webhook");
    }
    
    return data;
  } catch (error) {
    console.error("Error in deleteStudentViaWebhook:", error);
    throw error;
  }
}
