create or replace function public.ensure_student_fee_ledger(p_admission_id uuid)
returns void
language plpgsql
set search_path = public
as $function$
declare
  v_start date;
  v_month date;
  v_fee numeric(10,2);
begin
  select greatest(
    coalesce(date_trunc('month', approved_at)::date, date_trunc('month', created_at)::date),
    coalesce(
      (select min(date_trunc('month', s.effective_from)::date)
       from public.student_fee_settings s
       where s.admission_id = p_admission_id and s.active = true),
      date_trunc('month', current_date)::date
    )
  ) into v_start
  from public.admissions where id = p_admission_id;
  if v_start is null then return; end if;
  v_month := v_start;
  while v_month <= date_trunc('month', current_date)::date loop
    select s.monthly_fee into v_fee
    from public.student_fee_settings s
    where s.admission_id = p_admission_id
      and s.active = true
      and date_trunc('month', s.effective_from)::date <= v_month
    order by s.effective_from desc, s.created_at desc limit 1;
    if v_fee is not null then
      insert into public.student_fee_ledger(admission_id, fee_month, amount_due)
      values(p_admission_id, v_month, v_fee)
      on conflict(admission_id, fee_month) do update
      set amount_due = case when public.student_fee_ledger.amount_paid = 0 then excluded.amount_due else public.student_fee_ledger.amount_due end,
          updated_at = now();
    end if;
    v_month := (v_month + interval '1 month')::date;
  end loop;
end;
$function$;
