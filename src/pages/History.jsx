// src/pages/History.jsx
import { useEffect, useState } from 'react';
import {
  collection, query, where, getDocs, orderBy, deleteDoc, doc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import { Download, Trash2, Search, Filter, Compass, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';

const TYPE_BADGE = {
  tour: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  transfer: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
  paquete: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
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
          v.cliente?.email?.toLowerCase().includes(s) ||
          v.cliente?.telefono?.toLowerCase().includes(s)
      );
    }
    setFiltered(result);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar este registro de venta?')) return;
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
    // Generar formato idéntico a la Planilla Ventas Diarias TRAVEL IN RIO
    const rows = filtered.map((v) => ({
      'Fecha de Venta': v.fecha || (v.creadoEn?.toDate ? format(v.creadoEn.toDate(), 'yyyy-MM-dd') : ''),
      'Cliente': v.cliente?.nombre || '',
      'Teléfono': v.cliente?.telefono || '',
      'Código Tour': v.codigoTour || '',
      'Nombre Tour / Servicio': v.servicio || '',
      'Promotor': v.promotorNombre || 'Vendedor',
      'Cantidad Personas (PAX)': v.personas || 1,
      'Valor Neto Unitario (R$)': v.valorNeto || 0,
      'Precio Venta Unitario (R$)': v.precioUnitario || (v.monto / (v.personas || 1)) || 0,
      'Comisión Vendedor Total (R$)': v.gananciaPromotor || 0,
      'Margen Agencia Total (R$)': v.gananciaEmpresa || 0,
      'Total Venta (R$)': v.monto || 0,
      'Notas / Observaciones': v.notas || '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Planilla Travel in Rio');
    XLSX.writeFile(wb, `Planilla-Ventas-TravelInRio-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('¡Planilla de Excel generada!');
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return format(d, 'dd/MM/yyyy HH:mm', { locale: es });
  };

  const totalVentas = filtered.reduce((acc, v) => acc + (v.monto || 0), 0);
  const totalComisiones = filtered.reduce((acc, v) => acc + (v.gananciaPromotor || 0), 0);
  const totalPax = filtered.reduce((acc, v) => acc + (v.personas || 1), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Planilla & Historial</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Registro detallado de tus transacciones. Puedes filtrar y exportar el informe exacto a Excel.
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            <FileSpreadsheet size={18} />
            Exportar Planilla Excel
          </button>
        </div>

        {/* Resumen Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card py-4 bg-sky-50/60 dark:bg-slate-800/80 border-sky-100 dark:border-slate-700">
            <span className="text-xs font-bold uppercase text-sky-600 dark:text-sky-400">Total Facturado</span>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
              R$ {totalVentas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="card py-4 bg-emerald-50/60 dark:bg-slate-800/80 border-emerald-100 dark:border-slate-700">
            <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">Total Tus Comisiones</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              R$ {totalComisiones.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="card py-4 bg-amber-50/60 dark:bg-slate-800/80 border-amber-100 dark:border-slate-700">
            <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">Total Pasajeros (PAX)</span>
            <p className="text-2xl font-black text-amber-500 mt-1">
              {totalPax} personas
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-field pl-9"
              placeholder="Buscar por cliente, tour, WhatsApp..."
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
              <option value="todos">Todos los servicios</option>
              <option value="tour">Solo Tours</option>
              <option value="transfer">Solo Traslados</option>
              <option value="paquete">Solo Paquetes</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <span className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Compass size={40} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="font-medium">No se encontraron ventas para este filtro.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100/70 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  <tr className="text-left font-semibold">
                    <th className="px-5 py-3.5">Cliente</th>
                    <th className="px-5 py-3.5">Servicio / Tour</th>
                    <th className="px-5 py-3.5 text-center">PAX</th>
                    <th className="px-5 py-3.5">Venta Total</th>
                    <th className="px-5 py-3.5 text-emerald-600">Comisión</th>
                    <th className="px-5 py-3.5">Fecha Tour</th>
                    <th className="px-5 py-3.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800 dark:text-white">{v.cliente?.nombre || '—'}</p>
                        <p className="text-xs text-slate-500">{v.cliente?.telefono || v.cliente?.email || ''}</p>
                        {v.cliente?.pais && (
                          <span className="inline-block mt-1 text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            {v.cliente.pais}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mb-1 ${TYPE_BADGE[v.tipo] || 'bg-slate-100'}`}>
                          {v.tipo === 'tour' ? 'Tour' : v.tipo === 'transfer' ? 'Traslado' : 'Paquete'}
                        </span>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{v.servicio || '—'}</p>
                        {v.codigoTour && <span className="text-[11px] text-slate-400 font-mono">Cód: {v.codigoTour}</span>}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-slate-800 dark:text-slate-100">
                        {v.personas || 1}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-100">
                        R$ {(v.monto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                        + R$ {(v.gananciaPromotor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {v.fecha ? v.fecha : formatDate(v.creadoEn)}
                        {v.hora && <span className="block text-[11px] text-slate-400">Hora: {v.hora}</span>}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleDelete(v.id)}
                          disabled={deletingId === v.id}
                          className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
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
