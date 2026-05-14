<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MentorUP — Inicio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f8fffe;
            color: #1a1a1a;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* ── NAVBAR ── */
        nav {
            background: #fff;
            border-bottom: 1px solid #e8f5f3;
            padding: 0 2rem;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 1px 8px rgba(74,157,143,.08);
        }
        .nav-logo {
            font-size: 1.4rem;
            font-weight: 800;
            color: #4a9d8f;
            text-decoration: none;
        }
        .nav-logo span { color: #1a1a1a; }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a { text-decoration: none; color: #555; font-weight: 500; transition: color .2s; }
        .nav-links a:hover { color: #4a9d8f; }
        .nav-actions { display: flex; gap: .75rem; }
        .btn-outline {
            border: 2px solid #4a9d8f;
            color: #4a9d8f;
            padding: .5rem 1.25rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: all .2s;
        }
        .btn-outline:hover { background: #4a9d8f; color: #fff; }
        .btn-primary {
            background: #4a9d8f;
            color: #fff;
            padding: .5rem 1.25rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: background .2s;
        }
        .btn-primary:hover { background: #3d8c80; }

        /* ── HERO ── */
        .hero {
            background: linear-gradient(135deg, #4a9d8f 0%, #3d8c80 50%, #2d7a6e 100%);
            color: #fff;
            padding: 5rem 2rem 4rem;
            text-align: center;
        }
        .hero h1 {
            font-size: clamp(2rem, 5vw, 3.5rem);
            font-weight: 900;
            margin-bottom: 1rem;
            line-height: 1.1;
        }
        .hero h1 em { font-style: normal; color: #b2ead4; }
        .hero p {
            font-size: 1.2rem;
            opacity: .9;
            max-width: 560px;
            margin: 0 auto 2.5rem;
            line-height: 1.6;
        }
        .hero-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .hero-btns .btn-outline { border-color: #fff; color: #fff; }
        .hero-btns .btn-outline:hover { background: #fff; color: #4a9d8f; }
        .hero-btns .btn-primary { background: #fff; color: #4a9d8f; }
        .hero-btns .btn-primary:hover { background: #e8f5f3; }

        /* Stats band */
        .stats-band {
            background: #fff;
            border-bottom: 1px solid #e8f5f3;
            display: flex;
            justify-content: center;
            gap: 4rem;
            padding: 2rem;
            flex-wrap: wrap;
        }
        .stat-item { text-align: center; }
        .stat-item strong { display: block; font-size: 2rem; font-weight: 800; color: #4a9d8f; }
        .stat-item span { color: #666; font-size: .9rem; }

        /* ── SECTIONS ── */
        section { padding: 4rem 2rem; max-width: 1100px; margin: 0 auto; width: 100%; }
        section h2 {
            font-size: 2rem;
            font-weight: 800;
            text-align: center;
            margin-bottom: .5rem;
            color: #1a1a1a;
        }
        section .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 3rem;
        }

        /* Steps */
        .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; }
        .step { background: #fff; border-radius: 16px; padding: 2rem; text-align: center; box-shadow: 0 2px 16px rgba(74,157,143,.1); }
        .step-num {
            width: 56px; height: 56px; border-radius: 50%;
            background: linear-gradient(135deg, #4a9d8f, #3d8c80);
            color: #fff; font-size: 1.5rem; font-weight: 800;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 1rem;
        }
        .step h3 { font-size: 1.1rem; margin-bottom: .5rem; color: #1a1a1a; }
        .step p { color: #666; font-size: .95rem; line-height: 1.5; }

        /* Profile cards */
        .profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 2rem; }
        .profile-card {
            background: #fff;
            border-radius: 16px; padding: 2rem;
            box-shadow: 0 2px 16px rgba(74,157,143,.08);
            border: 2px solid transparent;
            transition: border-color .2s, transform .2s;
            text-align: center;
        }
        .profile-card:hover { border-color: #4a9d8f; transform: translateY(-4px); }
        .profile-icon { font-size: 3rem; margin-bottom: 1rem; }
        .profile-card h3 { font-size: 1.3rem; margin-bottom: .75rem; }
        .profile-card p { color: #666; margin-bottom: 1.5rem; line-height: 1.5; }

        /* API section */
        .api-section { background: #f0faf8; border-radius: 24px; padding: 3rem 2rem; }
        .api-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; font-size: .9rem; }
        .api-table th { background: #4a9d8f; color: #fff; padding: .75rem 1rem; text-align: left; }
        .api-table th:first-child { border-radius: 8px 0 0 8px; }
        .api-table th:last-child { border-radius: 0 8px 8px 0; }
        .api-table td { padding: .75rem 1rem; border-bottom: 1px solid #ddf0ec; }
        .api-table tr:hover td { background: #e8f5f3; }
        .method { font-weight: 700; padding: .2rem .5rem; border-radius: 4px; font-size: .8rem; }
        .get    { background: #dbeafe; color: #1d4ed8; }
        .post   { background: #d1fae5; color: #065f46; }
        .put    { background: #fef3c7; color: #92400e; }
        .delete { background: #fee2e2; color: #991b1b; }

        /* ── FOOTER ── */
        footer {
            background: #2d2d2d;
            color: #aaa;
            padding: 3rem 2rem 2rem;
            margin-top: auto;
        }
        .footer-inner {
            max-width: 1100px; margin: 0 auto;
            display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 2rem;
        }
        .footer-brand p { color: #ddd; font-size: 1.3rem; font-weight: 800; margin-bottom: .5rem; }
        .footer-brand span { font-size: .9rem; }
        footer h4 { color: #fff; margin-bottom: .75rem; }
        footer ul { list-style: none; }
        footer li { margin-bottom: .4rem; }
        footer a { color: #aaa; text-decoration: none; transition: color .2s; }
        footer a:hover { color: #4a9d8f; }
        .footer-copy {
            max-width: 1100px; margin: 2rem auto 0;
            padding-top: 1.5rem; border-top: 1px solid #444;
            text-align: center; font-size: .85rem;
        }
    </style>
</head>
<body>

<!-- NAVBAR -->
<nav>
    <a href="/inicio" class="nav-logo">Mentor<span>UP</span></a>
    <ul class="nav-links">
        <li><a href="/inicio">Inicio</a></li>
        <li><a href="#como-funciona">Cómo funciona</a></li>
    </ul>
    <div class="nav-actions">
        <a href="http://localhost:5173/login" class="btn-outline">Iniciar sesión</a>
        <a href="http://localhost:5173/registro" class="btn-primary">Crear cuenta</a>
    </div>
</nav>

<!-- HERO -->
<div class="hero">
    <h1>Conectamos alumnos con<br><em>los mejores profesores</em></h1>
    <p>Clases particulares personalizadas, verificadas y al mejor precio. Encuentra tu profesor ideal hoy mismo.</p>
    <div class="hero-btns">
        <a href="http://localhost:5173/anuncios" class="btn-outline">🔍 Buscar profesor</a>
        <a href="http://localhost:5173/registro" class="btn-primary">Empezar gratis →</a>
    </div>
</div>

<!-- STATS BAND -->
<div class="stats-band">
    <div class="stat-item"><strong>+500</strong><span>Profesores</span></div>
    <div class="stat-item"><strong>+2.000</strong><span>Alumnos</span></div>
    <div class="stat-item"><strong>98%</strong><span>Satisfacción</span></div>
    <div class="stat-item"><strong>+50</strong><span>Materias</span></div>
</div>

<!-- HOW IT WORKS -->
<section id="como-funciona">
    <h2>¿Cómo funciona?</h2>
    <p class="subtitle">Tres pasos sencillos para empezar</p>
    <div class="steps">
        <div class="step">
            <div class="step-num">1</div>
            <h3>Crea tu cuenta</h3>
            <p>Regístrate gratis como alumno o profesor en menos de 2 minutos.</p>
        </div>
        <div class="step">
            <div class="step-num">2</div>
            <h3>Explora el tablón</h3>
            <p>Busca profesores por materia, precio, ciudad o valoración.</p>
        </div>
        <div class="step">
            <div class="step-num">3</div>
            <h3>Contacta y aprende</h3>
            <p>Solicita la clase y empieza tu aprendizaje hoy mismo.</p>
        </div>
    </div>
</section>

<!-- PROFILES -->
<section>
    <h2>Una plataforma para todos</h2>
    <p class="subtitle">Escoge tu rol y empieza</p>
    <div class="profile-grid">
        <div class="profile-card">
            <div class="profile-icon">🎓</div>
            <h3>Alumno</h3>
            <p>Busca el profesor ideal para cada materia. Filtra por precio, horario y valoraciones de otros alumnos.</p>
            <a href="http://localhost:5173/registro" class="btn-primary">Registrarme como alumno</a>
        </div>
        <div class="profile-card">
            <div class="profile-icon">👨‍🏫</div>
            <h3>Profesor</h3>
            <p>Publica tus clases, fija tu precio y llega a miles de alumnos que buscan tu especialidad.</p>
            <a href="http://localhost:5173/registro" class="btn-outline">Registrarme como profesor</a>
        </div>
    </div>
</section>

<!-- API REFERENCE -->
<section>
    <div class="api-section">
        <h2>API REST — Endpoints principales</h2>
        <p class="subtitle">Base URL: <code>http://localhost:8000/api</code></p>
        <table class="api-table">
            <thead>
                <tr>
                    <th>Método</th><th>Ruta</th><th>Descripción</th><th>Auth</th>
                </tr>
            </thead>
            <tbody>
                <tr><td><span class="method post">POST</span></td><td>/register</td><td>Registro de usuario</td><td>—</td></tr>
                <tr><td><span class="method post">POST</span></td><td>/login</td><td>Inicio de sesión</td><td>—</td></tr>
                <tr><td><span class="method post">POST</span></td><td>/logout</td><td>Cerrar sesión</td><td>Token</td></tr>
                <tr><td><span class="method get">GET</span></td><td>/anuncios</td><td>Listar anuncios activos</td><td>—</td></tr>
                <tr><td><span class="method get">GET</span></td><td>/anuncios/{id}</td><td>Detalle de un anuncio</td><td>—</td></tr>
                <tr><td><span class="method post">POST</span></td><td>/anuncios</td><td>Crear anuncio (profesor)</td><td>Token</td></tr>
                <tr><td><span class="method put">PUT</span></td><td>/anuncios/{id}</td><td>Editar anuncio (profesor)</td><td>Token</td></tr>
                <tr><td><span class="method delete">DELETE</span></td><td>/anuncios/{id}</td><td>Desactivar anuncio</td><td>Token</td></tr>
                <tr><td><span class="method get">GET</span></td><td>/reservas</td><td>Mis reservas</td><td>Token</td></tr>
                <tr><td><span class="method post">POST</span></td><td>/reservas</td><td>Crear reserva (alumno)</td><td>Token</td></tr>
                <tr><td><span class="method post">POST</span></td><td>/reservas/{id}/cancelar</td><td>Cancelar reserva</td><td>Token</td></tr>
                <tr><td><span class="method post">POST</span></td><td>/valoraciones</td><td>Dejar valoración (alumno)</td><td>Token</td></tr>
                <tr><td><span class="method get">GET</span></td><td>/admin/stats</td><td>Estadísticas admin</td><td>Admin</td></tr>
                <tr><td><span class="method get">GET</span></td><td>/admin/anuncios</td><td>Todos los anuncios</td><td>Admin</td></tr>
                <tr><td><span class="method put">PUT</span></td><td>/admin/anuncios/{id}/verificar</td><td>Aprobar/rechazar</td><td>Admin</td></tr>
                <tr><td><span class="method get">GET</span></td><td>/admin/alumnos</td><td>Lista de alumnos</td><td>Admin</td></tr>
                <tr><td><span class="method get">GET</span></td><td>/admin/profesores</td><td>Lista de profesores</td><td>Admin</td></tr>
                <tr><td><span class="method put">PUT</span></td><td>/admin/usuarios/{id}/bloquear</td><td>Bloquear usuario</td><td>Admin</td></tr>
                <tr><td><span class="method delete">DELETE</span></td><td>/admin/usuarios/{id}</td><td>Eliminar usuario</td><td>Admin</td></tr>
            </tbody>
        </table>
    </div>
</section>

<!-- FOOTER -->
<footer>
    <div class="footer-inner">
        <div class="footer-brand">
            <p>MentorUP 🎓</p>
            <span>Conectando talento con aprendizaje desde 2026.</span>
        </div>
        <div>
            <h4>Plataforma</h4>
            <ul>
                <li><a href="#como-funciona">Cómo funciona</a></li>
                <li><a href="http://localhost:5173/anuncios">Tablón de anuncios</a></li>
            </ul>
        </div>
        <div>
            <h4>Usuarios</h4>
            <ul>
                <li><a href="http://localhost:5173/login">Iniciar sesión</a></li>
                <li><a href="http://localhost:5173/registro">Crear cuenta</a></li>
                <li><a href="http://localhost:5173/admin/login">Administración</a></li>
            </ul>
        </div>
        <div>
            <h4>Soporte</h4>
            <ul>
                <li><a href="#">Centro de ayuda</a></li>
                <li><a href="#">Contacto</a></li>
                <li><a href="#">Términos de uso</a></li>
            </ul>
        </div>
    </div>
    <div class="footer-copy">
        <p>© 2026 MentorUP. Todos los derechos reservados.</p>
    </div>
</footer>

</body>
</html>
