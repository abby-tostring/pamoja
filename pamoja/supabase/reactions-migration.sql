-- Run once AFTER schema.sql in Supabase SQL Editor.
-- Reactions are only visible to members of the expense's group.
create table if not exists public.expense_reactions (
 expense_id uuid not null references public.expenses(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 emoji text not null check (emoji in ('🤡','💸','🔥','🫶')),
 created_at timestamptz not null default now(),
 primary key (expense_id,user_id)
);
alter table public.expense_reactions enable row level security;
create policy "group members read reactions" on public.expense_reactions for select to authenticated
 using (exists(select 1 from public.expenses e where e.id=expense_id and public.is_member(e.group_id)));
create policy "members add own reactions" on public.expense_reactions for insert to authenticated
 with check(user_id=auth.uid() and exists(select 1 from public.expenses e where e.id=expense_id and public.is_member(e.group_id)));
create policy "members edit own reactions" on public.expense_reactions for update to authenticated
 using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "members remove own reactions" on public.expense_reactions for delete to authenticated
 using(user_id=auth.uid());
