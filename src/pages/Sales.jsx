// src/pages/Sales.jsx
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import Navbar from '../components/layout/Navbar';
import { MapPin, Users, Calendar, DollarSign, Phone, Mail, User, FileText, Clock, Percent, Compass, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import { CATEGORIAS_TOURS, RUTAS_TRASLADOS } from '../data/toursData';

const TABS = [
  { id: 'tour', label: '🗺️ Tours & Experiencias' },
  { id: 'transfer', label: '🚐 Transportes / Traslados' },
  { id: 'paquete', label: '🏨 Paquetes Personalizados' },
];

const InputField = ({ icon: Icon, label, required, children, error }) => (
  <div>
    <label className="label flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold mb-1">
      {Icon && <Icon size={14} className="text-sky-500" />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
  </div>
);

export default function Sales() {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('tour');
  const [loading, setLoading] = useState(false);

  // Selecciones interactivas para Tours
  const [selectedTour, setSelectedTour] = useState(null);
  
  // Selecciones interactivas para Traslados
  const [selectedRuta, setSelectedRuta] = useState(null);
  const [selectedCapacidad, setSelectedCapacidad] = useState(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      personas: 1,
      monto: '',
      valorNeto: 0,
      gananciaPromotor: 50,
      gananciaEmpresa: 0,
    }
  });

  const personas = watch('personas') || 1;
  const montoVenta = watch('monto') || 0;

  // Manejador al seleccionar un Tour
  const handleTourChange = (e) => {
    const tourNombre = e.target.value;
    let found = null;
    for (const cat of CATEGORIAS_TOURS) {
      const item = cat.items.find(i => i.nombre === tourNombre);
      if (item) {
        found = item;
        break;
      }
    }
    setSelectedTour(found);
    if (found) {
      setValue('servicio', found.nombre);
      setValue('codigoTour', found.id);
      setValue('valorNeto', found.neto);
      setValue('monto', found.venta);
      setValue('gananciaPromotor', found.comision);
      setValue('gananciaEmpresa', (found.venta - found.neto - found.comision));
    }
  };

  // Manejador para Traslados
  const handleRutaChange = (e) => {
    const rutaId = e.target.value;
    const ruta = RUTAS_TRASLADOS.find(r => r.id === rutaId);
    setSelectedRuta(ruta);
    setSelectedCapacidad(null);
  };

  const handleCapacidadChange = (e) => {
    const tipo = e.target.value;
    if (!selectedRuta) return;
    const cap = selectedRuta.capacidad.find(c => c.tipo === tipo);
    setSelectedCapacidad(cap);
    if (cap) {
      setValue('servicio', `${selectedRuta.ruta} (${cap.tipo})`);
      setValue('codigoTour', selectedRuta.id);
      setValue('valorNeto', cap.neto);
      setValue('monto', cap.venta);
      setValue('gananciaPromotor', cap.comision);
      setValue('gananciaEmpresa', (cap.venta - cap.neto - cap.comision));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const numPersonas = parseInt(data.personas) || 1;
      const ventaUnitaria = parseFloat(data.monto) || 0;
      const netoUnitario = parseFloat(data.valorNeto) || 0;
      const comisionUnitaria = parseFloat(data.gananciaPromotor) || 0;

      const totalVenta = ventaUnitaria * numPersonas;
      const totalNeto = netoUnitario * numPersonas;
      const totalComision = comisionUnitaria * numPersonas;
      const totalGananciaEmpresa = totalVenta - totalNeto - totalComision;

      const ventaData = {
        vendedorId: currentUser.uid,
        promotorNombre: userProfile?.nombre || currentUser.displayName || 'Vendedor',
        tipo: activeTab,
        cliente: {
          nombre: data.clienteNombre,
          email: data.clienteEmail,
          telefono: data.clienteTelefono,
          pais: data.clientePais || '',
        },
        codigoTour: data.codigoTour || '',
        servicio: data.servicio,
        fecha: data.fecha || '',
        hora: data.hora || '',
        personas: numPersonas,
        
        // Métricas financieras
        valorNeto: netoUnitario,
        monto: totalVenta, // Total venta para el dashboard
        precioUnitario: ventaUnitaria,
        gananciaPromotor: totalComision,
        gananciaEmpresa: totalGananciaEmpresa,
        moneda: 'BRL',
        
        notas: data.notas || '',
        fuente: 'MANUAL',
        creadoEn: serverTimestamp(),
      };

      await addDoc(collection(db, 'ventas'), ventaData);
      toast.success('¡Venta registrada con éxito! 🎉');
      reset();
      setSelectedTour(null);
      setSelectedRuta(null);
      setSelectedCapacidad(null);
    } catch (err) {
      console.error("Error al registrar:", err);
      toast.error('Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (name) =>
    `input-field ${errors[name] ? 'border-red-400 ring-1 ring-red-200' : ''}`;
  const req = { required: 'Campo obligatorio' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">🌴</span>
            <span className="text-xs font-bold tracking-widest text-sky-600 dark:text-sky-400 uppercase bg-sky-100 dark:bg-sky-900/40 px-2.5 py-1 rounded-full">
              Catálogo Oficial Travel in Rio
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Registrar Venta</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Los precios y comisiones se autocompletan de acuerdo con el tarifario oficial en Reales (R$).
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedTour(null);
                setSelectedRuta(null);
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card space-y-6">
            {/* 1. Datos del cliente */}
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-base">
                <span className="w-6 h-6 bg-sky-100 dark:bg-sky-900/40 rounded-full flex items-center justify-center text-xs font-extrabold text-sky-600">1</span>
                Datos del cliente
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField icon={User} label="Nombre Completo" required error={errors.clienteNombre?.message}>
                  <input className={fieldClass('clienteNombre')} placeholder="Nombre del cliente" {...register('clienteNombre', req)} />
                </InputField>
                <InputField icon={Mail} label="Correo Electrónico" required error={errors.clienteEmail?.message}>
                  <input type="email" className={fieldClass('clienteEmail')} placeholder="cliente@correo.com" {...register('clienteEmail', { required: 'Campo obligatorio' })} />
                </InputField>
                <InputField icon={Phone} label="Teléfono / WhatsApp" required error={errors.clienteTelefono?.message}>
                  <input className={fieldClass('clienteTelefono')} placeholder="+56 9 ... o +55 21 ..." {...register('clienteTelefono', req)} />
                </InputField>
                <InputField icon={MapPin} label="País / Origen">
                  <input className="input-field" placeholder="Chile, Argentina, etc." {...register('clientePais')} />
                </InputField>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-700" />

            {/* 2. Selección del Servicio según Catálogo */}
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-base">
                <span className="w-6 h-6 bg-sky-100 dark:bg-sky-900/40 rounded-full flex items-center justify-center text-xs font-extrabold text-sky-600">2</span>
                Selección de Servicio & Tarifas
              </h3>

              {activeTab === 'tour' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <InputField icon={Compass} label="Selecciona el Tour / Experiencia" required error={errors.servicio?.message}>
                      <select className={fieldClass('servicio')} onChange={handleTourChange}>
                        <option value="">-- Elige un tour del catálogo oficial --</option>
                        {CATEGORIAS_TOURS.map((cat) => (
                          <optgroup key={cat.categoria} label={cat.categoria}>
                            {cat.items.map((item) => (
                              <option key={item.id} value={item.nombre}>
                                {item.nombre} — Venta: R$ {item.venta} (Neto: R$ {item.neto})
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </InputField>
                  </div>

                  <InputField icon={Calendar} label="Fecha del Tour" required error={errors.fecha?.message}>
                    <input type="date" className={fieldClass('fecha')} {...register('fecha', req)} />
                  </InputField>

                  <InputField icon={Clock} label="Horario de recogida">
                    <input type="time" className="input-field" {...register('hora')} />
                  </InputField>

                  <InputField icon={Users} label="Cantidad de Personas (PAX)" required error={errors.personas?.message}>
                    <input type="number" min="1" className={fieldClass('personas')} {...register('personas', req)} />
                  </InputField>

                  <InputField icon={DollarSign} label="Precio Venta unitario (R$)" required error={errors.monto?.message}>
                    <input type="number" step="1" className={fieldClass('monto')} {...register('monto', req)} />
                  </InputField>
                </div>
              )}

              {activeTab === 'transfer' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <InputField icon={Navigation} label="Ruta de Traslado" required>
                      <select className="input-field" onChange={handleRutaChange}>
                        <option value="">-- Selecciona la ruta --</option>
                        {RUTAS_TRASLADOS.map(r => (
                          <option key={r.id} value={r.id}>{r.ruta}</option>
                        ))}
                      </select>
                    </InputField>
                  </div>

                  <div>
                    <InputField icon={Users} label="Capacidad / Tipo Vehículo" required>
                      <select className="input-field" onChange={handleCapacidadChange} disabled={!selectedRuta}>
                        <option value="">-- Elige vehículo / pax --</option>
                        {selectedRuta?.capacidad.map(c => (
                          <option key={c.tipo} value={c.tipo}>
                            {c.tipo} — Venta: R$ {c.venta} (Neto: R$ {c.neto})
                          </option>
                        ))}
                      </select>
                    </InputField>
                  </div>

                  <InputField icon={Calendar} label="Fecha del Traslado" required error={errors.fecha?.message}>
                    <input type="date" className={fieldClass('fecha')} {...register('fecha', req)} />
                  </InputField>

                  <InputField icon={Clock} label="Hora de Vuelo / Traslado" required error={errors.hora?.message}>
                    <input type="time" className={fieldClass('hora')} {...register('hora', req)} />
                  </InputField>

                  <InputField icon={Users} label="Total Personas">
                    <input type="number" min="1" className="input-field" {...register('personas')} />
                  </InputField>
                </div>
              )}

              {activeTab === 'paquete' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <InputField icon={Compass} label="Descripción del Paquete" required error={errors.servicio?.message}>
                      <input className={fieldClass('servicio')} placeholder="Ej: Full Day + Angra + Transfer GIG" {...register('servicio', req)} />
                    </InputField>
                  </div>
                  <InputField icon={Calendar} label="Fecha de inicio" required error={errors.fecha?.message}>
                    <input type="date" className={fieldClass('fecha')} {...register('fecha', req)} />
                  </InputField>
                  <InputField icon={Users} label="Personas" required error={errors.personas?.message}>
                    <input type="number" min="1" className={fieldClass('personas')} {...register('personas', req)} />
                  </InputField>
                  <InputField icon={DollarSign} label="Monto Total (R$)" required error={errors.monto?.message}>
                    <input type="number" className={fieldClass('monto')} placeholder="Total paquete" {...register('monto', req)} />
                  </InputField>
                </div>
              )}
            </div>

            {/* Tarjeta resumen de ganancia en vivo */}
            <div className="bg-sky-50 dark:bg-slate-700/40 rounded-2xl p-5 border border-sky-100 dark:border-slate-600">
              <h4 className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Percent size={14} /> Resumen Financiero Calculado
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Venta Cliente</p>
                  <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">
                    R$ {(montoVenta * personas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tu Comisión Promotor</p>
                  <p className="text-xl font-extrabold text-green-600 dark:text-green-400 mt-0.5">
                    R$ {((watch('gananciaPromotor') || 0) * personas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Valor Neto Proveedor</p>
                  <p className="text-xl font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                    R$ {((watch('valorNeto') || 0) * personas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Margen Agencia</p>
                  <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                    R$ {((watch('gananciaEmpresa') || 0) * personas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-700" />

            {/* 3. Notas */}
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-base">
                <span className="w-6 h-6 bg-sky-100 dark:bg-sky-900/40 rounded-full flex items-center justify-center text-xs font-extrabold text-sky-600">3</span>
                Observaciones y Detalles del Pasajero
              </h3>
              <InputField icon={FileText} label="Notas adicionales (hotel de recogida, requerimientos, etc.)">
                <textarea
                  className="input-field resize-none h-20"
                  placeholder="Hotel Copa Sul, habitación 402..."
                  {...register('notas')}
                />
              </InputField>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 text-base py-3.5 px-8 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  'Registrar Venta →'
                )}
              </button>
              <button type="button" onClick={() => reset()} className="btn-secondary">
                Limpiar Formulario
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
