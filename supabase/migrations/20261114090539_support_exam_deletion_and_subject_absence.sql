-- Exam deletion is intentionally cascading only for records linked through master_exam_id.
-- Legacy student_exams rows with master_exam_id IS NULL remain untouched.
alter table public.student_exams
  drop constraint if exists student_exams_master_exam_id_fkey;
alter table public.student_exams
  add constraint student_exams_master_exam_id_fkey
  foreign key (master_exam_id) references public.exams(id) on delete cascade;

alter table public.student_exams
  add column if not exists result_status text not null default 'Pending';
alter table public.student_exams
  drop constraint if exists student_exams_result_status_check;
alter table public.student_exams
  add constraint student_exams_result_status_check
  check (result_status in ('Pending', 'Pass', 'Fail', 'Incomplete'));

alter table public.student_exam_marks
  alter column obtained_marks drop not null;
alter table public.student_exam_marks
  alter column obtained_marks drop default;
alter table public.student_exam_marks
  add column if not exists attendance_status text not null default 'Present';
alter table public.student_exam_marks
  drop constraint if exists student_exam_marks_result_status_check;
alter table public.student_exam_marks
  add constraint student_exam_marks_result_status_check
  check (result_status in ('Pass', 'Fail', 'Absent'));
alter table public.student_exam_marks
  drop constraint if exists student_exam_marks_attendance_status_check;
alter table public.student_exam_marks
  add constraint student_exam_marks_attendance_status_check
  check (attendance_status in ('Present', 'Absent'));

update public.student_exams se
set result_status = case
  when exists (
    select 1 from public.student_exam_marks m
    where m.exam_id = se.id and m.result_status = 'Absent'
  ) then 'Incomplete'
  when exists (
    select 1 from public.student_exam_marks m
    where m.exam_id = se.id and m.result_status = 'Fail'
  ) then 'Fail'
  when exists (
    select 1 from public.student_exam_marks m
    where m.exam_id = se.id
  ) then 'Pass'
  else 'Pending'
end;

create or replace function public.save_exam_results(p_master_exam_id uuid, p_results jsonb)
returns integer
language plpgsql
security invoker
set search_path = public, pg_temp
as $function$
declare
  v_exam public.exams%rowtype;
  v_result jsonb;
  v_mark jsonb;
  v_admission_id uuid;
  v_student_exam_id uuid;
  v_subject public.exam_subjects%rowtype;
  v_obtained numeric;
  v_pct numeric;
  v_count integer := 0;
  v_expected integer;
  v_received integer;
  v_unique integer;
  v_attendance text;
  v_has_absent boolean;
  v_has_fail boolean;
  v_absent_subjects text[];
  v_final_status text;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  select * into v_exam
  from public.exams
  where id = p_master_exam_id and active = true;
  if not found then raise exception 'Please select an active exam'; end if;

  if jsonb_typeof(p_results) <> 'array' or jsonb_array_length(p_results) = 0 then
    raise exception 'No student marks were submitted';
  end if;

  select count(*) into v_expected
  from public.exam_subjects
  where exam_id = p_master_exam_id;
  if v_expected = 0 then raise exception 'This exam has no subjects'; end if;

  for v_result in select value from jsonb_array_elements(p_results)
  loop
    v_admission_id := (v_result->>'admission_id')::uuid;

    if not exists (
      select 1 from public.admissions
      where id = v_admission_id
        and status = 'approved'
        and account_status = 'approved'
    ) then
      raise exception 'Every result must belong to an approved and active student';
    end if;

    if jsonb_typeof(v_result->'marks') <> 'array' then
      raise exception 'Marks are missing for one or more students';
    end if;

    select count(*), count(distinct value->>'subject_id')
      into v_received, v_unique
    from jsonb_array_elements(v_result->'marks');

    if v_received <> v_expected or v_unique <> v_expected then
      raise exception 'Choose Present or Absent for every subject exactly once';
    end if;

    insert into public.student_exams(
      admission_id, exam_type, exam_name, exam_date, session,
      remarks, master_exam_id, result_status
    )
    values (
      v_admission_id, 'annual', v_exam.exam_name, v_exam.exam_date,
      v_exam.session, null, v_exam.id, 'Pending'
    )
    on conflict (master_exam_id, admission_id) where master_exam_id is not null
    do update set
      exam_type = excluded.exam_type,
      exam_name = excluded.exam_name,
      exam_date = excluded.exam_date,
      session = excluded.session,
      updated_at = now()
    returning id into v_student_exam_id;

    delete from public.student_exam_marks
    where exam_id = v_student_exam_id;

    v_has_absent := false;
    v_has_fail := false;
    v_absent_subjects := array[]::text[];

    for v_mark in select value from jsonb_array_elements(v_result->'marks')
    loop
      select * into v_subject
      from public.exam_subjects
      where id = (v_mark->>'subject_id')::uuid
        and exam_id = p_master_exam_id;

      if not found then raise exception 'Invalid subject for the selected exam'; end if;

      v_attendance := case
        when upper(btrim(coalesce(v_mark->>'attendance_status', 'PRESENT'))) = 'ABSENT' then 'Absent'
        when upper(btrim(coalesce(v_mark->>'attendance_status', 'PRESENT'))) = 'PRESENT' then 'Present'
        else null
      end;

      if v_attendance is null then
        raise exception 'Subject attendance must be Present or Absent';
      end if;

      if v_attendance = 'Absent' then
        v_obtained := null;
        v_has_absent := true;
        v_absent_subjects := array_append(v_absent_subjects, v_subject.subject);
        insert into public.student_exam_marks(
          exam_id, subject, max_marks, obtained_marks, grade,
          result_status, attendance_status, remarks
        )
        values (
          v_student_exam_id, v_subject.subject, v_subject.full_marks,
          null, 'AB', 'Absent', 'Absent', null
        );
      else
        if nullif(btrim(coalesce(v_mark->>'obtained_marks', '')), '') is null then
          raise exception 'Obtained marks are required for present students in subject %', v_subject.subject;
        end if;

        v_obtained := (v_mark->>'obtained_marks')::numeric;
        if v_obtained < 0 or v_obtained > v_subject.full_marks then
          raise exception 'Obtained marks for % must be between zero and full marks', v_subject.subject;
        end if;

        v_pct := (v_obtained / v_subject.full_marks) * 100;
        if v_obtained < v_subject.passing_marks then
          v_has_fail := true;
        end if;

        insert into public.student_exam_marks(
          exam_id, subject, max_marks, obtained_marks, grade,
          result_status, attendance_status, remarks
        )
        values (
          v_student_exam_id, v_subject.subject, v_subject.full_marks,
          v_obtained,
          case when v_pct >= 90 then 'A+'
               when v_pct >= 80 then 'A'
               when v_pct >= 70 then 'B+'
               when v_pct >= 60 then 'B'
               when v_pct >= 50 then 'C'
               when v_pct >= 40 then 'D'
               else 'F' end,
          case when v_obtained >= v_subject.passing_marks then 'Pass' else 'Fail' end,
          'Present',
          null
        );
      end if;
    end loop;

    v_final_status := case
      when v_has_absent then 'Incomplete'
      when v_has_fail then 'Fail'
      else 'Pass'
    end;

    update public.student_exams
    set result_status = v_final_status,
        remarks = case
          when v_has_absent then 'Absent in: ' || array_to_string(v_absent_subjects, ', ')
          else null
        end,
        updated_at = now()
    where id = v_student_exam_id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$function$;

revoke all on function public.save_exam_results(uuid, jsonb) from public, anon;
grant execute on function public.save_exam_results(uuid, jsonb) to authenticated;
