# Changelog

## [2026-02-20] - Update Sign Up Link - Changed the Sign Up link in the login page from `https://studyinturkiye.com/became-an-agent/` to `https://www.checkuni.com/became-an-agent`
## [2026-02-20] - Update Webhook URLs - Changed all n8n webhook URLs from `automation.sitconnect.net` to `https://automation.checkuni.com/webhook-test/c0679d76-4492-48ea-b4c7-44aec8ae1cd1` across `zoho-students-actions.ts`, `zoho-applications-actions.ts`, and `attachments/download/route.ts`
## [2026-02-20] - Fix Login Issue (Multiple GoTrueClient) - Fixed `supabase-server-client.ts` to use a singleton pattern instead of creating a new Supabase client on every call, resolving the login reload/redirect failure. Also fixed leftover `sitconnect.net` webhook URL in `auth-service.ts`.
## [2026-02-20] - Fix Login Redirect Loop - Fixed redirect loop in `AuthContext.tsx` where `signOut()` in the catch block caused an infinite loop when GraphQL fetch failed in the deployed Docker container.
## [2026-02-20] - Update Individual Webhook URLs - Assigned dedicated n8n workflow URLs for Create Student, Create Application, Upload Attachment, and Download Attachment. Cleared unused Edit/Delete webhook URLs.
## [2026-02-21] - Fix File Upload (saveFile) - Changed `supabase/actions/save-file.ts` to use service role client (`supabase`) instead of anon client (`supabaseClient`) to fix file uploads returning incomplete URLs.
## [2026-02-21] - Fix Download Attachment Webhook - Updated `app/api/attachments/download/route.ts` webhook URL to the correct n8n workflow (`13eca8cf-8742-4351-9ae6-eaace4fa10ce`).
