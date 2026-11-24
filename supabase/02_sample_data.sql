-- HR Task Tracker: sample data (24 tasks + lists)
-- Run AFTER 01_schema.sql. Safe to run again: lists skip duplicates, and tasks
-- are only inserted when the tasks table is empty.

insert into public.list_items (kind, name) values
  ('members', 'Rahim Uddin'),
  ('members', 'Nusrat Jahan'),
  ('members', 'Tanvir Ahmed'),
  ('members', 'Farzana Akter'),
  ('members', 'Sabbir Hossain'),
  ('members', 'Mehedi Hasan'),
  ('members', 'Sharmin Sultana'),
  ('members', 'Arif Chowdhury'),
  ('members', 'Jannatul Ferdous'),
  ('members', 'Kamrul Islam'),
  ('members', 'Rifat Karim'),
  ('members', 'Tania Rahman'),
  ('assigners', 'Managing Director'),
  ('assigners', 'GM, HR & Admin'),
  ('assigners', 'Director Operations'),
  ('assigners', 'Head of Compliance'),
  ('assigners', 'CFO'),
  ('functions', 'HR Analytics'),
  ('functions', 'Policy & SOP'),
  ('functions', 'Automation / IT'),
  ('functions', 'Compensation & Payroll'),
  ('functions', 'Branding & Communication'),
  ('functions', 'Admin & Facilities'),
  ('functions', 'Recruitment'),
  ('functions', 'Process Development'),
  ('functions', 'Training & Development'),
  ('functions', 'KPI Project (P2P)')
on conflict do nothing;

do $$
begin
  if exists (select 1 from public.tasks) then
    raise notice 'tasks table is not empty - sample tasks were skipped';
    return;
  end if;
  insert into public.tasks
    (task, assigned_date, assigned_by, job_function, due_date, completion_date,
     assigned_to_1, assigned_to_2, assigned_to_3, priority, pct, remarks)
  values
    ('Finalize Q4 KPI scorecards for all departments', '2026-01-07', 'Managing Director', 'KPI Project (P2P)', '2026-01-14', '2026-01-15', 'Sharmin Sultana', '', '', 'Medium', 100, 'Closed with delay'),
    ('ISO 9001 internal audit preparation', '2026-01-22', 'Head of Compliance', 'Policy & SOP', '2026-01-27', '2026-01-24', 'Jannatul Ferdous', '', '', 'Medium', 100, 'Closed'),
    ('Annual salary increment matrix review', '2026-02-02', 'CFO', 'Compensation & Payroll', '2026-02-07', '2026-02-03', 'Jannatul Ferdous', '', '', 'High', 100, 'Closed'),
    ('Recruit Sr. Merchandiser (2 positions)', '2026-02-18', 'GM, HR & Admin', 'Recruitment', '2026-03-05', '2026-03-05', 'Sharmin Sultana', '', '', 'Medium', 100, 'Closed'),
    ('Update HR policy manual – leave section', '2026-03-03', 'GM, HR & Admin', 'Policy & SOP', '2026-03-10', '2026-03-07', 'Jannatul Ferdous', 'Nusrat Jahan', '', 'Medium', 100, 'Closed'),
    ('Conduct psychometric assessment for new hires', '2026-03-17', 'Managing Director', 'Recruitment', '2026-04-01', '2026-04-06', 'Rifat Karim', '', '', 'Medium', 100, 'Closed with delay'),
    ('Prepare monthly HR analytics report', '2026-03-27', 'Head of Compliance', 'HR Analytics', '2026-04-11', null, 'Farzana Akter', 'Arif Chowdhury', 'Jannatul Ferdous', 'High', 60, 'Follow-up required'),
    ('Fire safety drill & compliance documentation', '2026-04-13', 'GM, HR & Admin', 'Admin & Facilities', '2026-04-27', '2026-04-24', 'Mehedi Hasan', 'Sabbir Hossain', '', 'Low', 100, 'Closed'),
    ('Revise job descriptions – Production dept.', '2026-04-27', 'CFO', 'Process Development', '2026-05-07', '2026-05-04', 'Jannatul Ferdous', 'Arif Chowdhury', 'Mehedi Hasan', 'High', 100, 'Closed'),
    ('Onboarding program for management trainees', '2026-05-06', 'Head of Compliance', 'Training & Development', '2026-05-21', '2026-05-17', 'Sharmin Sultana', 'Tanvir Ahmed', '', 'Medium', 100, 'Closed'),
    ('Employee engagement survey rollout', '2026-05-25', 'Director Operations', 'Branding & Communication', '2026-05-30', '2026-06-04', 'Jannatul Ferdous', 'Kamrul Islam', '', 'Low', 100, 'Closed with delay'),
    ('Payroll audit – October', '2026-06-05', 'Managing Director', 'Compensation & Payroll', '2026-06-20', null, 'Arif Chowdhury', 'Nusrat Jahan', '', 'Medium', 40, 'Follow-up required'),
    ('Training needs analysis 2027', '2026-06-16', 'Head of Compliance', 'Training & Development', '2026-07-07', '2026-07-13', 'Tania Rahman', 'Sabbir Hossain', 'Kamrul Islam', 'High', 100, 'Closed with delay'),
    ('Buyer social compliance audit readiness', '2026-07-01', 'Managing Director', 'Policy & SOP', '2026-07-06', '2026-07-05', 'Arif Chowdhury', '', '', 'Medium', 100, 'Closed'),
    ('Update employee database in HRIS', '2026-07-19', 'Managing Director', 'Automation / IT', '2026-07-29', '2026-07-27', 'Tanvir Ahmed', 'Farzana Akter', 'Sharmin Sultana', 'Medium', 100, 'Closed'),
    ('Exit interview analysis – Q3', '2026-07-29', 'Director Operations', 'HR Analytics', '2026-08-12', null, 'Jannatul Ferdous', 'Sabbir Hossain', 'Tanvir Ahmed', 'Medium', 75, 'Follow-up required'),
    ('Design competency framework for supervisors', '2026-08-14', 'Managing Director', 'KPI Project (P2P)', '2026-08-28', '2026-08-26', 'Mehedi Hasan', 'Rifat Karim', '', 'High', 100, 'Closed'),
    ('Festival bonus calculation & approval', '2026-08-23', 'GM, HR & Admin', 'Compensation & Payroll', '2026-08-30', null, 'Rifat Karim', 'Farzana Akter', 'Rahim Uddin', 'Medium', 50, 'Follow-up required'),
    ('Workers'' welfare committee meeting minutes', '2026-09-07', 'CFO', 'Admin & Facilities', '2026-09-17', '2026-09-18', 'Rahim Uddin', 'Tanvir Ahmed', '', 'Medium', 100, 'Closed with delay'),
    ('Renew trade licence & factory licence', '2026-09-19', 'CFO', 'Admin & Facilities', '2026-11-25', null, 'Jannatul Ferdous', 'Kamrul Islam', 'Rahim Uddin', 'Low', 25, 'On track'),
    ('Performance appraisal calibration meeting', '2026-10-05', 'Head of Compliance', 'KPI Project (P2P)', '2026-12-01', null, 'Sharmin Sultana', 'Tania Rahman', 'Nusrat Jahan', 'Low', 90, 'On track'),
    ('Prepare 2027 manpower budget', '2026-10-15', 'Director Operations', 'HR Analytics', '2026-12-07', null, 'Nusrat Jahan', 'Farzana Akter', '', 'Urgent', 0, 'On track'),
    ('Grievance handling procedure refresh', '2026-11-02', 'Managing Director', 'Policy & SOP', '2026-11-28', null, 'Nusrat Jahan', 'Rahim Uddin', '', 'Medium', 30, 'On track'),
    ('Absenteeism trend analysis – sewing floor', '2026-11-13', 'Director Operations', 'HR Analytics', '2026-12-12', null, 'Rahim Uddin', 'Nusrat Jahan', 'Farzana Akter', 'High', 0, 'On track');
end $$;

select (select count(*) from public.tasks) as tasks,
       (select count(*) from public.list_items) as list_items;
