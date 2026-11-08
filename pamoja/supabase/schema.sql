-- Run in Supabase SQL Editor. New project recommended.
create extension if not exists pgcrypto;
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,full_name text,email text,avatar_url text,currency text not null default 'KES',created_at timestamptz not null default now());
create table public.groups(id uuid primary key default gen_random_uuid(),name text not null check(length(name) between 1 and 80),description text,currency text not null default 'KES',created_by uuid not null references public.profiles(id),created_at timestamptz not null default now());
create table public.group_members(group_id uuid not null references public.groups(id) on delete cascade,user_id uuid not null references public.profiles(id) on delete cascade,joined_at timestamptz not null default now(),primary key(group_id,user_id));
create table public.expenses(id uuid primary key default gen_random_uuid(),group_id uuid not null references public.groups(id) on delete cascade,title text not null,amount numeric(14,2) not null check(amount>0),paid_by uuid not null references public.profiles(id),expense_date date not null default current_date,category text not null default 'Other',notes text,receipt_path text,created_by uuid not null default auth.uid() references public.profiles(id),created_at timestamptz not null default now());
create table public.expense_splits(id uuid primary key default gen_random_uuid(),expense_id uuid not null references public.expenses(id) on delete cascade,user_id uuid not null references public.profiles(id),amount numeric(14,2) not null check(amount>=0),unique(expense_id,user_id));
create table public.settlements(id uuid primary key default gen_random_uuid(),group_id uuid not null references public.groups(id) on delete cascade,from_user uuid not null references public.profiles(id),to_user uuid not null references public.profiles(id),amount numeric(14,2) not null check(amount>0),note text,created_by uuid not null default auth.uid() references public.profiles(id),created_at timestamptz not null default now(),check(from_user<>to_user));
create table public.invitations(id uuid primary key default gen_random_uuid(),group_id uuid not null references public.groups(id) on delete cascade,token uuid not null default gen_random_uuid() unique,email text,created_by uuid not null default auth.uid() references public.profiles(id),expires_at timestamptz not null default(now()+interval '14 days'),created_at timestamptz not null default now());
create index on public.expenses(group_id,expense_date desc);create index on public.settlements(group_id);create index on public.group_members(user_id);create index on public.invitations(token);
create function public.is_member(g uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.group_members where group_id=g and user_id=(select auth.uid()))$$;
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$begin insert into public.profiles(id,full_name,email) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)),new.email);return new;end$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create function public.add_creator() returns trigger language plpgsql security definer set search_path='' as $$begin insert into public.group_members(group_id,user_id) values(new.id,new.created_by);return new;end$$;
create trigger group_created after insert on public.groups for each row execute function public.add_creator();
create function public.check_expense() returns trigger language plpgsql security definer set search_path='' as $$declare g uuid;begin select group_id into g from public.expenses where id=new.expense_id;if not exists(select 1 from public.group_members where group_id=g and user_id=new.user_id) then raise exception 'Split participant is not a group member';end if;return new;end$$;
create trigger split_member before insert or update on public.expense_splits for each row execute function public.check_expense();
create function public.check_expense_payer() returns trigger language plpgsql security definer set search_path='' as $$begin if not exists(select 1 from public.group_members where group_id=new.group_id and user_id=new.paid_by) then raise exception 'Payer is not a group member';end if;return new;end$$;
create trigger payer_member before insert or update on public.expenses for each row execute function public.check_expense_payer();
create function public.check_settlement_members() returns trigger language plpgsql security definer set search_path='' as $$begin if not exists(select 1 from public.group_members where group_id=new.group_id and user_id=new.from_user) or not exists(select 1 from public.group_members where group_id=new.group_id and user_id=new.to_user) then raise exception 'Both people must be members';end if;return new;end$$;
create trigger settlement_members before insert or update on public.settlements for each row execute function public.check_settlement_members();
-- Atomic expense insert; verifies split total and group membership.
create function public.create_expense(p_group uuid,p_title text,p_amount numeric,p_paid_by uuid,p_date date,p_category text,p_notes text,p_splits jsonb,p_receipt text default null) returns uuid language plpgsql security definer set search_path='' as $$declare eid uuid; item jsonb; total numeric:=0; n integer:=0;begin
 if not public.is_member(p_group) then raise exception 'Not a member';end if;
 if p_amount<=0 or p_amount>999999999999 then raise exception 'Invalid amount';end if;
 if not exists(select 1 from public.group_members where group_id=p_group and user_id=p_paid_by) then raise exception 'Invalid payer';end if;
 if jsonb_typeof(p_splits)<>'array' then raise exception 'Invalid splits';end if;
 for item in select value from jsonb_array_elements(p_splits) loop
  if not exists(select 1 from public.group_members where group_id=p_group and user_id=(item->>'user_id')::uuid) then raise exception 'Invalid participant';end if;
  total:=total+(item->>'amount')::numeric;n:=n+1;
 end loop;
 if n=0 or round(total,2)<>round(p_amount,2) then raise exception 'Split total must equal expense amount';end if;
 insert into public.expenses(group_id,title,amount,paid_by,expense_date,category,notes,receipt_path,created_by) values(p_group,p_title,p_amount,p_paid_by,p_date,p_category,p_notes,p_receipt,auth.uid()) returning id into eid;
 for item in select value from jsonb_array_elements(p_splits) loop insert into public.expense_splits(expense_id,user_id,amount) values(eid,(item->>'user_id')::uuid,(item->>'amount')::numeric);end loop;
 return eid;
end$$;
-- Invite acceptance does not expose tokens to unauthenticated users.
create function public.accept_invite(p_token uuid) returns uuid language plpgsql security definer set search_path='' as $$declare inv public.invitations%rowtype;begin
 if auth.uid() is null then raise exception 'Please log in';end if;
 select * into inv from public.invitations where token=p_token and expires_at>now();if not found then raise exception 'Invite invalid or expired';end if;
 if inv.email is not null and lower(inv.email)<>lower(coalesce((select email from auth.users where id=auth.uid()),'')) then raise exception 'This invitation is for another email address';end if;
 insert into public.group_members(group_id,user_id) values(inv.group_id,auth.uid()) on conflict do nothing;
 return inv.group_id;
end$$;
-- Revoke public function execution by default and explicitly grant to authenticated users.
revoke all on function public.create_expense(uuid,text,numeric,uuid,date,text,text,jsonb,text) from public,anon;
grant execute on function public.create_expense(uuid,text,numeric,uuid,date,text,text,jsonb,text) to authenticated;
revoke all on function public.accept_invite(uuid) from public,anon;
grant execute on function public.accept_invite(uuid) to authenticated;
alter table public.profiles enable row level security;alter table public.groups enable row level security;alter table public.group_members enable row level security;alter table public.expenses enable row level security;alter table public.expense_splits enable row level security;alter table public.settlements enable row level security;alter table public.invitations enable row level security;
create policy "profiles view" on public.profiles for select to authenticated using(id=auth.uid() or exists(select 1 from public.group_members gm where gm.user_id=profiles.id and public.is_member(gm.group_id)));
create policy "profiles update own" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy "groups view" on public.groups for select to authenticated using(public.is_member(id));
create policy "groups create" on public.groups for insert to authenticated with check(created_by=auth.uid());
create policy "groups edit" on public.groups for update to authenticated using(created_by=auth.uid()) with check(created_by=auth.uid());
create policy "members view" on public.group_members for select to authenticated using(public.is_member(group_id));
create policy "expenses view" on public.expenses for select to authenticated using(public.is_member(group_id));
create policy "expenses create" on public.expenses for insert to authenticated with check(public.is_member(group_id) and created_by=auth.uid());
create policy "expenses delete" on public.expenses for delete to authenticated using(public.is_member(group_id) and (created_by=auth.uid() or exists(select 1 from public.groups g where g.id=group_id and g.created_by=auth.uid())));
create policy "splits view" on public.expense_splits for select to authenticated using(exists(select 1 from public.expenses e where e.id=expense_id and public.is_member(e.group_id)));
create policy "splits create" on public.expense_splits for insert to authenticated with check(exists(select 1 from public.expenses e where e.id=expense_id and public.is_member(e.group_id)));
create policy "settlements view" on public.settlements for select to authenticated using(public.is_member(group_id));
create policy "settlements create" on public.settlements for insert to authenticated with check(public.is_member(group_id) and created_by=auth.uid() and (from_user=auth.uid() or to_user=auth.uid()));
create policy "settlements delete" on public.settlements for delete to authenticated using(public.is_member(group_id) and created_by=auth.uid());
create policy "invites view" on public.invitations for select to authenticated using(public.is_member(group_id));
create policy "invites create" on public.invitations for insert to authenticated with check(public.is_member(group_id) and created_by=auth.uid());
create policy "invites delete" on public.invitations for delete to authenticated using(public.is_member(group_id) and created_by=auth.uid());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('receipts','receipts',false,5242880,array['image/jpeg','image/png','image/webp','application/pdf']) on conflict(id) do nothing;
create policy "receipt read group" on storage.objects for select to authenticated using(bucket_id='receipts' and public.is_member((split_part(name,'/',1))::uuid));
create policy "receipt upload group" on storage.objects for insert to authenticated with check(bucket_id='receipts' and public.is_member((split_part(name,'/',1))::uuid));
create policy "receipt delete own" on storage.objects for delete to authenticated using(bucket_id='receipts' and owner_id=auth.uid()::text);
