import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useContext, useState } from 'react';
import { getToken, getUsuario, clearToken, clearUsuario } from './services/api';

// ── Pages ─────────────────────────────────────────────────────────────────────
import Home           from './pages/Home';
import Login          from './pages/Login';
import Registro       from './pages/Registro';
import Anuncios       from './pages/Anuncios';
import DetalleAnuncio from './pages/DetalleAnuncio';
import MiPerfil       from './pages/MiPerfil';
import AdminLogin     from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Navbar         from './components/Navbar';
import Footer         from './components/Footer';

// ── Auth Context ──────────────────────────────────────────────────────────────

export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [usuario, setUsuarioState] = useState(() => getUsuario());
  const [token,   setTokenState]   = useState(() => getToken());

  const login = (tok, usr) => {
    localStorage.setItem('mentorup_token',   tok);
    localStorage.setItem('mentorup_usuario', JSON.stringify(usr));
    setTokenState(tok);
    setUsuarioState(usr);
  };

  const logout = () => {
    clearToken();
    clearUsuario();
    setTokenState(null);
    setUsuarioState(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Route guards ──────────────────────────────────────────────────────────────

function RequireAuth({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const { usuario, isAuth } = useAuth();
  if (!isAuth)                  return <Navigate to="/admin/login" replace />;
  if (usuario?.rol !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? <Navigate to="/" replace /> : children;
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes with Navbar + Footer */}
          <Route
            path="/*"
            element={
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/"            element={<Home />} />
                    <Route path="/anuncios"    element={<Anuncios />} />
                    <Route path="/anuncios/:id" element={<DetalleAnuncio />} />

                    {/* Guest-only */}
                    <Route path="/login"    element={<GuestOnly><Login /></GuestOnly>} />
                    <Route path="/registro" element={<GuestOnly><Registro /></GuestOnly>} />

                    {/* Protected */}
                    <Route path="/perfil" element={<RequireAuth><MiPerfil /></RequireAuth>} />

                    {/* Catch-all → home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />

          {/* Admin routes — layout independiente sin Navbar principal */}
          <Route path="/admin/login"     element={<GuestOnly><AdminLogin /></GuestOnly>} />
          <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/admin"           element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
