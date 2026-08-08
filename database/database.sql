-- ============================================================
-- S.A.R.A. — BASE DE DATOS DEFINITIVA
-- Learning Commons
-- Supabase / PostgreSQL
--
-- ROLES:
--   user  = usuario/alumno
--   staff = bibliotecaria
--   admin = administrador
--
-- Dominio institucional:
--   @utr.edu.mx
--
-- IMPORTANTE:
-- Este script está diseñado para una instalación DESDE CERO.
-- ============================================================


-- ============================================================
-- 0. EXTENSIONES
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- 1. FUNCIONES AUXILIARES
-- ============================================================

-- ------------------------------------------------------------
-- Obtener rol del usuario autenticado
--
-- SECURITY DEFINER evita problemas de RLS al consultar
-- profiles desde las propias políticas de seguridad.
-- ------------------------------------------------------------

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;


-- ------------------------------------------------------------
-- Verificar si el usuario actual es staff o admin
-- ------------------------------------------------------------

create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('staff', 'admin')
  );
$$;


-- ------------------------------------------------------------
-- Verificar si el usuario actual es admin
-- ------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;


-- ============================================================
-- 2. PROFILES
-- ============================================================

create table public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  full_name text,
  email text unique not null,

  avatar_url text,

  -- Información académica para reportes
  "group" text,
  career text,

  role text not null default 'user'
    check (role in ('user', 'staff', 'admin')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint institutional_email
    check (lower(email) like '%@utr.edu.mx')
);


-- ============================================================
-- 3. CREACIÓN AUTOMÁTICA DEL PERFIL
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  -- Solo permite cuentas institucionales.
  if lower(new.email) not like '%@utr.edu.mx' then
    raise exception 'Solo se permiten correos institucionales @utr.edu.mx';
  end if;

  insert into public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    role
  )
  values (
    new.id,

    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.email
    ),

    lower(new.email),

    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    ),

    'user'
  )
  on conflict (id) do update
  set
    full_name = coalesce(
      excluded.full_name,
      public.profiles.full_name
    ),

    avatar_url = coalesce(
      excluded.avatar_url,
      public.profiles.avatar_url
    ),

    email = excluded.email,

    updated_at = now();

  return new;
end;
$$;


create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ============================================================
-- 4. CUBÍCULOS
-- ============================================================

create table public.cubicles (
  id uuid primary key default gen_random_uuid(),

  code text unique not null,

  name text unique not null,

  capacity integer not null default 1
    check (capacity > 0),

  status text not null default 'available'
    check (
      status in (
        'available',
        'occupied',
        'maintenance'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- Los 5 cubículos físicos/virtuales del Learning Commons.

insert into public.cubicles (
  code,
  name,
  capacity
)
values
  ('C-AFRICA',  'Africa',  1),
  ('C-ASIA',    'Asia',    1),
  ('C-AMERICA', 'America', 1),
  ('C-OCEANIA', 'Oceania', 1),
  ('C-EUROPA',  'Europa',  1);


-- ============================================================
-- 5. REGISTRO DE USO DE CUBÍCULOS
-- ============================================================

create table public.cubicle_reservations (
  id uuid primary key default gen_random_uuid(),

  cubicle_id uuid not null
    references public.cubicles(id)
    on delete restrict,

  user_id uuid not null
    references public.profiles(id)
    on delete restrict,

  -- Quién realizó el registro/asignación
  registered_by uuid not null
    references public.profiles(id)
    on delete restrict,

  start_time timestamptz not null default now(),
  end_time timestamptz,

  status text not null default 'active'
    check (
      status in (
        'active',
        'completed',
        'cancelled'
      )
    ),

  notes text,

  created_at timestamptz not null default now(),

  constraint valid_cubicle_range
    check (
      end_time is null
      or end_time > start_time
    )
);


-- ============================================================
-- 6. RECURSOS / LIBROS
-- ============================================================

create table public.resources (
  id uuid primary key default gen_random_uuid(),

  title text not null,

  author text,

  isbn text,

  description text,

  publisher text,

  published_year integer,

  cover_url text,

  google_books_id text,

  copies_total integer not null default 0
    check (copies_total >= 0),

  copies_available integer not null default 0
    check (
      copies_available >= 0
      and copies_available <= copies_total
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 7. EJEMPLARES INDIVIDUALES / CÓDIGOS DE BARRAS
-- ============================================================

create table public.book_copies (
  id uuid primary key default gen_random_uuid(),

  resource_id uuid not null
    references public.resources(id)
    on delete cascade,

  barcode text unique not null,

  status text not null default 'available'
    check (
      status in (
        'available',
        'loaned',
        'lost',
        'damaged',
        'maintenance'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 8. PRÉSTAMOS
-- ============================================================

create table public.loans (
  id uuid primary key default gen_random_uuid(),

  resource_id uuid not null
    references public.resources(id)
    on delete restrict,

  book_copy_id uuid
    references public.book_copies(id)
    on delete restrict,

  user_id uuid not null
    references public.profiles(id)
    on delete restrict,

  -- Bibliotecaria/admin que registró el préstamo
  registered_by uuid not null
    references public.profiles(id)
    on delete restrict,

  loan_date timestamptz not null default now(),

  due_date timestamptz not null,

  return_date timestamptz,

  status text not null default 'active'
    check (
      status in (
        'active',
        'returned',
        'overdue'
      )
    ),

  notes text,

  created_at timestamptz not null default now(),

  constraint valid_loan_dates
    check (
      due_date >= loan_date
    ),

  constraint valid_return_date
    check (
      return_date is null
      or return_date >= loan_date
    )
);


-- ============================================================
-- 9. VISITANTES
-- ============================================================

create table public.visitors (
  id uuid primary key default gen_random_uuid(),

  full_name text not null,

  email text,

  institution text,

  reason text,

  check_in timestamptz not null default now(),

  check_out timestamptz,

  registered_by uuid not null
    references public.profiles(id)
    on delete restrict,

  event_id uuid,

  created_at timestamptz not null default now(),

  constraint valid_visitor_times
    check (
      check_out is null
      or check_out >= check_in
    )
);


-- ============================================================
-- 10. EVENTOS
-- ============================================================

create table public.events (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  description text,

  event_type text,

  location text,

  start_time timestamptz not null,

  end_time timestamptz,

  created_by uuid not null
    references public.profiles(id)
    on delete restrict,

  created_at timestamptz not null default now(),

  constraint valid_event_range
    check (
      end_time is null
      or end_time > start_time
    )
);


-- Ahora agregamos la FK que dependía de events.

alter table public.visitors
  add constraint visitors_event_id_fkey
  foreign key (event_id)
  references public.events(id)
  on delete set null;


-- ============================================================
-- 11. ASISTENTES A EVENTOS
-- ============================================================

create table public.event_attendees (
  id uuid primary key default gen_random_uuid(),

  event_id uuid not null
    references public.events(id)
    on delete cascade,

  user_id uuid
    references public.profiles(id)
    on delete cascade,

  visitor_id uuid
    references public.visitors(id)
    on delete cascade,

  registered_at timestamptz not null default now(),

  constraint attendee_source
    check (
      (user_id is not null and visitor_id is null)
      or
      (user_id is null and visitor_id is not null)
    ),

  unique(event_id, user_id),
  unique(event_id, visitor_id)
);


-- ============================================================
-- 12. ACTIVIDADES
--
-- Esta tabla permite generar estadísticas y reportes
-- históricos sin depender únicamente del estado actual
-- de préstamos/cubículos.
-- ============================================================

create table public.activities (
  id uuid primary key default gen_random_uuid(),

  user_id uuid
    references public.profiles(id)
    on delete set null,

  visitor_id uuid
    references public.visitors(id)
    on delete set null,

  registered_by uuid
    references public.profiles(id)
    on delete set null,

  event_id uuid
    references public.events(id)
    on delete set null,

  cubicle_id uuid
    references public.cubicles(id)
    on delete set null,

  loan_id uuid
    references public.loans(id)
    on delete set null,

  service_type text not null
    check (
      service_type in (
        'cubicle',
        'loan',
        'computer',
        'language',
        'event',
        'other'
      )
    ),

  service_name text,

  description text,

  activity_date timestamptz not null default now(),

  created_at timestamptz not null default now()
);


-- ============================================================
-- 13. ÍNDICES
-- ============================================================

create index idx_profiles_role
  on public.profiles(role);

create index idx_profiles_email
  on public.profiles(email);

create index idx_profiles_career
  on public.profiles(career);

create index idx_profiles_group
  on public.profiles("group");


create index idx_cubicles_status
  on public.cubicles(status);


create index idx_reservations_cubicle
  on public.cubicle_reservations(cubicle_id);

create index idx_reservations_user
  on public.cubicle_reservations(user_id);

create index idx_reservations_start
  on public.cubicle_reservations(start_time);


create index idx_resources_title
  on public.resources(title);

create index idx_resources_author
  on public.resources(author);

create index idx_resources_isbn
  on public.resources(isbn);

create index idx_resources_google_books
  on public.resources(google_books_id);


create index idx_book_copies_resource
  on public.book_copies(resource_id);

create index idx_book_copies_barcode
  on public.book_copies(barcode);

create index idx_book_copies_status
  on public.book_copies(status);


create index idx_loans_user
  on public.loans(user_id);

create index idx_loans_resource
  on public.loans(resource_id);

create index idx_loans_copy
  on public.loans(book_copy_id);

create index idx_loans_status
  on public.loans(status);

create index idx_loans_due_date
  on public.loans(due_date);


create index idx_visitors_check_in
  on public.visitors(check_in);

create index idx_visitors_event
  on public.visitors(event_id);


create index idx_events_start
  on public.events(start_time);


create index idx_activities_user
  on public.activities(user_id);

create index idx_activities_type
  on public.activities(service_type);

create index idx_activities_occurred
  on public.activities(activity_date);

create index idx_activities_cubicle
  on public.activities(cubicle_id);


-- ============================================================
-- 14. VISTAS PARA DASHBOARD
-- ============================================================


-- ------------------------------------------------------------
-- Estado actual de cubículos
-- ------------------------------------------------------------

create or replace view public.v_dashboard_cubicles
with (security_invoker = true)
as
select
  c.id,
  c.code,
  c.name,
  c.capacity,
  c.status,
  count(cr.id) filter (
    where cr.status = 'active'
  ) as active_reservations
from public.cubicles c
left join public.cubicle_reservations cr
  on cr.cubicle_id = c.id
group by
  c.id,
  c.code,
  c.name,
  c.capacity,
  c.status;


-- ------------------------------------------------------------
-- Uso de cubículos
-- ------------------------------------------------------------

create or replace view public.v_cubicle_usage
with (security_invoker = true)
as
select
  c.id as cubicle_id,
  c.code,
  c.name,

  count(cr.id) as total_uses,

  count(cr.id) filter (
    where cr.start_time >= date_trunc('month', current_date)
  ) as uses_this_month

from public.cubicles c

left join public.cubicle_reservations cr
  on cr.cubicle_id = c.id
  and cr.status <> 'cancelled'

group by
  c.id,
  c.code,
  c.name;


-- ------------------------------------------------------------
-- Libros actualmente prestados
-- ------------------------------------------------------------

create or replace view public.v_active_loans
with (security_invoker = true)
as
select
  l.id,
  l.loan_date,
  l.due_date,
  l.status,

  r.id as resource_id,
  r.title as resource_title,
  r.author,

  bc.id as book_copy_id,
  bc.barcode,

  p.id as borrower_id,
  p.full_name as borrower_name,
  p.email as borrower_email,
  p."group" as borrower_group,
  p.career as borrower_career

from public.loans l

join public.resources r
  on r.id = l.resource_id

left join public.book_copies bc
  on bc.id = l.book_copy_id

join public.profiles p
  on p.id = l.user_id

where l.status in ('active', 'overdue');


-- ------------------------------------------------------------
-- Libros más solicitados
-- ------------------------------------------------------------

create or replace view public.v_popular_books
with (security_invoker = true)
as
select
  r.id as resource_id,
  r.title,
  r.author,

  count(l.id) as total_loans

from public.resources r

left join public.loans l
  on l.resource_id = r.id

group by
  r.id,
  r.title,
  r.author

order by total_loans desc;


-- ------------------------------------------------------------
-- Visitantes del día
-- ------------------------------------------------------------

create or replace view public.v_visitor_count_today
with (security_invoker = true)
as
select
  count(*) as total
from public.visitors
where check_in::date = current_date;


-- ============================================================
-- 15. VISTA PARA REPORTES
--
-- Permite obtener la actividad de un día específico.
--
-- Ejemplo conceptual:
--
-- SELECT *
-- FROM public.v_daily_activity_report
-- WHERE activity_date = '2026-08-05';
-- ============================================================

create or replace view public.v_daily_activity_report
with (security_invoker = true)
as
select

  a.id,

  a.activity_date::date as activity_date_only,
  a.activity_date,

  p.full_name as user_name,
  p.email as user_email,
  p."group" as user_group,
  p.career as user_career,

  v.full_name as visitor_name,

  a.service_type,
  a.service_name,
  a.description,

  c.name as cubicle,

  e.name as event_name,

  r.title as book_title,

  a.created_at

from public.activities a

left join public.profiles p
  on p.id = a.user_id

left join public.visitors v
  on v.id = a.visitor_id

left join public.cubicles c
  on c.id = a.cubicle_id

left join public.events e
  on e.id = a.event_id

left join public.loans l
  on l.id = a.loan_id

left join public.resources r
  on r.id = l.resource_id;


-- ============================================================
-- 16. ACTUALIZAR updated_at
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();


create trigger cubicles_updated_at
before update on public.cubicles
for each row
execute function public.set_updated_at();


create trigger resources_updated_at
before update on public.resources
for each row
execute function public.set_updated_at();


create trigger book_copies_updated_at
before update on public.book_copies
for each row
execute function public.set_updated_at();


-- ============================================================
-- 17. ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles
  enable row level security;

alter table public.cubicles
  enable row level security;

alter table public.cubicle_reservations
  enable row level security;

alter table public.resources
  enable row level security;

alter table public.book_copies
  enable row level security;

alter table public.loans
  enable row level security;

alter table public.visitors
  enable row level security;

alter table public.events
  enable row level security;

alter table public.event_attendees
  enable row level security;

alter table public.activities
  enable row level security;


-- ============================================================
-- 18. PROFILES RLS
-- ============================================================

-- Un usuario puede consultar su propio perfil.

create policy "users can read own profile"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
);


-- Staff/admin pueden consultar perfiles para gestionar
-- préstamos, visitantes, reportes, etc.

create policy "staff can read profiles"
on public.profiles
for select
to authenticated
using (
  public.is_staff_or_admin()
);


-- Un usuario puede actualizar solamente sus datos personales.
-- No puede cambiar su propio role.

create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
  and role = public.get_my_role()
);


-- Admin puede gestionar perfiles.

create policy "admin can manage profiles"
on public.profiles
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- ============================================================
-- 19. CUBÍCULOS RLS
-- ============================================================

-- Todos los usuarios autenticados pueden consultar
-- disponibilidad.

create policy "authenticated users can view cubicles"
on public.cubicles
for select
to authenticated
using (true);


-- Solo staff/admin modifican cubículos.

create policy "staff can manage cubicles"
on public.cubicles
for all
to authenticated
using (
  public.is_staff_or_admin()
)
with check (
  public.is_staff_or_admin()
);


-- ============================================================
-- 20. RESERVAS DE CUBÍCULOS
-- ============================================================

-- Un usuario puede consultar sus propios registros.

create policy "users can view own reservations"
on public.cubicle_reservations
for select
to authenticated
using (
  user_id = auth.uid()
);


-- Staff/admin pueden consultar todas.

create policy "staff can view reservations"
on public.cubicle_reservations
for select
to authenticated
using (
  public.is_staff_or_admin()
);


-- Solo staff/admin pueden registrar/editar/eliminar
-- asignaciones de cubículos.

create policy "staff can manage reservations"
on public.cubicle_reservations
for all
to authenticated
using (
  public.is_staff_or_admin()
)
with check (
  public.is_staff_or_admin()
);


-- ============================================================
-- 21. RECURSOS / LIBROS
-- ============================================================

-- Todos los usuarios autenticados pueden consultar libros.

create policy "authenticated users can view resources"
on public.resources
for select
to authenticated
using (true);


-- Staff/admin gestionan libros.

create policy "staff can manage resources"
on public.resources
for all
to authenticated
using (
  public.is_staff_or_admin()
)
with check (
  public.is_staff_or_admin()
);


-- ============================================================
-- 22. EJEMPLARES
-- ============================================================

create policy "authenticated users can view book copies"
on public.book_copies
for select
to authenticated
using (true);


create policy "staff can manage book copies"
on public.book_copies
for all
to authenticated
using (
  public.is_staff_or_admin()
)
with check (
  public.is_staff_or_admin()
);


-- ============================================================
-- 23. PRÉSTAMOS
-- ============================================================

-- Usuario solo puede consultar sus propios préstamos.

create policy "users can view own loans"
on public.loans
for select
to authenticated
using (
  user_id = auth.uid()
);


-- Staff/admin pueden consultar y gestionar todos.

create policy "staff can manage loans"
on public.loans
for all
to authenticated
using (
  public.is_staff_or_admin()
)
with check (
  public.is_staff_or_admin()
);


-- ============================================================
-- 24. VISITANTES
-- ============================================================

-- Los usuarios normales NO pueden consultar visitantes.

create policy "staff can view visitors"
on public.visitors
for select
to authenticated
using (
  public.is_staff_or_admin()
);


create policy "staff can manage visitors"
on public.visitors
for all
to authenticated
using (
  public.is_staff_or_admin()
)
with check (
  public.is_staff_or_admin()
);


-- ============================================================
-- 25. EVENTOS
-- ============================================================

-- Todos los usuarios autenticados pueden consultar eventos.

create policy "authenticated users can view events"
on public.events
for select
to authenticated
using (true);


-- Staff/admin gestionan eventos.

create policy "staff can manage events"
on public.events
for all
to authenticated
using (
  public.is_staff_or_admin()
)
with check (
  public.is_staff_or_admin()
);


-- ============================================================
-- 26. ASISTENTES
-- ============================================================

-- Usuario puede consultar su propia asistencia.

create policy "users can view own event attendance"
on public.event_attendees
for select
to authenticated
using (
  user_id = auth.uid()
);


-- Staff/admin pueden gestionar asistentes.

create policy "staff can manage event attendance"
on public.event_attendees
for all
to authenticated
using (
  public.is_staff_or_admin()
)
with check (
  public.is_staff_or_admin()
);


-- ============================================================
-- 27. ACTIVIDADES
-- ============================================================

-- Usuario puede consultar sus propias estadísticas.

create policy "users can view own activities"
on public.activities
for select
to authenticated
using (
  user_id = auth.uid()
);


-- Staff/admin pueden consultar todas.

create policy "staff can view activities"
on public.activities
for select
to authenticated
using (
  public.is_staff_or_admin()
);


-- Staff/admin pueden registrar actividades.

create policy "staff can manage activities"
on public.activities
for all
to authenticated
using (
  public.is_staff_or_admin()
)
with check (
  public.is_staff_or_admin()
);


-- ============================================================
-- 28. FIN
-- ============================================================
--
-- Después de ejecutar:
--
-- 1. Configurar Supabase Auth.
-- 2. Configurar Google OAuth.
-- 3. Configurar variables .env del backend.
-- 4. Probar registro @utr.edu.mx.
-- 5. Comprobar creación automática de profiles.
--
-- IMPORTANTE:
-- No se asignan roles staff/admin durante el registro.
-- Todos los registros nuevos comienzan como "user".
--
-- ============================================================