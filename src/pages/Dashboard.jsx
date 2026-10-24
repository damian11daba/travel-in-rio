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
  Phone, MapPin, CreditCard, Mail, Edit2, Check, X,
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
  tour: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  transfer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  paquete: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function Dashboard() {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [stats, setStats] = useState({ total: 0, ingresos: 0, meses: 0 });
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
        limit(10),
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setVentas(data);

      // Stats
      const totalMonto = data.reduce((acc, v) => acc + (v.monto || 0), 0);
      const mesesUnicos = new Set(data.map((v) => {
        const d = v.creadoEn?.toDate ? v.creadoEn.toDate() : new Date(v.creadoEn);
        return `${d.getFullYear()}-${d.getMonth()}`;
      })).size;
      setStats({ total: data.length, ingresos: totalMonto, meses: mesesUnicos });
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
      toast.success('Perfil actualizado');
    } catch {
      toast.error('Error al guardar perfil');
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return format(d, 'dd MMM yyyy', { locale: es });
  };

  const nivel = userProfile?.nivel || 'Básico';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Resumen general</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Ve un panorama completo de tu desempeño, ventas y gestión comercial.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Ventas', value: stats.total, icon: TrendingUp, color: 'text-sky-500' },
            { label: 'Ingresos', value: `R$ ${stats.ingresos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-green-500' },
            { label: 'Meses', value: stats.meses, icon: Calendar, color: 'text-orange-500' },
            { label: 'Nivel', value: nivel, icon: Award, color: NIVEL_COLORS[nivel] },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <p className="label">{label}</p>
              <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</p>
              <Icon size={18} className={`${color} mt-2 opacity-60`} />
            </div>
          ))}
        </div>

        {/* Profile Section */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-sky-500 uppercase tracking-widest mb-1">Perfil</p>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Datos de pago y contacto</h2>
            </div>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-1 text-sm py-2 px-4">
                    <Check size={14} /> Guardar
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-secondary flex items-center gap-1 text-sm py-2 px-4">
                    <X size={14} /> Cancelar
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-1 text-sm py-2 px-4">
                  <Edit2 size={14} /> Editar perfil
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Phone, label: 'Teléfono de contacto', key: 'telefono', placeholder: '+55 21 99999-9999' },
              { icon: MapPin, label: 'Banco', key: 'banco', placeholder: 'Ej: Nubank, Itaú...' },
              { icon: CreditCard, label: 'Tipo de cuenta', key: 'tipoCuenta', placeholder: 'Corriente, Ahorro...' },
              { icon: CreditCard, label: 'Número de cuenta', key: 'numeroCuenta', placeholder: '00000-0' },
              { icon: Mail, label: 'Correo', value: currentUser?.email, readOnly: true },
            ].map(({ icon: Icon, label, key, placeholder, value, readOnly }) => (
              <div key={label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} className="text-slate-400" />
                  <span className="label mb-0">{label}</span>
                </div>
                {editing && !readOnly ? (
                  <input
                    className="input-field mt-1 text-sm"
                    value={profileForm[key] || ''}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-1">
                    {readOnly ? value : (userProfile?.[key] || '—')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="card">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
            Últimas ventas registradas
          </h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : ventas.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-4xl mb-3">🌊</p>
              <p>Aún no tienes ventas registradas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
                    <th className="pb-3 font-semibold">Cliente</th>
                    <th className="pb-3 font-semibold">Tipo</th>
                    <th className="pb-3 font-semibold">Servicio</th>
                    <th className="pb-3 font-semibold">Monto</th>
                    <th className="pb-3 font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v) => (
                    <tr key={v.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 font-medium text-slate-800 dark:text-white">{v.cliente?.nombre || '—'}</td>
                      <td className="py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${TYPE_BADGE[v.tipo] || 'bg-slate-100 text-slate-600'}`}>
                          {v.tipo}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{v.servicio || '—'}</td>
                      <td className="py-3 font-bold text-green-600 dark:text-green-400">
                        R$ {(v.monto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-slate-500">{formatDate(v.creadoEn)}</td>
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
