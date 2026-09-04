-- ============================================================
-- EduCRM / Cosmos LC - Supabase PostgreSQL Database Schema
-- ============================================================

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- 1. Directors (Direktorlar)
create table if not exists directors (
  id                  text primary key default gen_random_uuid()::text,
  name                text not null,
  phone               text not null unique,
  password_hash       text not null,
  center_name         text,
  logo                text,
  address             text,
  theme_id            text default 'cosmos',
  custom_theme        jsonb,
  two_factor_enabled  boolean default false,
  created_at          timestamptz default now()
);

-- 2. Branches (Filiallar)
create table if not exists branches (
  id           text primary key default gen_random_uuid()::text,
  director_id  text references directors(id) on delete cascade,
  name         text not null,
  address      text,
  color        text default '#8b5cf6',
  created_at   timestamptz default now()
);

-- 3. Managers (Menejerlar / Administratorlar)
create table if not exists managers (
  id             text primary key default gen_random_uuid()::text,
  branch_ids     jsonb not null default '[]',
  name           text not null,
  phone          text not null unique,
  birth_date     date,
  address        text,
  password_hash  text not null,
  monthly_salary numeric default 0,
  rating         numeric default 0,
  allowed_pages  jsonb not null default '["home","payments","teachers","courses","groups","attendance","rooms","finance","holidays","notifications"]',
  created_at     timestamptz default now()
);

-- 4. Manager Payments / Payroll (Menejer oyliklari)
create table if not exists manager_payments (
  id             text primary key default gen_random_uuid()::text,
  manager_id     text references managers(id) on delete cascade,
  amount         numeric not null,
  month          text not null,   -- 'YYYY-MM'
  date           date not null,
  note           text,
  created_at     timestamptz default now()
);

-- 5. Teachers HR (O'qituvchilar va xodimlar)
create table if not exists teachers_hr (
  id                     text primary key default gen_random_uuid()::text,
  branch_id              text references branches(id) on delete cascade,
  name                   text not null,
  phone                  text,
  salary_type            text not null default 'percent', -- 'percent' | 'fixed' | 'per_student'
  revenue_share_percent  numeric default 0,
  fixed_salary           numeric default 0,
  per_student_salary     numeric default 0,
  rating                 numeric default 0,
  note                   text,
  gender                 text default 'male',
  birth_date             date,
  is_assistant           boolean default false,
  role                   text default 'teacher',
  type                   text,
  is_support             boolean default false,
  assigned_teacher_id    text,
  working_days           jsonb default '[]',
  working_hours          text,
  start_time             text,
  end_time               text,
  can_create_groups      boolean default true,
  can_receive_payments   boolean default true,
  password_hash          text,
  subject                text,
  color                  text default '#8b5cf6',
  photo                  text,
  created_at             timestamptz default now()
);

alter table teachers_hr add column if not exists password_hash text;
alter table teachers_hr add column if not exists subject text;
alter table teachers_hr add column if not exists color text default '#8b5cf6';
alter table teachers_hr add column if not exists photo text;
alter table teachers_hr add column if not exists per_student_salary numeric default 0;
alter table teachers_hr add column if not exists gender text default 'male';
alter table teachers_hr add column if not exists birth_date date;
alter table teachers_hr add column if not exists is_assistant boolean default false;
alter table teachers_hr add column if not exists role text default 'teacher';
alter table teachers_hr add column if not exists type text;
alter table teachers_hr add column if not exists is_support boolean default false;
alter table teachers_hr add column if not exists assigned_teacher_id text;
alter table teachers_hr add column if not exists working_days jsonb default '[]';
alter table teachers_hr add column if not exists working_hours text;
alter table teachers_hr add column if not exists start_time text;
alter table teachers_hr add column if not exists end_time text;

-- 6. Teacher Payments (O'qituvchi maoshlari va avanslari)
create table if not exists teacher_payments (
  id             text primary key default gen_random_uuid()::text,
  teacher_hr_id  text references teachers_hr(id) on delete cascade,
  type           text not null,   -- 'advance' | 'salary'
  amount         numeric not null,
  month          text not null,   -- 'YYYY-MM'
  date           date not null,
  note           text,
  created_at     timestamptz default now()
);

-- 7. Holidays (Dam olish kunlari va bayramlar)
create table if not exists holidays (
  id           text primary key default gen_random_uuid()::text,
  director_id  text references directors(id) on delete cascade,
  name         text not null,
  date         date not null,
  note         text,
  created_at   timestamptz default now()
);

-- 8. Finance (Moliya - kirim va chiqimlar)
create table if not exists finance (
  id             text primary key default gen_random_uuid()::text,
  branch_id      text references branches(id) on delete cascade,
  type           text not null,   -- 'income' | 'expense'
  amount         numeric not null,
  category       text,
  note           text,
  date           date not null,
  status         text not null default 'approved', -- 'approved' | 'pending'
  approval_mode  text,            -- 'manager' | 'director'
  expense_type   text default 'variable', -- 'variable' | 'fixed'
  payment_method text default 'naqd',     -- 'naqd' | 'plastik' | 'bank' | 'click'
  staff_id       text,
  staff_name     text,
  created_at     timestamptz default now()
);

alter table finance add column if not exists expense_type text default 'variable';
alter table finance add column if not exists payment_method text default 'naqd';
alter table finance add column if not exists staff_id text;
alter table finance add column if not exists staff_name text;

-- 9. Courses (Kurslar)
create table if not exists courses (
  id              text primary key default gen_random_uuid()::text,
  branch_id       text references branches(id) on delete cascade,
  name            text not null,
  price           numeric default 0,
  duration_months numeric default 0,
  description     text,
  color           text default '#8b5cf6',
  created_at      timestamptz default now()
);

alter table courses add column if not exists price numeric default 0;
alter table courses add column if not exists duration_months numeric default 0;
alter table courses add column if not exists description text;
alter table courses add column if not exists color text default '#8b5cf6';

-- 10. Rooms (Xonalar)
create table if not exists rooms (
  id          text primary key default gen_random_uuid()::text,
  branch_id   text references branches(id) on delete cascade,
  name        text not null,
  capacity    integer default 0,
  color       text default '#8b5cf6',
  note        text,
  created_at  timestamptz default now()
);

alter table rooms add column if not exists branch_id text references branches(id) on delete cascade;
alter table rooms add column if not exists color text default '#8b5cf6';
alter table rooms add column if not exists note text;

-- 11. Groups (Guruhlar)
create table if not exists groups (
  id                      text primary key default gen_random_uuid()::text,
  course_id               text references courses(id) on delete cascade,
  room_id                 text references rooms(id) on delete set null,
  branch_id               text references branches(id) on delete cascade,
  teacher_hr_id           text references teachers_hr(id) on delete set null,
  teacher_salary_type     text default 'percent',
  teacher_salary_percent  numeric default 0,
  teacher_salary_fixed    numeric default 0,
  name                    text not null,
  price                   numeric default 0,
  days                    jsonb default '[]',   -- e.g. ["Dushanba","Chorshanba"]
  time                    text,
  end_time                text,
  lesson_duration_minutes numeric default 60,
  duration_months         numeric default 0,
  start_date              date,
  color                   text default '#8b5cf6',
  format                  text default 'offline',
  telegram_chat_id        text,
  note                    text,
  created_at              timestamptz default now()
);

alter table groups add column if not exists branch_id text references branches(id) on delete cascade;
alter table groups add column if not exists teacher_hr_id text references teachers_hr(id) on delete set null;
alter table groups add column if not exists teacher_salary_type text default 'percent';
alter table groups add column if not exists teacher_salary_percent numeric default 0;
alter table groups add column if not exists teacher_salary_fixed numeric default 0;
alter table groups add column if not exists end_time text;
alter table groups add column if not exists lesson_duration_minutes numeric default 60;
alter table groups add column if not exists format text default 'offline';
alter table groups add column if not exists telegram_chat_id text;
alter table groups add column if not exists note text;

-- 12. Students (O'quvchilar)
create table if not exists students (
  id                text primary key default gen_random_uuid()::text,
  name              text not null,
  phone             text,
  group_ids         jsonb not null default '[]',
  group_memberships jsonb not null default '{}', -- per-group { status: trial|active|paused, activationDate, enrolledAt, notes }
  password_hash     text,
  coins             numeric default 0,
  balance           numeric default 0,
  birth_date        date,
  parent_name       text,
  parent_phone      text,
  gender            text,
  source            text,          -- "qanday kelgani"
  school_number     text,
  grade             text,
  region            text,
  district          text,
  neighborhood      text,
  street_address    text,
  status            text default 'active',
  status_note       text,
  joined_at         date default current_date,
  manager_id        text references managers(id) on delete set null,
  studied_one_week  boolean default true,
  has_contract      boolean default true,
  created_at        timestamptz default now()
);

alter table students add column if not exists password_hash text;
alter table students add column if not exists coins numeric default 0;
alter table students add column if not exists balance numeric default 0;
alter table students add column if not exists birth_date date;
alter table students add column if not exists parent_name text;
alter table students add column if not exists parent_phone text;
alter table students add column if not exists gender text;
alter table students add column if not exists source text;
alter table students add column if not exists school_number text;
alter table students add column if not exists grade text;
alter table students add column if not exists region text;
alter table students add column if not exists district text;
alter table students add column if not exists neighborhood text;
alter table students add column if not exists street_address text;
alter table students add column if not exists status text default 'active';
alter table students add column if not exists status_note text;
alter table students add column if not exists group_memberships jsonb not null default '{}';
alter table students add column if not exists joined_at date default current_date;
alter table students add column if not exists manager_id text references managers(id) on delete set null;
alter table students add column if not exists studied_one_week boolean default true;
alter table students add column if not exists has_contract boolean default true;

-- 13. Teacher Accounts
create table if not exists teacher_account (
  id             text primary key default gen_random_uuid()::text,
  name           text not null,
  phone          text unique,
  password_hash  text,
  subject        text,
  color          text default '#8b5cf6',
  photo          text,
  created_at     timestamptz default now()
);

-- 14. Tasks (Vazifalar va topshiriqlar)
create table if not exists tasks (
  id           text primary key default gen_random_uuid()::text,
  group_id     text references groups(id) on delete cascade,
  title        text not null,
  description  text,
  due_date     date,
  attachment   jsonb,
  submissions  jsonb not null default '{}',
  created_at   timestamptz default now()
);

-- 15. Postponed (Qoldirilgan / ko'chirilgan darslar)
create table if not exists postponed (
  id             text primary key default gen_random_uuid()::text,
  group_id       text references groups(id) on delete cascade,
  original_date  date not null,
  new_date       date not null,
  note           text,
  created_at     timestamptz default now()
);

-- 16. App Settings
create table if not exists app_settings (
  id              text primary key default 'default',
  coin_settings   jsonb not null default '{"5":2,"4":1,"3":0,"2":0,"1":0}'
);
insert into app_settings (id) values ('default') on conflict (id) do nothing;

-- 17. Attendance (Davomat)
create table if not exists attendance (
  id          text primary key default gen_random_uuid()::text,
  group_id    text references groups(id) on delete cascade,
  date        date not null,
  records     jsonb not null default '{}', -- { [studentId]: { status, reason } }
  locked      boolean default false,
  created_at  timestamptz default now()
);

-- 18. Payments (O'quvchi to'lovlari)
create table if not exists payments (
  id                 text primary key default gen_random_uuid()::text,
  student_id         text references students(id) on delete cascade,
  group_id           text references groups(id) on delete cascade,
  amount             numeric not null,
  paid_amount        numeric default 0,
  used_balance       numeric default 0,
  surplus_to_balance numeric default 0,
  discount           numeric default 0,
  discount_reason    text,
  debt               numeric default 0,
  debt_due_date      date,
  method             text not null default 'cash',  -- 'cash' | 'card'
  date               date not null,
  month              text not null,  -- 'YYYY-MM'
  note               text,
  created_at         timestamptz default now()
);

alter table payments add column if not exists paid_amount numeric default 0;
alter table payments add column if not exists used_balance numeric default 0;
alter table payments add column if not exists surplus_to_balance numeric default 0;
alter table payments add column if not exists discount numeric default 0;
alter table payments add column if not exists discount_reason text;
alter table payments add column if not exists debt numeric default 0;
alter table payments add column if not exists debt_due_date date;
alter table payments add column if not exists note text;

-- 19. Coin System Settings
create table if not exists coin_settings (
  id              text primary key default 'default',
  active          boolean default true,
  coin_value      numeric default 100,      -- "1 coin = necha so'm"
  expiry_days     integer default 0,        -- 0 = unlimited
  rules           jsonb not null default '{
    "attendance": 5,
    "homework": 3,
    "test_70_89": 8,
    "test_90_plus": 15,
    "on_time_payment": 20
  }',
  tiers           jsonb not null default '{
    "bronze": {"min": 0, "color": "#CD7F32"},
    "silver": {"min": 100, "color": "#C0C0C0"},
    "gold": {"min": 300, "color": "#FFD700"},
    "platinum": {"min": 600, "color": "#E5E4E2"}
  }'
);
insert into coin_settings (id) values ('default') on conflict (id) do nothing;

-- 20. Coin Transactions (Koinlar tarixi)
create table if not exists coin_transactions (
  id          text primary key default gen_random_uuid()::text,
  student_id  text references students(id) on delete cascade,
  amount      integer not null,             -- + earned, - spent
  reason      text not null,                -- "Darsga qatnashish", "Muddatida to'lov"...
  date        date not null,
  created_at  timestamptz default now()
);

-- 21. Center Settings (Markaz sozlamalari)
create table if not exists center_settings (
  id              text primary key default 'default',
  director_id     text references directors(id) on delete cascade,
  primary_phone   text,
  secondary_phone text,
  address         text,
  telegram        text,
  instagram       text,
  website         text,
  work_days       jsonb default '["Dushanba","Seshanba","Chorshanba","Payshanba","Juma","Shanba"]',
  work_start      text default '09:00',
  work_end        text default '21:00',
  created_at      timestamptz default now()
);
insert into center_settings (id, director_id) values ('default', null) on conflict (id) do nothing;

-- 22. SMS Settings
create table if not exists sms_settings (
  id                  text primary key default 'default',
  provider            text default 'eskiz',     -- 'eskiz' | 'smsxabar'
  smsxabar_login      text,
  smsxabar_password   text,
  smsxabar_originator text,
  eskiz_email         text,
  eskiz_password      text,
  active              boolean default false,
  created_at          timestamptz default now()
);
insert into sms_settings (id) values ('default') on conflict (id) do nothing;

-- 23. SMS Templates
create table if not exists sms_templates (
  id          text primary key default gen_random_uuid()::text,
  trigger     text not null,                -- 'absent', 'late', 'payment_due'...
  name        text not null,
  template    text not null,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- 24. Employee Attendance (Xodimlar davomati)
create table if not exists employee_attendance (
  id            text primary key default gen_random_uuid()::text,
  branch_id     text references branches(id) on delete cascade,
  employee_type text not null,              -- 'manager' | 'teacher'
  employee_id   text not null,
  date          date not null,
  status        text not null default 'present', -- 'present' | 'absent' | 'late'
  check_in      timestamptz,
  check_out     timestamptz,
  created_at    timestamptz default now()
);

-- 25. Leads (Marketing lidlar)
create table if not exists leads (
  id                  text primary key default gen_random_uuid()::text,
  director_id         text references directors(id) on delete cascade,
  branch_id           text references branches(id) on delete cascade,
  name                text not null,
  phone               text not null,
  source              text,                          -- 'form', 'instagram', 'facebook', 'referral'...
  status              text not null default 'new',   -- 'new' | 'contacted' | 'trial' | 'came' | 'student' | 'lost'
  note                text,
  form_id             text,
  course_id           text,
  enrolled_group_id   text,
  enrolled_group_name text,
  phone2              text,
  grade               text,
  comments            jsonb default '[]',
  rejection_reason    text,
  rejection_note      text,
  target_date         date,
  created_at          timestamptz default now()
);

alter table leads add column if not exists course_id text;
alter table leads add column if not exists enrolled_group_id text;
alter table leads add column if not exists enrolled_group_name text;
alter table leads add column if not exists phone2 text;
alter table leads add column if not exists grade text;
alter table leads add column if not exists comments jsonb default '[]';
alter table leads add column if not exists rejection_reason text;
alter table leads add column if not exists rejection_note text;
alter table leads add column if not exists target_date date;

-- 26. Lead Forms (Marketing formalar)
create table if not exists lead_forms (
  id          text primary key default gen_random_uuid()::text,
  director_id text references directors(id) on delete cascade,
  name        text not null,
  fields      jsonb default '["name","phone"]',
  active      boolean default true,
  created_at  timestamptz default now()
);

-- 27. Notifications (Xabarnomalar)
create table if not exists notifications (
  id          text primary key default gen_random_uuid()::text,
  director_id text references directors(id) on delete cascade,
  user_type   text not null,                -- 'director' | 'manager' | 'teacher'
  user_id     text,
  message     text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

-- 28. Archive (Arxiv)
create table if not exists archive (
  id          text primary key default gen_random_uuid()::text,
  entity_type text not null,                -- 'student' | 'group' | 'payment' | 'lead' | 'course'
  entity_id   text not null,
  data        jsonb not null,
  archived_at timestamptz default now()
);

-- 29. Expense Categories (Xarajat turlari / bo'limlari)
create table if not exists expense_categories (
  id           text primary key default gen_random_uuid()::text,
  name         text not null,
  all_branches boolean not null default true,
  branch_ids   jsonb not null default '[]',
  created_at   timestamptz default now()
);

-- 30. Expense Plans (Xarajatlarni rejalashtirish / limitlar)
create table if not exists expense_plans (
  id             text primary key default gen_random_uuid()::text,
  category       text not null,
  amount         numeric not null default 0,
  payment_method text default 'all',
  month          text not null, -- 'YYYY-MM'
  staff_id       text default 'all',
  staff_name     text default 'Barcha xodimlar',
  branch_id      text,
  note           text,
  created_at     timestamptz default now()
);

-- ============================================================
-- Row Level Security & Policies
-- ============================================================

alter table directors           enable row level security;
alter table branches            enable row level security;
alter table managers            enable row level security;
alter table manager_payments    enable row level security;
alter table teachers_hr         enable row level security;
alter table teacher_payments    enable row level security;
alter table holidays            enable row level security;
alter table finance             enable row level security;
alter table courses             enable row level security;
alter table rooms               enable row level security;
alter table groups              enable row level security;
alter table students            enable row level security;
alter table attendance          enable row level security;
alter table payments            enable row level security;
alter table teacher_account     enable row level security;
alter table tasks               enable row level security;
alter table postponed           enable row level security;
alter table app_settings        enable row level security;
alter table coin_settings       enable row level security;
alter table coin_transactions   enable row level security;
alter table center_settings     enable row level security;
alter table sms_settings        enable row level security;
alter table sms_templates       enable row level security;
alter table employee_attendance enable row level security;
alter table leads               enable row level security;
alter table lead_forms          enable row level security;
alter table notifications       enable row level security;
alter table archive             enable row level security;
alter table expense_categories  enable row level security;
alter table expense_plans       enable row level security;

do $$
declare t text;
begin
  for t in select unnest(array[
    'directors','branches','managers','manager_payments','teachers_hr','teacher_payments',
    'holidays','finance','courses','rooms','groups','students','attendance','payments',
    'teacher_account','tasks','postponed','app_settings','coin_settings','coin_transactions',
    'center_settings','sms_settings','sms_templates','employee_attendance','leads',
    'lead_forms','notifications','archive','expense_categories','expense_plans'
  ])
  loop
    execute format('drop policy if exists "dev_open_all" on %I;', t);
    execute format('create policy "dev_open_all" on %I for all using (true) with check (true);', t);
  end loop;
end $$;
