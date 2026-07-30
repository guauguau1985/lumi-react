-- Password-reset fallback for legacy users that were imported directly into
-- auth.users before Lumi adopted the Supabase Admin API.

create or replace function public.reset_imported_auth_password(
  p_user_id uuid,
  p_password text
)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'Service role required';
  end if;

  if p_password is null or char_length(p_password) < 8 or char_length(p_password) > 64 then
    raise exception 'Password must contain between 8 and 64 characters';
  end if;

  update auth.users
  set
    encrypted_password = extensions.crypt(
      p_password,
      extensions.gen_salt('bf')
    ),
    updated_at = now()
  where id = p_user_id;

  if not found then
    raise exception 'Auth user not found';
  end if;
end;
$$;

revoke all on function public.reset_imported_auth_password(uuid, text)
  from public, anon, authenticated;
grant execute on function public.reset_imported_auth_password(uuid, text)
  to service_role;
