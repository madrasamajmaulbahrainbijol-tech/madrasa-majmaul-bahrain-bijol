create or replace function public.ensure_student_fee_ledger(p_admission_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_admission_date date;
  v_start_month date;
  v_month date;
  v_fee numeric(10,2);
begin
  select coalesce(a.admission_date, a.approved_at::date, a.created_at::date)
    into v_admission_date
  from public.admissions a
  where a.id = p_admission_id;

  if v_admission_date is null then
    return;
  end if;

  v_start_month := date_trunc('month', v_admission_date)::date;

  delete from public.student_fee_ledger
  where admission_id = p_admission_id
    and fee_month < v_start_month;

  v_month := v_start_month;

  while v_month <= date_trunc('month', current_date)::date loop
    select s.monthly_fee
      into v_fee
    from public.student_fee_settings s
    where s.admission_id = p_admission_id
      and date_trunc('month', s.effective_from)::date <= v_month
    order by s.effective_from desc, s.created_at desc
    limit 1;

    if v_fee is not null then
      insert into public.student_fee_ledger(admission_id, fee_month, amount_due)
      values(p_admission_id, v_month, v_fee)
      on conflict(admission_id, fee_month) do update
      set amount_due = case
        when public.student_fee_ledger.amount_paid = 0 then excluded.amount_due
        else public.student_fee_ledger.amount_due
      end,
      updated_at = now();
    end if;

    v_month := (v_month + interval '1 month')::date;
  end loop;
end;
$$;
