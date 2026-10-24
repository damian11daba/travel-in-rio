// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register: registerUser } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ nombre, email, password }) => {
    setLoading(true);
    try {
      await registerUser(email, password, nombre);
      toast.success('¡Cuenta creada! Bienvenido a Travel in Rio 🌴');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'Este correo ya está registrado'
        : err.code === 'auth/weak-password'
        ? 'La contraseña debe tener al menos 6 caracteres'
        : 'Error al crear la cuenta';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-8 relative">
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-400" />}
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/40 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-3xl">🌴</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Crear cuenta</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Travel in Rio — Gestión de Ventas</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tu nombre completo"
                className={`input-field pl-9 ${errors.nombre ? 'border-red-400' : ''}`}
                {...register('nombre', { required: 'El nombre es obligatorio' })}
              />
            </div>
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>}
          </div>

          <div>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className={`input-field pl-9 ${errors.email ? 'border-red-400' : ''}`}
                {...register('email', {
                  required: 'El correo es obligatorio',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
                })}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                className={`input-field pl-9 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                {...register('password', {
                  required: 'La contraseña es obligatoria',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              'Crear cuenta →'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-sky-500 hover:text-sky-600 font-medium">
            Inicia sesión
          </Link>
        </p>
        <div className="text-center mt-2">
          <Link to="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
