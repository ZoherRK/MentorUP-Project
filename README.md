# 🎓 MentorUP

Plataforma de clases particulares que conecta alumnos con profesores.  
**Stack:** Laravel 10 (API REST + Sanctum) · React 18 + Vite (SPA)

---

## Requisitos

| Herramienta | Versión mínima |
|-------------|---------------|
| PHP         | 8.1           |
| Composer    | 2.x           |
| MySQL       | 8.0 (o MariaDB 10.6) |
| Node.js     | 18.x          |
| npm         | 9.x           |

---

## 🚀 Instalación paso a paso

### 1 — Clonar el proyecto

```bash
git clone <URL_DEL_REPOSITORIO> mentorUP
cd mentorUP
```

---

### 2 — Configurar el backend (Laravel)

```bash
cd backend

# Instalar dependencias PHP
composer install

# Copiar el fichero de entorno
cp .env.example .env

# Generar la clave de aplicación
php artisan key:generate
```

**Edita `.env`** y ajusta las variables de base de datos:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mentorup        # Crea esta BD antes de migrar
DB_USERNAME=root
DB_PASSWORD=tu_password
```

> **Crea la base de datos** en MySQL:
> ```sql
> CREATE DATABASE mentorup CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> ```

**Ejecutar migraciones y seeders:**

```bash
# Crear todas las tablas
php artisan migrate

# Crear el administrador por defecto + datos de demo
php artisan db:seed
```

Las credenciales del admin se leen del `.env` (defaults):

| Campo    | Valor               |
|----------|---------------------|
| Email    | admin@mentorup.test |
| Password | Admin1234!          |

Datos de demo creados por `DemoDataSeeder`:

| Rol      | Email                     | Password  |
|----------|---------------------------|-----------|
| Alumno   | alumno@mentorup.test      | Demo1234! |
| Profesor | profesor@mentorup.test    | Demo1234! |

**Arrancar el servidor backend:**

```bash
php artisan serve
# Disponible en http://localhost:8000
```

La página de inicio (Blade) estará en: **http://localhost:8000/inicio**

---

### 3 — Configurar el frontend (React + Vite)

```bash
# Desde la raíz del proyecto
cd frontend

# Instalar dependencias JS
npm install

# Copiar el fichero de entorno
cp .env.example .env
```

El `.env` por defecto ya apunta a `http://localhost:8000/api`.  
No necesitas cambiarlo en desarrollo local.

**Arrancar el servidor de desarrollo:**

```bash
npm run dev
# Disponible en http://localhost:5173
```

---

## 📁 Estructura del proyecto

```
mentorUP/
├── backend/                 # Laravel 10
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php       # register, login, logout, me
│   │   │   │   ├── AnuncioController.php    # CRUD anuncios
│   │   │   │   ├── ReservaController.php    # CRUD reservas
│   │   │   │   ├── ValoracionController.php # crear valoración
│   │   │   │   └── AdminController.php      # panel admin completo
│   │   │   └── Middleware/
│   │   │       └── EsAdmin.php              # guard de rol admin
│   │   └── Models/
│   │       ├── Usuario.php    # auth principal (HasApiTokens)
│   │       ├── Alumno.php
│   │       ├── Profesor.php
│   │       ├── Admin.php
│   │       ├── Anuncio.php
│   │       ├── Reserva.php
│   │       └── Valoracion.php
│   ├── database/
│   │   ├── migrations/       # 12 migraciones limpias y ordenadas
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php
│   │       ├── AdminSeeder.php    # crea el admin desde .env
│   │       └── DemoDataSeeder.php # datos de prueba (solo local)
│   ├── routes/
│   │   ├── api.php            # todas las rutas API REST
│   │   └── web.php            # / → /inicio, /inicio (blade)
│   └── resources/views/
│       └── inicio.blade.php   # home page con referencia a la API
│
└── frontend/                # React 18 + Vite
    └── src/
        ├── App.jsx            # router + AuthContext
        ├── main.jsx
        ├── index.css
        ├── services/
        │   └── api.js         # cliente centralizado de la API
        ├── components/
        │   └── Navbar.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Registro.jsx
            ├── Anuncios.jsx       # listado con filtros
            ├── DetalleAnuncio.jsx # detalle + formulario de reserva
            ├── MiPerfil.jsx       # reservas + anuncios (profesor)
            ├── AdminLogin.jsx
            └── AdminDashboard.jsx # panel admin completo
```

---

## 🔌 API REST — Referencia rápida

Base URL: `http://localhost:8000/api`

### Auth
| Método | Ruta       | Auth | Descripción         |
|--------|------------|------|---------------------|
| POST   | /register  | —    | Crear cuenta        |
| POST   | /login     | —    | Iniciar sesión      |
| POST   | /logout    | ✅   | Cerrar sesión       |
| GET    | /me        | ✅   | Usuario autenticado |

### Anuncios
| Método | Ruta             | Auth      | Descripción            |
|--------|------------------|-----------|------------------------|
| GET    | /anuncios        | —         | Listar (con filtros)   |
| GET    | /anuncios/{id}   | —         | Detalle                |
| POST   | /anuncios        | Profesor  | Crear                  |
| PUT    | /anuncios/{id}   | Profesor  | Editar                 |
| DELETE | /anuncios/{id}   | Profesor  | Desactivar             |

**Filtros disponibles** en `GET /anuncios`:
- `?asignatura=Matemáticas`
- `?ciudad=Madrid`
- `?precio_max=30`
- `?nivel=bachillerato`

### Reservas
| Método | Ruta                       | Auth   | Descripción    |
|--------|----------------------------|--------|----------------|
| GET    | /reservas                  | ✅     | Mis reservas   |
| POST   | /reservas                  | Alumno | Crear          |
| POST   | /reservas/{id}/cancelar    | ✅     | Cancelar       |
| PUT    | /reservas/{id}/confirmar   | Profe  | Confirmar      |
| PUT    | /reservas/{id}/completar   | Profe  | Completar      |

### Admin (requiere rol admin)
| Método | Ruta                            | Descripción               |
|--------|---------------------------------|---------------------------|
| GET    | /admin/stats                    | Estadísticas              |
| GET    | /admin/anuncios                 | Todos los anuncios        |
| PUT    | /admin/anuncios/{id}/verificar  | Aprobar / rechazar        |
| DELETE | /admin/anuncios/{id}            | Eliminar                  |
| GET    | /admin/alumnos                  | Listar alumnos            |
| GET    | /admin/profesores               | Listar profesores         |
| PUT    | /admin/usuarios/{id}/bloquear   | Bloquear / desbloquear    |
| DELETE | /admin/usuarios/{id}            | Eliminar usuario          |

---

## 🔐 Roles y permisos

| Rol      | Puede hacer                                                |
|----------|------------------------------------------------------------|
| Alumno   | Buscar anuncios, crear reservas, dejar valoraciones        |
| Profesor | Publicar/editar anuncios, confirmar/completar reservas     |
| Admin    | Todo lo anterior + gestión completa de usuarios y anuncios |

El rol se determina automáticamente por la tabla relacionada:
- `alumnos.usuario_id` → rol `alumno`
- `profesores.usuario_id` → rol `profesor`
- `admins.usuario_id` → rol `admin`

---

## ⚡ Comandos útiles

```bash
# Backend
php artisan migrate:fresh --seed   # Reiniciar BD con datos de demo
php artisan route:list             # Ver todas las rutas
php artisan tinker                 # REPL interactivo

# Frontend
npm run dev    # Servidor de desarrollo
npm run build  # Build de producción → dist/
npm run preview  # Previsualizar el build
```

---

## 🐛 Solución de problemas

**Error CORS en el navegador**  
Verifica que `SANCTUM_STATEFUL_DOMAINS` y `FRONTEND_URL` en `.env` coincidan con la URL del frontend (por defecto `localhost:5173`).

**Error 401 en todas las peticiones protegidas**  
Asegúrate de que el token se envía en la cabecera:  
`Authorization: Bearer <token>`

**`php artisan migrate` falla**  
Verifica que la base de datos existe y que las credenciales en `.env` son correctas.

**Las valoraciones no se guardan**  
Solo se puede valorar un anuncio después de que la reserva esté en estado `completada`.
