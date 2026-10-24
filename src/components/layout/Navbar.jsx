// src/components/layout/Navbar.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, LayoutDashboard, PlusCircle, History, Menu, X, ShieldAlert, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { logout, userProfile, currentUser } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = userProfile?.rol === 'admin' || currentUser?.email === 'damianalbogoku@gmail.com';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Sesión cerrada');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/ventas', label: 'Registrar Venta', icon: PlusCircle },
    { to: '/historial', label: 'Mi Historial', icon: History },
  ];

  if (isAdmin) {
    navLinks.push({ to: '/admin', label: 'Panel Admin', icon: ShieldAlert, badge: 'ADMIN' });
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <span className="text-2xl">🌴</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-none">
                  Travel in Rio
                </span>
                {isAdmin && (
                  <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold px-1.5 py-0.5 rounded">
                    ADMIN
                  </span>
                )}
              </div>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-1">
                Equipo de Ventas
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5">
            {navLinks.map(({ to, label, icon: Icon, badge }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                  {badge && !active && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden lg:block text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg truncate max-w-[150px]">
              👤 {userProfile?.nombre || 'Promotor'}
            </span>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>

            {/* Desktop Logout */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 border border-red-200 dark:border-red-900/40 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut size={14} />
              Salir
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-slate-100 dark:border-slate-800 mt-3 space-y-1">
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">{userProfile?.nombre || 'Promotor'}</p>
                <p className="text-[11px] text-slate-400">{currentUser?.email}</p>
              </div>
              {isAdmin && (
                <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">
                  ADMIN
                </span>
              )}
            </div>

            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Quick Navigation Bar (Sticky Footer for phones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex justify-around items-center shadow-lg">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold ${
            location.pathname === '/dashboard' ? 'text-sky-500' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Inicio</span>
        </Link>
        <Link
          to="/ventas"
          className={`flex flex-col items-center -mt-5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white p-3 rounded-full shadow-lg ${
            location.pathname === '/ventas' ? 'ring-4 ring-sky-300 dark:ring-sky-800' : ''
          }`}
        >
          <PlusCircle size={24} />
        </Link>
        <Link
          to="/historial"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold ${
            location.pathname === '/historial' ? 'text-sky-500' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <History size={20} />
          <span>Ventas</span>
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold ${
              location.pathname === '/admin' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <ShieldAlert size={20} />
            <span>Admin</span>
          </Link>
        )}
      </div>
    </>
  );
}
