/**
 * services/api.js — MentorUP API Client
 *
 * Centraliza todas las llamadas a la API.
 * Base URL desde Vite env: VITE_API_URL (default: http://localhost:8000/api)
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ── Token helpers ─────────────────────────────────────────────────────────

export const getToken    = () => localStorage.getItem('mentorup_token');
export const setToken    = (t) => localStorage.setItem('mentorup_token', t);
export const clearToken  = () => localStorage.removeItem('mentorup_token');

export const getUsuario  = () => {
  try { return JSON.parse(localStorage.getItem('mentorup_usuario')); }
  catch { return null; }
};
export const setUsuario  = (u) => localStorage.setItem('mentorup_usuario', JSON.stringify(u));
export const clearUsuario = () => localStorage.removeItem('mentorup_usuario');

// ── Low-level fetch ───────────────────────────────────────────────────────

async function request(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res  = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.mensaje ||
      (data?.errors ? Object.values(data.errors).flat().join(' ') : null) ||
      `Error ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────

export const apiRegister      = (payload) => request('POST', '/register', payload);
export const apiLogin         = (payload) => request('POST', '/login', payload);
export const apiLogout        = ()        => request('POST', '/logout', null, true);
export const apiMe            = ()        => request('GET',  '/me', null, true);
export const apiUpdateProfile = (data)    => request('PUT',  '/me', data, true);

// ── Anuncios ──────────────────────────────────────────────────────────────

export const apiGetAnuncios = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  ).toString();
  return request('GET', `/anuncios${qs ? '?' + qs : ''}`);
};
export const apiGetAnuncio     = (id)        => request('GET',    `/anuncios/${id}`);
export const apiCreateAnuncio  = (data)      => request('POST',   '/anuncios', data, true);
export const apiUpdateAnuncio  = (id, data)  => request('PUT',    `/anuncios/${id}`, data, true);
export const apiDeleteAnuncio  = (id)        => request('DELETE', `/anuncios/${id}`, null, true);

// ── Reservas ──────────────────────────────────────────────────────────────

export const apiGetReservas      = ()     => request('GET',  '/reservas', null, true);
export const apiCreateReserva    = (data) => request('POST', '/reservas', data, true);
export const apiCancelarReserva  = (id)   => request('POST', `/reservas/${id}/cancelar`, null, true);
export const apiConfirmarReserva = (id)   => request('PUT',  `/reservas/${id}/confirmar`, null, true);
export const apiCompletarReserva = (id)   => request('PUT',  `/reservas/${id}/completar`, null, true);

// ── Valoraciones ──────────────────────────────────────────────────────────

export const apiCreateValoracion       = (data) => request('POST', '/valoraciones', data, true);
export const apiValoracionesPendientes = ()     => request('GET',  '/valoraciones/pendientes', null, true);

// ── Disponibilidad horaria ────────────────────────────────────────────────

/** Obtiene la disponibilidad del profesor autenticado */
export const apiGetDisponibilidad  = ()       => request('GET',  '/disponibilidad', null, true);

/** Guarda (reemplaza) la disponibilidad del profesor autenticado */
export const apiSaveDisponibilidad = (bloques) => request('POST', '/disponibilidad', { bloques }, true);

/** Disponibilidad pública de un profesor (para alumnos) */
export const apiGetDisponibilidadProfesor = (profesorId) =>
  request('GET', `/profesores/${profesorId}/disponibilidad`);

/** Verifica si una fecha/hora es válida para reservar con un profesor */
export const apiVerificarFecha = (profesorId, fecha_clase) =>
  request('POST', `/profesores/${profesorId}/verificar-fecha`, { fecha_clase });

// ── Admin ─────────────────────────────────────────────────────────────────

export const apiAdminStats      = ()           => request('GET',  '/admin/stats', null, true);
export const apiAdminAnuncios   = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  ).toString();
  return request('GET', `/admin/anuncios${qs ? '?' + qs : ''}`, null, true);
};
export const apiAdminVerificar       = (id, accion) => request('PUT',    `/admin/anuncios/${id}/verificar`, { accion }, true);
export const apiAdminEliminarAnuncio = (id)          => request('DELETE', `/admin/anuncios/${id}`, null, true);
export const apiAdminAlumnos         = ()            => request('GET',    '/admin/alumnos', null, true);
export const apiAdminProfesores      = ()            => request('GET',    '/admin/profesores', null, true);
export const apiAdminBloquear        = (id, bloqueado) => request('PUT',  `/admin/usuarios/${id}/bloquear`, { bloqueado }, true);
export const apiAdminEliminarUsuario = (id)          => request('DELETE', `/admin/usuarios/${id}`, null, true);
