// src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Shield, Globe } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { Moon, Sun } from 'lucide-react';

export default function Landing() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌴</span>
          <div>
            <span className="font-bold text-xl text-slate-800 dark:text-white">Travel in Rio</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Gestión de Ventas</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-500" />}
          </button>
          <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors">
            Iniciar sesión
          </Link>
          <Link to="/register" className="btn-primary text-sm px-4 py-2 rounded-xl">
            Crear cuenta
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
          <Globe size={14} />
          Río de Janeiro, Brasil
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-800 dark:text-white mb-6 leading-tight">
          Gestiona tus ventas<br />
          <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">
            de turismo fácilmente
          </span>
        </h1>

        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mb-10">
          Registra tours, transfers y paquetes en segundos. Visualiza tus métricas en tiempo real y haz crecer tu equipo de ventas.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/register" className="btn-primary flex items-center gap-2 text-base">
            Comenzar gratis <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary text-base">
            Ya tengo cuenta
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 max-w-4xl w-full">
          {[
            { icon: TrendingUp, title: 'Métricas en tiempo real', desc: 'Visualiza ventas, ingresos y rendimiento de tu equipo al instante.' },
            { icon: Shield, title: 'Acceso seguro', desc: 'Cada vendedor tiene su propia cuenta protegida con Firebase Auth.' },
            { icon: Globe, title: 'Tours, transfers y paquetes', desc: 'Registra cualquier tipo de servicio turístico con formularios adaptados.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card text-left hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-sky-500" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-slate-400 dark:text-slate-600">
        © 2026 Travel in Rio 🌴 — Todos los derechos reservados
      </footer>
    </div>
  );
}
