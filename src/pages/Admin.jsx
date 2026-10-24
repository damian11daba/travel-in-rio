// src/pages/Admin.jsx
import { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import { FileSpreadsheet, Calendar, Users, TrendingUp, DollarSign, Download, ShieldCheck, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';

export default function Admin() {
  const { currentUser, userProfile } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtro de fecha predeterminada a la fecha de hoy (formato YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedPromotor, setSelectedPromotor] = useState('todos');
  const [search, setSearch] = useState('');

  // Verificación de si es el administrador
  const isAdmin = userProfile?.rol === 'admin' || currentUser?.email === 'damianalbogoku@gmail.com';

  useEffect(() => {
    fetchAllVentas();
  }, []);

  const fetchAllVentas = async () => {
    setLoading(true);
    try {
      // Como admin consulta TODAS las ventas de todos los promotores
      const q = query(
        collection(db, 'ventas'),
        orderBy('creadoEn', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVentas(data);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar ventas globales');
    } finally {
      setLoading(false);
    }
  };

  // Extraer lista única de promotores
  const promotores = Array.from(new Set(ventas.map(v => v.promotorNombre || 'Sin nombre'))).filter(Boolean);

  // Filtrado de ventas por fecha, promotor y texto
  const filteredVentas = ventas.filter(v => {
    // Comparar fecha de tour o de creación
    const ventaDateStr = v.fecha || (v.creadoEn?.toDate ? v.creadoEn.toDate().toISOString().split('T')[0] : '');
    const matchDate = selectedDate ? ventaDateStr === selectedDate : true;
    const matchPromotor = selectedPromotor === 'todos' ? true : v.promotorNombre === selectedPromotor;
    const matchSearch = search.trim() ? (
      (v.cliente?.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.servicio || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.promotorNombre || '').toLowerCase().includes(search.toLowerCase())
    ) : true;

    return matchDate && matchPromotor && matchSearch;
  });

  // Métricas del filtro seleccionado
  const totalFacturado = filteredVentas.reduce((sum, v) => sum + (v.monto || 0), 0);
  const totalComisiones = filteredVentas.reduce((sum, v) => sum + (v.gananciaPromotor || 0), 0);
  const totalNetos = filteredVentas.reduce((sum, v) => sum + ((v.valorNeto || 0) * (v.personas || 1)), 0);
  const totalMargenAgencia = filteredVentas.reduce((sum, v) => sum + (v.gananciaEmpresa || (v.monto - (v.valorNeto || 0)*(v.personas || 1) - (v.gananciaPromotor || 0))), 0);
  const totalPax = filteredVentas.reduce((sum, v) => sum + (v.personas || 1), 0);

  // Exportar Excel Diario consolidado de todos los trabajadores
  const handleExportDailyExcel = () => {
    if (filteredVentas.length === 0) {
      toast.error('No hay ventas registradas para este filtro de fecha');
      return;
    }

    const rows = filteredVentas.map(v => ({
      'Fecha Venta': v.fecha || (v.creadoEn?.toDate ? format(v.creadoEn.toDate(), 'yyyy-MM-dd') : ''),
      'Promotor / Vendedor': v.promotorNombre || 'Sin Asignar',
      'Cliente': v.cliente?.nombre || '',
      'Teléfono / WhatsApp': v.cliente?.telefono || '',
      'Código Tour': v.codigoTour || '',
      'Tour / Servicio': v.servicio || '',
      'Personas (PAX)': v.personas || 1,
      'Costo Neto Proveedor': (v.valorNeto || 0) * (v.personas || 1),
      'Venta Total al Cliente': v.monto || 0,
      'Comisión Promotor (Gan Prom)': v.gananciaPromotor || 0,
      'Margen / Ganancia Neta Empresa': v.gananciaEmpresa || (v.monto - (v.valorNeto || 0)*(v.personas || 1) - (v.gananciaPromotor || 0)),
      'Notas / Observaciones': v.notas || '',
    }));

    // Fila de resumen total al final
    rows.push({
      'Fecha Venta': 'TOTALES',
      'Promotor / Vendedor': `Total Ventas: ${filteredVentas.length}`,
      'Cliente': '',
      'Teléfono / WhatsApp': '',
      'Código Tour': '',
      'Tour / Servicio': '',
      'Personas (PAX)': totalPax,
      'Costo Neto Proveedor': totalNetos,
      'Venta Total al Cliente': totalFacturado,
      'Comisión Promotor (Gan Prom)': totalComisiones,
      'Margen / Ganancia Neta Empresa': totalMargenAgencia,
      'Notas / Observaciones': 'Generado por Travel in Rio Admin',
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Ventas_${selectedDate || 'Consolidado'}`);
    XLSX.writeFile(wb, `Planilla-Diaria-TravelInRio-${selectedDate || 'Todos'}.xlsx`);
    toast.success('¡Excel diario consolidado descargado!');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
        <Navbar />
        <div className="max-w-md mx-auto mt-20 text-center p-6 card">
          <p className="text-4xl mb-3">🔒</p>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Acceso Restringido</h2>
          <p className="text-sm text-slate-500 mt-2">
            Esta sección es exclusiva para el administrador general de Travel in Rio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 md:pb-16">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Encabezado Admin */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={14} /> PANEL EXCLUSIVO ADMINISTRADOR
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Cierre Diario & Control General
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Visualiza en tiempo real las ventas de todos los promotores y descarga la planilla diaria de liquidación.
            </p>
          </div>

          {/* Botón Descargar Planilla del Día */}
          <button
            onClick={handleExportDailyExcel}
            className="btn-primary flex items-center justify-center gap-2 text-sm sm:text-base py-3 px-6 shadow-md hover:shadow-lg w-full md:w-auto"
          >
            <FileSpreadsheet size={18} />
            Descargar Excel del Día ({selectedDate})
          </button>
        </div>

        {/* Filtros de Control Diario */}
        <div className="card mb-6 p-4 bg-white dark:bg-slate-800 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label flex items-center gap-1.5 text-xs">
                <Calendar size={14} className="text-sky-500" />
                Seleccionar Día de Venta
              </label>
              <input
                type="date"
                className="input-field text-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div>
              <label className="label flex items-center gap-1.5 text-xs">
                <Users size={14} className="text-sky-500" />
                Filtrar por Promotor / Trabajador
              </label>
              <select
                className="input-field text-sm"
                value={selectedPromotor}
                onChange={(e) => setSelectedPromotor(e.target.value)}
              >
                <option value="todos">Todos los trabajadores</option>
                {promotores.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label flex items-center gap-1.5 text-xs">
                <Search size={14} className="text-slate-400" />
                Buscar Cliente o Tour
              </label>
              <input
                type="text"
                className="input-field text-sm"
                placeholder="Nombre, tour..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
            <span className="text-slate-500">
              Ventas encontradas: <strong className="text-slate-800 dark:text-white">{filteredVentas.length}</strong>
            </span>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-sky-500 hover:underline font-semibold"
              >
                Ver todo el historial completo
              </button>
            )}
          </div>
        </div>

        {/* Tarjetas Resumen Financiero Consolidado */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="card p-4 border-l-4 border-l-sky-500">
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Facturado</span>
            <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-1">
              R$ {totalFacturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{totalPax} pasajeros (PAX)</p>
          </div>

          <div className="card p-4 border-l-4 border-l-emerald-500">
            <span className="text-[11px] font-bold uppercase text-emerald-600">Comisiones Promotores</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              R$ {totalComisiones.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">A pagar a vendedores</p>
          </div>

          <div className="card p-4 border-l-4 border-l-indigo-500">
            <span className="text-[11px] font-bold uppercase text-indigo-500">Neto a Proveedores</span>
            <p className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-200 mt-1">
              R$ {totalNetos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Costo barcos, buses, etc.</p>
          </div>

          <div className="card p-4 border-l-4 border-l-purple-500 bg-purple-50/40 dark:bg-slate-800/80">
            <span className="text-[11px] font-bold uppercase text-purple-600">Margen Neto Agencia</span>
            <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
              R$ {totalMargenAgencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Ganancia neta Travel in Rio</p>
          </div>
        </div>

        {/* Tabla de Ventas de Todos los Trabajadores */}
        <div className="card p-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Detalle de Ventas Consolidadas
            </h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-300 font-semibold">
              {filteredVentas.length} registros
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <span className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin inline-block" />
            </div>
          ) : filteredVentas.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="font-medium text-slate-600 dark:text-slate-300">No hay ventas registradas para este día.</p>
              <p className="text-xs mt-1">Los promotores pueden registrar ventas desde sus celulares.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-slate-100/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr className="text-left font-bold">
                    <th className="px-4 py-3">Promotor</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Tour / Traslado</th>
                    <th className="px-4 py-3 text-center">PAX</th>
                    <th className="px-4 py-3">Venta (R$)</th>
                    <th className="px-4 py-3 text-emerald-600">Comisión</th>
                    <th className="px-4 py-3 text-purple-600">Margen Agencia</th>
                    <th className="px-4 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredVentas.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-extrabold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded text-xs">
                          {v.promotorNombre || 'Promotor'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800 dark:text-white">{v.cliente?.nombre || '—'}</p>
                        <p className="text-[11px] text-slate-400">{v.cliente?.telefono}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{v.servicio}</p>
                        {v.codigoTour && <span className="text-[10px] text-slate-400 font-mono">Cód: {v.codigoTour}</span>}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">{v.personas || 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">
                        R$ {(v.monto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                        + R$ {(v.gananciaPromotor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 font-bold text-purple-600 dark:text-purple-400">
                        R$ {(v.gananciaEmpresa || (v.monto - (v.valorNeto || 0)*(v.personas || 1) - (v.gananciaPromotor || 0))).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{v.fecha || '—'}</td>
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
