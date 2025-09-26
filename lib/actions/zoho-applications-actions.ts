"use server";

import { ZohoApplication } from "@/types/types";

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

/**
 * Trigger n8n to download an attachment for an application.
 * Looks up attachment id from public.zoho_attachments by module_id = applicationId
 */
export async function downloadApplicationAttachment(applicationId: string, type:string) {
  console.log("🚀 ~ downloadApplicationAttachment ~ type:", type)
  console.log("🚀 ~ downloadApplicationAttachment ~ applicationId:", applicationId)
  try {
    const webhookUrl = "https://n8n.browserautomations.com/webhook/13eca8cf-8742-4351-9ae6-eaace4fa10ce";
    // Query Supabase for an attachment linked to this application
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/zoho_attachments?module_id=eq.${applicationId}&select=id,name`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      cache: 'no-store'
    });
    if (!res.ok) {
      throw new Error(`Attachment lookup failed: ${res.status}`);
    }
    const rows: { id: string, name: string }[] = await res.json();
    console.log("🚀 ~ downloadApplicationAttachment ~ rows:", rows)
    const attachmentId = rows?.find((row) => row.name === type)?.id;
    console.log("🚀 ~ downloadApplicationAttachment ~ attachmentId:", attachmentId)

    const payload = {
      id: attachmentId || applicationId, // fallback to record id if none stored yet
      module_id: applicationId,
    };

    const webhookRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log("🚀 ~ downloadApplicationAttachment ~ webhookRes:", webhookRes)
    if (!webhookRes.ok) {
      throw new Error(`n8n download webhook failed: ${webhookRes.status}`);
    }
    const webhookData = await webhookRes.json();
    console.log("🚀 ~ downloadApplicationAttachment ~ webhookData:", webhookData)
    return webhookData;
  } catch (error) {
    console.error('Error in downloadApplicationAttachment:', error);
    throw error;
  }
}