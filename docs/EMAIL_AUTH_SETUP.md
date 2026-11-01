# Email/password release checklist

V3 replaces the in-app ChatGPT sign-in entry with Supabase-managed email accounts. The public `/` route is an introduction; `/workspace` and `/reset-password` validate the session server-side before rendering. Workspace data APIs also verify the user independently and scope database operations to that user ID.

## Required provider setup
1. Connect an authorised Supabase account and select/create the project intended for UtsavOps.
2. Set the exact project URL and publishable API key as server environment variables `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. Do not use a service-role key.
3. Set `PUBLIC_APP_URL` to the actual deployed origin.
4. Enable email/password accounts, require email confirmation, and set the password policy to at least 10 characters.
5. Configure Site URL and allow the exact `/auth/callback` URLs for signup and password recovery. Recovery uses `?next=/reset-password`; normal confirmation uses `?next=/workspace`.
6. Configure and verify email sending. Supabase default SMTP is for limited development use; production registration/recovery needs appropriate sender/domain configuration and delivery testing.
7. Exercise registration → confirmation → login → private order save/reload → logout → password-reset email → new password → login. Verify an old password fails afterward and other accounts cannot access the saved event.

## Safeguards
- Official Supabase SDK manages hashing, verification, sessions and recovery tokens; the app does not store raw passwords.
- Session cookies are HTTP-only, SameSite Lax and secure in production.
- PKCE email callback exchanges the code server-side. Only `/workspace` or `/reset-password` can be used as callback destinations.
- Protected-route proxy refreshes verified sessions. Server data APIs revalidate the identity.
- Password reset requests do not reveal account existence. Provider errors are not reported as successful email delivery.
- Missing provider settings disable auth submission explicitly; no fake accounts or fallback ChatGPT login are offered.
- Existing records under legacy ChatGPT user IDs are retained and are not automatically reassigned based on an unverified email.

## Release status
Code, forms and route gates implemented. Provider configuration and real email-delivery verification remain pending. Do not replace the working production login with V3 until the provider and recovery flow pass verification.
