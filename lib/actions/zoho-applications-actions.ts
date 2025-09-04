"use server";

import { ZohoApplication } from "@/modules/zoho-applications/models/zoho-application";

// N8n webhook URLs
const CREATE_WEBHOOK_URL = "https://n8n.browserautomations.com/webhook/4615d5ae-b3ba-413f-980e-a30a48be3c00";
const UPDATE_WEBHOOK_URL = "https://n8n.browserautomations.com/webhook/6519959c-2c7f-4397-978c-587e7bdb4a90";
const DELETE_WEBHOOK_URL = "https://n8n.browserautomations.com/webhook/c5aecacb-b462-4725-bca6-f7a1a80603eb"; // Reusing student delete webhook as no specific one was provided

/**
 * Create application via n8n webhook
 */
export async function createApplicationViaWebhook(applicationData: Partial<ZohoApplication>) {
  try {
    const response = await fetch(CREATE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(data.message || "Failed to create application via webhook");
    }
    
    return data;
  } catch (error) {
    console.error("Error in createApplicationViaWebhook:", error);
    throw error;
  }
}

/**
 * Update application via n8n webhook
 */
export async function updateApplicationViaWebhook(applicationData: Partial<ZohoApplication>) {
  try {
    const response = await fetch(UPDATE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(data.message || "Failed to update application via webhook");
    }
    
    return data;
  } catch (error) {
    console.error("Error in updateApplicationViaWebhook:", error);
    throw error;
  }
}

/**
 * Delete application via n8n webhook
 */
export async function deleteApplicationViaWebhook(applicationId: string) {
  try {
    const response = await fetch(DELETE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: applicationId }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(data.message || "Failed to delete application via webhook");
    }
    
    return data;
  } catch (error) {
    console.error("Error in deleteApplicationViaWebhook:", error);
    throw error;
  }
}
