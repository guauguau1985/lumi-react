-- Supabase Auth expects token columns to contain an empty string rather than
-- NULL. The first Lumi child accounts were inserted by a legacy SQL bootstrap,
-- so Auth returned "Database error querying schema" before checking passwords.

update auth.users
set
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change = coalesce(email_change, ''),
  phone_change = coalesce(phone_change, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  reauthentication_token = coalesce(reauthentication_token, ''),
  raw_app_meta_data = coalesce(
    raw_app_meta_data,
    '{"provider":"email","providers":["email"]}'::jsonb
  ),
  raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb),
  is_sso_user = coalesce(is_sso_user, false),
  is_anonymous = coalesce(is_anonymous, false),
  aud = coalesce(aud, 'authenticated'),
  role = coalesce(role, 'authenticated'),
  updated_at = now()
where
  confirmation_token is null
  or recovery_token is null
  or email_change_token_new is null
  or email_change is null
  or phone_change is null
  or phone_change_token is null
  or email_change_token_current is null
  or reauthentication_token is null
  or raw_app_meta_data is null
  or raw_user_meta_data is null
  or is_sso_user is null
  or is_anonymous is null
  or aud is null
  or role is null;
