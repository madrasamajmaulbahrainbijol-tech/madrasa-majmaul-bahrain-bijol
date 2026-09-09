create table if not exists public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid unique,
  joining_date date not null,
  active boolean not null default true,
  last_working_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_profiles_teacher_id_fkey foreign key (teacher_id) references public.teachers(id) on delete set null,
  constraint staff_profiles_dates_check check (last_working_date is null or last_working_date >= joining_date)
);

create table if not exists public.staff_salary_settings (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff_profiles(id) on delete cascade,
  monthly_salary numeric(12,2) not null check (monthly_salary >= 0),
  effective_from date not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_salary_ledger (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff_profiles(id) on delete cascade,
  salary_month date not null,
  amount_due numeric(12,2) not null default 0 check (amount_due >= 0),
  amount_paid numeric(12,2) not null default 0 check (amount_paid >= 0),
  payment_date date,
  payment_method text,
  receipt_number text unique,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(staff_id, salary_month)
);

create index if not exists idx_staff_salary_ledger_month on public.staff_salary_ledger(salary_month);
create index if not exists idx_staff_salary_ledger_staff on public.staff_salary_ledger(staff_id);
create index if not exists idx_staff_salary_settings_staff_effective on public.staff_salary_settings(staff_id, effective_from desc);

alter table public.staff_profiles enable row level security;
alter table public.staff_salary_settings enable row level security;
alter table public.staff_salary_ledger enable row level security;

drop policy if exists "Admins can manage staff profiles" on public.staff_profiles;
drop policy if exists "Admins can manage staff salary settings" on public.staff_salary_settings;
drop policy if exists "Admins can manage staff salary ledger" on public.staff_salary_ledger;

create policy "Admins can manage staff profiles" on public.staff_profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage staff salary settings" on public.staff_salary_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage staff salary ledger" on public.staff_salary_ledger for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.ensure_staff_salary_ledger(p_staff_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_joining_date date;
  v_last_working_date date;
  v_month date;
  v_end_month date;
  v_salary numeric(12,2);
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select joining_date, last_working_date into v_joining_date, v_last_working_date from public.staff_profiles where id = p_staff_id;
  if v_joining_date is null then return; end if;
  v_month := date_trunc('month', v_joining_date)::date;
  v_end_month := date_trunc('month', coalesce(v_last_working_date, current_date))::date;

  delete from public.staff_salary_ledger
   where staff_id = p_staff_id and salary_month < v_month;
  if v_last_working_date is not null then
    delete from public.staff_salary_ledger
     where staff_id = p_staff_id and salary_month > v_end_month;
  end if;

  while v_month <= v_end_month loop
    select s.monthly_salary into v_salary
      from public.staff_salary_settings s
     where s.staff_id = p_staff_id
       and date_trunc('month', s.effective_from)::date <= v_month
     order by s.effective_from desc, s.created_at desc
     limit 1;
    if v_salary is not null then
      insert into public.staff_salary_ledger(staff_id, salary_month, amount_due)
      values(p_staff_id, v_month, v_salary)
      on conflict(staff_id, salary_month) do update
        set amount_due = case when public.staff_salary_ledger.amount_paid = 0 then excluded.amount_due else public.staff_salary_ledger.amount_due end,
            updated_at = now();
    end if;
    v_month := (v_month + interval '1 month')::date;
  end loop;
end;
$$;

grant execute on function public.ensure_staff_salary_ledger(uuid) to authenticated;
