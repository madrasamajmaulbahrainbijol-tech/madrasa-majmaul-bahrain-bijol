alter table public.student_fee_ledger
  add column if not exists paid_by_admin_id uuid,
  add column if not exists paid_by_admin_name text,
  add column if not exists paid_by_admin_email text;

create index if not exists idx_student_fee_ledger_paid_by_admin on public.student_fee_ledger(paid_by_admin_id);

create or replace function public.track_student_fee_payment_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_name text;
  v_email text;
begin
  if new.amount_paid is distinct from old.amount_paid
     or new.payment_date is distinct from old.payment_date
     or new.payment_method is distinct from old.payment_method
     or new.receipt_number is distinct from old.receipt_number
     or new.remarks is distinct from old.remarks then
    if coalesce(new.amount_paid,0) > 0 then
      select au.name, au.email into v_name, v_email
      from public.admin_users au
      where au.user_id = v_user and au.active = true
      limit 1;
      new.paid_by_admin_id := v_user;
      new.paid_by_admin_name := coalesce(v_name, 'Admin');
      new.paid_by_admin_email := v_email;
    else
      new.paid_by_admin_id := null;
      new.paid_by_admin_name := null;
      new.paid_by_admin_email := null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_student_fee_payment_admin on public.student_fee_ledger;
create trigger trg_student_fee_payment_admin
before update on public.student_fee_ledger
for each row execute function public.track_student_fee_payment_admin();

comment on column public.student_fee_ledger.paid_by_admin_name is 'Admin who last entered or changed the active fee payment.';
comment on column public.student_fee_ledger.paid_by_admin_email is 'Email of the admin who last entered or changed the active fee payment.';
comment on table public.student_fee_settings is 'Student monthly fee history. Add a new effective_from entry whenever the fee changes, including annual revisions.';
comment on table public.staff_salary_settings is 'Staff salary history. Add a new effective_from entry whenever the salary changes, including annual revisions.';
