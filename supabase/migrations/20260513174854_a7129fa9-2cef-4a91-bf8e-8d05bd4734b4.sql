
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  prenom text not null,
  poste text not null default '',
  email text not null default '',
  created_at timestamptz not null default now()
);

create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null default 'Autre',
  created_at timestamptz not null default now()
);

create table public.years (
  id uuid primary key default gen_random_uuid(),
  year int not null unique,
  created_at timestamptz not null default now()
);

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  destination_id uuid references public.destinations(id) on delete set null,
  destination_name text not null default '',
  mission text not null default '',
  date date not null,
  created_at timestamptz not null default now()
);

create index missions_employee_id_idx on public.missions(employee_id);
create index missions_date_idx on public.missions(date);

alter table public.employees enable row level security;
alter table public.destinations enable row level security;
alter table public.years enable row level security;
alter table public.missions enable row level security;

create policy "public read employees" on public.employees for select using (true);
create policy "public write employees" on public.employees for insert with check (true);
create policy "public update employees" on public.employees for update using (true);
create policy "public delete employees" on public.employees for delete using (true);

create policy "public read destinations" on public.destinations for select using (true);
create policy "public write destinations" on public.destinations for insert with check (true);
create policy "public update destinations" on public.destinations for update using (true);
create policy "public delete destinations" on public.destinations for delete using (true);

create policy "public read years" on public.years for select using (true);
create policy "public write years" on public.years for insert with check (true);
create policy "public update years" on public.years for update using (true);
create policy "public delete years" on public.years for delete using (true);

create policy "public read missions" on public.missions for select using (true);
create policy "public write missions" on public.missions for insert with check (true);
create policy "public update missions" on public.missions for update using (true);
create policy "public delete missions" on public.missions for delete using (true);

insert into public.destinations (name, category) values
  ('ARM - Académie Royale Militaire (Meknès)', 'École militaire'),
  ('ERA - École Royale de l''Air (Marrakech)', 'École militaire'),
  ('ERN - École Royale Navale (Casablanca)', 'École militaire'),
  ('EHM - École des Hautes Études Militaires (Kénitra)', 'École militaire'),
  ('ERSSM - École Royale du Service de Santé Militaire (Rabat)', 'École militaire'),
  ('ERG - École Royale de la Gendarmerie (Marrakech)', 'École militaire'),
  ('GIR - Groupement d''Instruction des FAR', 'École militaire'),
  ('Quartier Général FAR (Rabat)', 'État-major'),
  ('Base Aérienne de Salé', 'Base militaire'),
  ('Base Navale d''Agadir', 'Base militaire')
on conflict (name) do nothing;

insert into public.years (year) values (2026), (2025), (2024), (2023), (2022), (2021), (2020)
on conflict (year) do nothing;

insert into public.employees (nom, prenom, poste, email) values
  ('Benali', 'Sara', 'Capitaine', 's.benali@far.ma'),
  ('Haddad', 'Youssef', 'Commandant', 'y.haddad@far.ma'),
  ('Khelifi', 'Amine', 'Lieutenant', 'a.khelifi@far.ma'),
  ('Trabelsi', 'Lina', 'Major', 'l.trabelsi@far.ma');
