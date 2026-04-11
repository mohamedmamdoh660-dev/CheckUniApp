# Changelog

All notable changes to this project will be documented in this file.

## [2026-04-10] - Change Development Port - Updated dev script and documentation to use port 5050 instead of 3010

## [2026-04-10] - Environment Variables Setup - Added Supabase and Resend API keys to .env.local file

## [2026-04-10] - Login Page UI Fixes - Updated signup link to checkuni.com and fixed checkbox visibility in light mode

## [2026-04-10] - UI Bug Fix - Explicitly configured checked state colors (background, border, text) for the "Remember me" checkbox to correct visibility issues upon selection

## [2026-04-10] - Console Errors Fix - Added suppressHydrationWarning to body tag in root layout to prevent mismatch errors caused by browser extensions, and implemented a Singleton pattern for the Supabase browser client to prevent "Multiple GoTrueClient instances" warnings

## [2026-04-11] - Authentication Bug Fixes - Resolved the infinite reload loop upon successful login by unifying the divergent Supabase client instances (localStorage vs Cookies) into a single SSR-compatible cookies browser client, and dynamically injected the active session token into the GraphQL backend `executeGraphQLBackend` fetch headers to ensure RLS compliance. Also resolved the `undefined/api/graphql` fetch error by adding `NEXT_PUBLIC_APP_URL` to `.env.local`.

## [2026-04-11] - DataTable Skeleton HTML Fix - Fixed invalid HTML nesting error where `<TableCell>` (`<td>`) was being rendered inside a `<div>` in `data-table-skeleton.tsx`. Replaced with a plain `<div>` row to comply with HTML spec and eliminate the hydration error.

## [2026-04-11] - Input Component Fix - Fixed "uncontrolled to controlled" React warning by normalizing `undefined` value to `""` in both `Input` component variants (`components/input.tsx` and `components/ui/input.tsx`). This eliminates the warning globally across all usages without needing to add `|| ""` to every individual input.

## [2026-04-11] - Key Prop Fix - Fixed "Each child in a list should have a unique key prop" React warning in `student-detail-page.tsx`. Changed `key={a.app_id}` (which could be `undefined` or duplicate) to `key={a.id || a.app_id || \`app-row-${index}\`}` for a guaranteed unique key.

## [2026-04-11] - Webhook URL Update - Updated the attachment download n8n webhook URL in `app/api/attachments/download/route.ts` from `automation.sitconnect.net` to `automation.checkuni.com`.

## [2026-04-11] - TypeScript Build Errors Fix - Fixed multiple implicit `any` type errors blocking the production build. Added explicit `any` type annotations to `(payload: any)` in Supabase realtime subscriptions, `(row: any)`, `(cell: any)` in CSV/Excel export mappings, and iterators in `db-actions.ts` and `utils` helper functions.
