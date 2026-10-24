// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import {
  collection, query, where, getDocs, orderBy, limit, doc, updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import {
  TrendingUp, DollarSign, Calendar, Award,
  Phone, MapPin, CreditCard, Mail, Edit2, Check, X, Users, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const NIVEL_COLORS = {
  'Básico': 'text-slate-500',
  'Plata': 'text-slate-400',
  'Oro': 'text-yellow-500',
  'Premium': 'text-purple-500',
};

const TYPE_BADGE = {
  tour: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  transfer: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
  paquete: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
};

export default function Dashboard() {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [stats, setStats] = useState({ totalVentas: 0, totalPax: 0, totalIngresos: 0, totalComisiones: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        telefono: userProfile.telefono || '',
        banco: userProfile.banco || '',
        tipoCuenta: userProfile.tipoCuenta || '',
        numeroCuenta: userProfile.numeroCuenta || '',
      });
    }
  }, [userProfile]);

  const fetchData = async () => {
    try {
      const q = query(
        collection(db, 'ventas'),
        where('vendedorId', '==', currentUser.uid),
        orderBy('creadoEn', 'desc'),
        limit(15),
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setVentas(data);

      // Métricas de ventas y comisiones
      const totalVentasMonto = data.reduce((acc, v) => acc + (v.monto || 0), 0);
      const totalComisionesMonto = data.reduce((acc, v) => acc + (v.gananciaPromotor || (v.monto * 0.1) || 0), 0);
      const totalPax = data.reduce((acc, v) => acc + (v.personas || 1), 0);

      setStats({
        totalVentas: data.length,
        totalPax: totalPax,
        totalIngresos: totalVentasMonto,
        totalComisiones: totalComisionesMonto,
      });
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), profileForm);
      setUserProfile((prev) => ({ ...prev, ...profileForm }));
      setEditing(false);
      toast.success('Perfil de pago actualizado');
    } catch {
      toast.error('Error al guardar perfil');
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return format(d, 'dd MMM yyyy', { locale: es });
  };

  const nivel = userProfile?.nivel || 'Equipo Comercial';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest bg-sky-100 dark:bg-sky-900/40 px-3 py-1 rounded-full">
            Panel de Desempeño
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">Resumen General</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Revisa tus tours vendidos, comisiones ganadas y actualiza tus datos bancarios para liquidación.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card border-l-4 border-l-sky-500">
            <p className="label">Ventas Registradas</p>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{stats.totalVentas}</p>
            <div className="flex items-center gap-1 text-xs text-sky-600 mt-2 font-medium">
              <TrendingUp size={14} /> Total órdenes
            </div>
          </div>

          <div className="card border-l-4 border-l-emerald-500">
            <p className="label">Tus Comisiones (Ganancia)</p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              R$ {stats.totalComisiones.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-medium">
              <Sparkles size={14} /> Tu pago acumulado
            </div>
          </div>

          <div className="card border-l-4 border-l-indigo-500">
            <p className="label">Total Facturado</p>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-200 mt-1">
              R$ {stats.totalIngresos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1 text-xs text-indigo-500 mt-2 font-medium">
              <DollarSign size={14} /> Ventas a clientes
            </div>
          </div>

          <div className="card border-l-4 border-l-amber-500">
            <p className="label">Pasajeros (PAX)</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-1">{stats.totalPax}</p>
            <div className="flex items-center gap-1 text-xs text-amber-600 mt-2 font-medium">
              <Users size={14} /> Total turistas atendidos
            </div>
          </div>
        </div>

        {/* Perfil & Datos de Pago */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-xs font-bold text-sky-500 uppercase tracking-widest">Liquidaciones</p>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Datos de Pago y Contacto</h2>
            </div>
            <div>
              {editing ? (
                <div className="flex items-center gap-2">
                  <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-1 text-xs py-2 px-3">
                    <Check size={14} /> Guardar
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-secondary flex items-center gap-1 text-xs py-2 px-3">
                    <X size={14} /> Cancelar
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-1 text-xs py-2 px-3">
                  <Edit2 size={14} /> Editar cuenta bancaria
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
              <span className="label">Teléfono / WhatsApp</span>
              {editing ? (
                <input
                  className="input-field mt-1 text-sm"
                  value={profileForm.telefono || ''}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, telefono: e.target.value }))}
                  placeholder="+56 9..."
                />
              ) : (
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">{userProfile?.telefono || 'Sin configurar'}</p>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
              <span className="label">Banco (PIX o Transferencia)</span>
              {editing ? (
                <input
                  className="input-field mt-1 text-sm"
                  value={profileForm.banco || ''}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, banco: e.target.value }))}
                  placeholder="Ej: Banco Estado, Nubank, Itaú..."
                />
              ) : (
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">{userProfile?.banco || 'Sin configurar'}</p>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
              <span className="label">Tipo de Cuenta / Llave PIX</span>
              {editing ? (
                <input
                  className="input-field mt-1 text-sm"
                  value={profileForm.tipoCuenta || ''}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, tipoCuenta: e.target.value }))}
                  placeholder="Cuenta RUT, Corriente, Llave PIX..."
                />
              ) : (
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">{userProfile?.tipoCuenta || 'Sin configurar'}</p>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
              <span className="label">Número de Cuenta / RUT</span>
              {editing ? (
                <input
                  className="input-field mt-1 text-sm"
                  value={profileForm.numeroCuenta || ''}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, numeroCuenta: e.target.value }))}
                  placeholder="Número de cuenta o RUT"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">{userProfile?.numeroCuenta || 'Sin configurar'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabla de Últimas Ventas */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Últimas Ventas Registradas
            </h2>
            <span className="text-xs text-slate-400">Mostrando las {ventas.length} más recientes</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <span className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : ventas.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-3">🏖️</p>
              <p className="font-medium text-slate-600 dark:text-slate-300">Aún no tienes ventas registradas</p>
              <p className="text-xs mt-1">Ingresa a "Registrar Venta" para cargar tu primera venta del catálogo.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
                    <th className="pb-3 font-semibold">Cliente</th>
                    <th className="pb-3 font-semibold">Servicio / Tour</th>
                    <th className="pb-3 font-semibold text-center">PAX</th>
                    <th className="pb-3 font-semibold">Venta Total</th>
                    <th className="pb-3 font-semibold text-emerald-600">Comisión Vendedor</th>
                    <th className="pb-3 font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ventas.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5">
                        <p className="font-semibold text-slate-800 dark:text-white">{v.cliente?.nombre || '—'}</p>
                        <p className="text-xs text-slate-400">{v.cliente?.telefono || ''}</p>
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${TYPE_BADGE[v.tipo] || 'bg-slate-100'}`}>
                          {v.tipo === 'tour' ? 'Tour' : v.tipo === 'transfer' ? 'Traslado' : 'Paquete'}
                        </span>
                        <p className="font-medium text-slate-700 dark:text-slate-200">{v.servicio || '—'}</p>
                      </td>
                      <td className="py-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                        {v.personas || 1}
                      </td>
                      <td className="py-3.5 font-bold text-slate-800 dark:text-slate-100">
                        R$ {(v.monto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                        + R$ {(v.gananciaPromotor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 text-slate-500 text-xs">{formatDate(v.creadoEn)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
