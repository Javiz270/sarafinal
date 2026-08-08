# S.A.R.A. — Sistema de Administración y Registro Académico

Sistema web para la administración de servicios de un Learning Commons / biblioteca universitaria.

---

## Arquitectura

```
React (Frontend)
      ↓
FastAPI REST API (Backend)
      ↓
Supabase / PostgreSQL (Base de datos)
```

```
sara/
├── frontend/          React + Vite + TypeScript
├── backend/           Python + FastAPI
└── README.md
```

---

## Stack Tecnológico

### Frontend
| Tecnología | Propósito |
|---|---|
| React 19 | Interfaz de usuario |
| Vite | Build tool / dev server |
| TypeScript | Tipado estático |
| React Router | Enrutamiento SPA |
| Supabase JS | Autenticación client-side |
| CSS Custom Properties | Design system |

### Backend
| Tecnología | Propósito |
|---|---|
| Python 3.11+ | Lenguaje del servidor |
| FastAPI | Framework REST API |
| Pydantic | Validación de datos |
| Supabase (Python) | Conexión a base de datos |
| python-jose | Verificación JWT |
| httpx | Cliente HTTP (Google Books) |
| openpyxl | Generación de reportes Excel |

### Base de datos / Auth
| Tecnología | Propósito |
|---|---|
| Supabase | Backend-as-a-Service |
| PostgreSQL | Base de datos relacional |
| Supabase Auth | Autenticación |
| Google OAuth | Login con Google |

### Despliegue
| Tecnología | Propósito |
|---|---|
| Railway | Hosting (frontend + backend) |

---

## Funcionalidades

- ✅ Autenticación (correo + Google OAuth)
- ✅ Roles: user, staff, admin
- ✅ Dashboard por rol
- ✅ Gestión de cubículos (5 continentes)
- ✅ Búsqueda de libros (Google Books API)
- ✅ Gestión de ejemplares con código de barras
- ✅ Préstamos y devoluciones
- ✅ Registro de visitantes
- ✅ Eventos y asistentes
- ✅ Registro de actividades/servicios
- ✅ Reportes con exportación a Excel
- ✅ Estadísticas y métricas
- ✅ Interfaz responsive con animaciones
- ✅ Loading states y manejo de errores

---

## Instalación Local

### Requisitos
- **Node.js** 18+
- **Python** 3.11+
- **Cuenta de Supabase** con proyecto configurado

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd sara
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env
# Editar .env con tus valores de Supabase
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### 3. Backend
```bash
cd backend
cp .env.example .env
# Editar .env con tus valores de Supabase y API keys

# Crear entorno virtual
python -m venv .venv

# Activar entorno virtual
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
uvicorn app.main:app --reload
```

El backend estará disponible en `http://localhost:8000`

Documentación API: `http://localhost:8000/api/docs`

---

## Variables de Entorno

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### Backend (`.env`)
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
SUPABASE_JWT_SECRET=tu-jwt-secret
GOOGLE_BOOKS_API_KEY=tu-google-books-api-key
FRONTEND_URL=http://localhost:5173
```

> ⚠️ **NUNCA** subas el archivo `.env` al repositorio. Usa `.env.example` como referencia.

---

## Configuración de Supabase

### Tablas existentes
- `profiles` — Perfiles de usuario
- `cubicles` — Cubículos del Learning Commons
- `cubicle_reservations` — Historial de uso de cubículos
- `resources` — Libros/recursos bibliográficos
- `book_copies` — Ejemplares físicos
- `loans` — Préstamos
- `visitors` — Visitantes
- `events` — Eventos
- `event_attendees` — Asistentes a eventos
- `activities` — Registro de actividades/servicios

### Vistas
- `v_active_loans` — Préstamos activos
- `v_cubicle_usage` — Uso de cubículos
- `v_dashboard_cubicles` — Estado de cubículos para dashboard
- `v_popular_books` — Libros más solicitados
- `v_visitor_count_today` — Visitantes del día

### Google OAuth
1. Configurar OAuth en Google Cloud Console
2. Agregar los redirect URIs de Supabase
3. Configurar las credenciales en Supabase Auth → Providers → Google

### Dominio institucional
El sistema valida que los correos institucionales pertenezcan al dominio `@utr.edu.mx`.

---

## API REST

La documentación interactiva está disponible en `/api/docs` (Swagger UI).

### Endpoints principales
| Ruta | Descripción |
|---|---|
| `GET /api/health` | Health check |
| `/api/auth/*` | Autenticación |
| `/api/users/*` | Gestión de usuarios |
| `/api/cubicles/*` | Cubículos |
| `/api/books/*` | Libros y búsqueda |
| `/api/book-copies/*` | Ejemplares |
| `/api/loans/*` | Préstamos |
| `/api/visitors/*` | Visitantes |
| `/api/events/*` | Eventos |
| `/api/activities/*` | Actividades |
| `/api/reports/*` | Reportes |
| `/api/dashboard/*` | Dashboard |

---

## Despliegue en Railway

### Estructura en Railway
```
Railway Project
├── sara-frontend (servicio)
└── sara-backend  (servicio)
```

### Configuración por servicio

**Backend:**
- Root Directory: `/backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Variables de entorno: Ver sección anterior

**Frontend:**
- Root Directory: `/frontend`
- Build: `npm run build`
- Start: Servir la carpeta `dist/`
- Variables de entorno: Las `VITE_*`

---

## Licencia

MIT
