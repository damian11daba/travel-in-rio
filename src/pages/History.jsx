// src/pages/History.jsx
import { useEffect, useState } from 'react';
import {
  collection, query, where, getDocs, orderBy, deleteDoc, doc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import { Download, Trash2, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';

const TYPE_BADGE = {
  tour: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  transfer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  paquete: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function History() {
  const { currentUser } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchVentas();
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [ventas, search, tipoFilter]);

  const fetchVentas = async () => {
    try {
      const q = query(
        collection(db, 'ventas'),
        where('vendedorId', '==', currentUser.uid),
        orderBy('creadoEn', 'desc'),
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setVentas(data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...ventas];
    if (tipoFilter !== 'todos') {
      result = result.filter((v) => v.tipo === tipoFilter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.cliente?.nombre?.toLowerCase().includes(s) ||
          v.servicio?.toLowerCase().includes(s) ||
          v.cliente?.email?.toLowerCase().includes(s),
      );
    }
    setFiltered(result);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta venta? Esta acción no se puede deshacer.')) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'ventas', id));
      setVentas((prev) => prev.filter((v) => v.id !== id));
      toast.success('Venta eliminada');
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    const rows = filtered.map((v) => ({
      'Cliente': v.cliente?.nombre || '',
      'Email': v.cliente?.email || '',
      'Teléfono': v.cliente?.telefono || '',
      'País': v.cliente?.pais || '',
      'Tipo': v.tipo,
      'Servicio': v.servicio || '',
      'Monto (R$)': v.monto || 0,
      'Personas': v.personas || 1,
      'Fecha': v.fecha || '',
      'Notas': v.notas || '',
      'Registrado': v.creadoEn?.toDate
        ? format(v.creadoEn.toDate(), 'dd/MM/yyyy HH:mm', { locale: es })
        : '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    XLSX.writeFile(wb, `travel-in-rio-ventas-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('Exportado a Excel');
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return format(d, 'dd MMM yyyy', { locale: es });
  };

  const totalMonto = filtered.reduce((acc, v) => acc + (v.monto || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Historial de ventas</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {filtered.length} venta{filtered.length !== 1 ? 's' : ''} · Total:{' '}
              <span className="text-green-500 font-bold">
                R$ {totalMonto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Exportar a Excel
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-field pl-9"
              placeholder="Buscar por cliente, servicio o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              className="input-field w-auto"
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
            >
              <option value="todos">Todos los tipos</option>
              <option value="tour">Tours</option>
              <option value="transfer">Transfers</option>
              <option value="paquete">Paquetes</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <span className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-3">🔍</p>
              <p>No se encontraron ventas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr className="text-left text-slate-500 dark:text-slate-400">
                    <th className="px-6 py-4 font-semibold">Cliente</th>
                    <th className="px-6 py-4 font-semibold">Tipo</th>
                    <th className="px-6 py-4 font-semibold">Servicio</th>
                    <th className="px-6 py-4 font-semibold">Personas</th>
                    <th className="px-6 py-4 font-semibold">Monto</th>
                    <th className="px-6 py-4 font-semibold">Fecha</th>
                    <th className="px-6 py-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr
                      key={v.id}
                      className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800 dark:text-white">{v.cliente?.nombre || '—'}</p>
                        <p className="text-xs text-slate-400">{v.cliente?.email || ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${TYPE_BADGE[v.tipo] || 'bg-slate-100 text-slate-600'}`}>
                          {v.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                        {v.servicio || '—'}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-300">
                        {v.personas || 1}
                      </td>
                      <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400">
                        R$ {(v.monto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{formatDate(v.creadoEn)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(v.id)}
                          disabled={deletingId === v.id}
                          className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                          title="Eliminar venta"
                        >
                          {deletingId === v.id ? (
                            <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </td>
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
