// src/components/layout/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, LayoutDashboard, PlusCircle, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { logout, userProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Sesión cerrada');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  const navLink = (to, label, Icon) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-md'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        <Icon size={16} />
        {label}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-700 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌴</span>
          <div>
            <span className="font-bold text-slate-800 dark:text-white text-lg">Travel in Rio</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 -mt-1">Gestión de Ventas</span>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLink('/dashboard', 'Dashboard', LayoutDashboard)}
          {navLink('/ventas', 'Registrar Venta', PlusCircle)}
          {navLink('/historial', 'Historial', History)}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
            {userProfile?.nombre || 'Vendedor'}
          </span>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-500" />}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors px-2 py-1"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
