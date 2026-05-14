# 📖 Guía Paso a Paso — MentorUP

Esta guía te explica exactamente qué hacer para arrancar el proyecto desde cero.

---

## ✅ Requisitos que debes tener instalados

| Programa    | Versión mínima | Cómo comprobarlo         |
|-------------|----------------|--------------------------|
| Node.js     | 18+            | `node --version`         |
| PHP         | 8.2+           | `php --version`          |
| Composer    | 2+             | `composer --version`     |
| MySQL       | 8+             | Abriendo phpMyAdmin      |

---

## 🗄️ PASO 1 — Crear la base de datos

1. Abre **phpMyAdmin** o tu cliente de MySQL favorito
2. Crea una base de datos llamada `mentorup`
3. Anota tu usuario y contraseña de MySQL

---

## ⚙️ PASO 2 — Configurar y arrancar el Backend (Laravel)

Abre una terminal y ejecuta estos comandos **uno por uno**:

```bash
# Entramos a la carpeta del backend
cd mentorup/backend

# Instalamos las dependencias de PHP (tarda un par de minutos)
composer install

# Copiamos el archivo de configuración
cp .env.example .env

# IMPORTANTE: Abre el archivo .env y cambia estos valores:
#   DB_DATABASE=mentorup
#   DB_USERNAME=root          ← tu usuario MySQL
#   DB_PASSWORD=              ← tu contraseña MySQL

# Generamos la clave secreta de la app
php artisan key:generate

# Creamos todas las tablas en la base de datos
php artisan migrate

# Insertamos datos de prueba (profesores y alumnos de ejemplo)
php artisan db:seed

# Arrancamos el servidor
php artisan serve
```

✅ Si todo va bien, verás: `INFO  Server running on [http://127.0.0.1:8000]`

---

## 🖥️ PASO 3 — Arrancar el Frontend (React)

Abre **otra terminal** (sin cerrar la del backend) y ejecuta:

```bash
# Entramos a la carpeta del frontend
cd mentorup/frontend

# Instalamos las dependencias de JavaScript
npm install

# Arrancamos el servidor de desarrollo
npm run dev
```

✅ Si todo va bien, verás: `Local: http://localhost:5173/`

---

## 🌐 PASO 4 — Abrir la aplicación

Abre tu navegador y ve a: **http://localhost:5173**

---

## 👤 Cuentas de prueba (creadas con el seeder)

| Rol      | Email                    | Contraseña   |
|----------|--------------------------|--------------|
| Profesor | carlos@mentorup.com      | password123  |
| Alumna   | maria@mentorup.com       | password123  |

---

## 🧩 Estructura de archivos explicada

### Frontend (React)

```
frontend/src/
├── main.jsx          ← Punto de entrada (no tocar)
├── App.jsx           ← Define las rutas de la app
├── index.css         ← Estilos globales y variables de color
├── services/
│   └── api.js        ← TODAS las llamadas al backend van aquí
├── components/
│   ├── Navbar.jsx    ← Barra de navegación (aparece en todas las páginas)
│   └── AnuncioCard.jsx ← Tarjeta de anuncio reutilizable
└── pages/
    ├── Home.jsx          ← Página principal
    ├── Login.jsx         ← Formulario de login
    ├── Registro.jsx      ← Formulario de registro
    ├── Anuncios.jsx      ← Listado de profesores
    ├── DetalleAnuncio.jsx ← Detalle + formulario de reserva
    └── MiPerfil.jsx      ← Perfil del usuario
```

### Backend (Laravel)

```
backend/
├── .env                  ← Configuración (BD, etc.) — NO subir a Git
├── routes/api.php        ← URLs de la API
├── app/
│   ├── Models/           ← Representan las tablas de la BD
│   │   ├── Usuario.php
│   │   ├── Alumno.php
│   │   ├── Profesor.php
│   │   ├── Anuncio.php
│   │   ├── Reserva.php
│   │   └── Valoracion.php
│   └── Http/Controllers/ ← Lógica de negocio
│       ├── AuthController.php      ← Login y registro
│       ├── AnuncioController.php   ← CRUD de anuncios
│       ├── ReservaController.php   ← Gestión de reservas
│       └── ValoracionController.php ← Valoraciones
└── database/
    ├── migrations/       ← Crean las tablas (php artisan migrate)
    └── seeders/          ← Datos de prueba (php artisan db:seed)
```

---

## ❓ Problemas frecuentes

**Error: "No application encryption key has been specified"**
→ Ejecuta: `php artisan key:generate`

**Error de conexión a la base de datos**
→ Comprueba que MySQL está activo y los datos del `.env` son correctos

**El frontend no encuentra la API**
→ Asegúrate de que el backend está corriendo en el puerto 8000

**Error de CORS**
→ Verifica que en `.env` tienes `SANCTUM_STATEFUL_DOMAINS=localhost:5173`

---

## 📝 Reglas de negocio implementadas

| RN  | Descripción                              | Dónde se implementa             |
|-----|------------------------------------------|---------------------------------|
| RN-1  | Email único                            | Migración + validación Laravel  |
| RN-3  | Contraseñas cifradas                   | Hash::make() en AuthController  |
| RN-4  | Usuarios bloqueados no pueden entrar   | AuthController@login            |
| RN-5  | Solo alumnos reservan                  | ReservaController@store         |
| RN-10 | Precio no puede ser 0 ni negativo      | Validación min:0.01             |
| RN-13 | No borrar anuncio con reservas activas | AnuncioController@destroy       |
| RN-14 | Fecha de clase en el futuro            | Validación after:now            |
| RN-15 | Sin solapamiento de reservas           | ReservaController@store         |
| RN-17 | Precio total = precio_hora × horas     | ReservaController@store         |
| RN-18 | Flujo de estados de reserva            | Enum en migración               |
| RN-19 | Solo valorar clases completadas        | ValoracionController@store      |
| RN-20 | Una sola valoración por clase          | unique en migración             |
| RN-21 | Puntuación entre 1 y 5                 | Validación min:1 max:5          |
| RN-29 | Borrado lógico (marcar inactivo)       | update activo=0 en controllers  |
