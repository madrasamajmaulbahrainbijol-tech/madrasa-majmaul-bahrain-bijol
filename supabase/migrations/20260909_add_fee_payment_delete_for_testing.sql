create or replace function public.delete_student_fee_payment(p_ledger_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only administrators can delete fee payment records.';
  end if;

  update public.student_fee_ledger
  set amount_paid = 0,
      payment_date = null,
      payment_method = null,
      receipt_number = null,
      remarks = null
  where id = p_ledger_id;

  return found;
end;
$$;

grant execute on function public.delete_student_fee_payment(uuid) to authenticated;
