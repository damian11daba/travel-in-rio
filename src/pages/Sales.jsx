// src/pages/Sales.jsx
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import Navbar from '../components/layout/Navbar';
import { MapPin, Users, Calendar, DollarSign, Phone, Mail, User, FileText, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { id: 'tour', label: '🗺️ Tours y Excursiones' },
  { id: 'transfer', label: '🚐 Transfers' },
  { id: 'paquete', label: '🏨 Paquetes Turísticos' },
];

const TOURS = [
  'Cristo Redentor',
  'Pan de Azúcar',
  'Favela Tour',
  'Lagoa y Jardín Botánico',
  'Tour por Ipanema y Copacabana',
  'Isla de Paquetá',
  'Cascatinha Taunay',
  'Paragliding en Pedra Bonita',
  'Rafting en Petrópolis',
  'City Tour Río de Janeiro',
  'Otro',
];

const TRANSFERS = [
  'Aeropuerto Galeão → Hotel',
  'Hotel → Aeropuerto Galeão',
  'Aeropuerto Santos Dumont → Hotel',
  'Hotel → Aeropuerto Santos Dumont',
  'Terminal de Cruceros → Hotel',
  'Hotel → Terminal de Cruceros',
  'Traslado interurbano',
  'Otro',
];

const PAQUETES = [
  'Pack Esencial (3 noches + City Tour)',
  'Pack Completo (5 noches + 3 tours)',
  'Pack Premium (7 noches + tours ilimitados)',
  'Pack Romántico (4 noches + cena)',
  'Pack Aventura (5 noches + actividades extremas)',
  'Pack Personalizado',
];

const InputField = ({ icon: Icon, label, required, children, error }) => (
  <div>
    <label className="label flex items-center gap-1">
      {Icon && <Icon size={12} />}
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export default function Sales() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tour');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const ventaData = {
        vendedorId: currentUser.uid,
        tipo: activeTab,
        cliente: {
          nombre: data.clienteNombre,
          email: data.clienteEmail,
          telefono: data.clienteTelefono,
          pais: data.clientePais || '',
        },
        servicio: data.servicio,
        fecha: data.fecha || '',
        personas: parseInt(data.personas) || 1,
        monto: parseFloat(data.monto) || 0,
        moneda: 'BRL',
        notas: data.notas || '',
        fuente: 'MANUAL',
        creadoEn: serverTimestamp(),
        // Transfer specific
        origen: data.origen || '',
        destino: data.destino || '',
        hora: data.hora || '',
        // Paquete specific
        checkIn: data.checkIn || '',
        checkOut: data.checkOut || '',
      };

      await addDoc(collection(db, 'ventas'), ventaData);
      toast.success('¡Venta registrada con éxito! 🎉');
      reset();
    } catch (err) {
      console.error(err);
      toast.error('Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (name) =>
    `input-field ${errors[name] ? 'border-red-400 ring-1 ring-red-200' : ''}`;

  const req = { required: 'Campo obligatorio' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Registrar venta</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Registra una nueva venta ingresando los datos del cliente y el servicio.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
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
            {/* Datos del cliente */}
            <div>
              <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-sky-100 dark:bg-sky-900/40 rounded-full flex items-center justify-center text-xs font-bold text-sky-600">1</span>
                Datos del cliente
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField icon={User} label="Nombre completo" required error={errors.clienteNombre?.message}>
                  <input className={fieldClass('clienteNombre')} placeholder="Juan García" {...register('clienteNombre', req)} />
                </InputField>
                <InputField icon={Mail} label="Correo electrónico" required error={errors.clienteEmail?.message}>
                  <input type="email" className={fieldClass('clienteEmail')} placeholder="cliente@correo.com" {...register('clienteEmail', { required: 'Campo obligatorio', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' } })} />
                </InputField>
                <InputField icon={Phone} label="Teléfono" required error={errors.clienteTelefono?.message}>
                  <input className={fieldClass('clienteTelefono')} placeholder="+55 21 99999-9999" {...register('clienteTelefono', req)} />
                </InputField>
                <InputField icon={MapPin} label="País de origen">
                  <input className="input-field" placeholder="Argentina, Chile, EE.UU..." {...register('clientePais')} />
                </InputField>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-700" />

            {/* Servicio */}
            <div>
              <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-sky-100 dark:bg-sky-900/40 rounded-full flex items-center justify-center text-xs font-bold text-sky-600">2</span>
                Detalles del servicio
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Tour */}
                {activeTab === 'tour' && (
                  <>
                    <InputField icon={MapPin} label="Tour / Excursión" required error={errors.servicio?.message}>
                      <select className={fieldClass('servicio')} {...register('servicio', req)}>
                        <option value="">Seleccionar tour...</option>
                        {TOURS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </InputField>
                    <InputField icon={Calendar} label="Fecha del tour" required error={errors.fecha?.message}>
                      <input type="date" className={fieldClass('fecha')} {...register('fecha', req)} />
                    </InputField>
                    <InputField icon={Clock} label="Hora">
                      <input type="time" className="input-field" {...register('hora')} />
                    </InputField>
                    <InputField icon={Users} label="Cantidad de personas" required error={errors.personas?.message}>
                      <input type="number" min="1" className={fieldClass('personas')} placeholder="2" {...register('personas', req)} />
                    </InputField>
                  </>
                )}

                {/* Transfer */}
                {activeTab === 'transfer' && (
                  <>
                    <InputField icon={MapPin} label="Servicio de transfer" required error={errors.servicio?.message}>
                      <select className={fieldClass('servicio')} {...register('servicio', req)}>
                        <option value="">Seleccionar transfer...</option>
                        {TRANSFERS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </InputField>
                    <InputField icon={MapPin} label="Origen" required error={errors.origen?.message}>
                      <input className={fieldClass('origen')} placeholder="Ej: Aeropuerto Galeão" {...register('origen', req)} />
                    </InputField>
                    <InputField icon={MapPin} label="Destino" required error={errors.destino?.message}>
                      <input className={fieldClass('destino')} placeholder="Ej: Hotel Copacabana" {...register('destino', req)} />
                    </InputField>
                    <InputField icon={Calendar} label="Fecha" required error={errors.fecha?.message}>
                      <input type="date" className={fieldClass('fecha')} {...register('fecha', req)} />
                    </InputField>
                    <InputField icon={Clock} label="Hora" required error={errors.hora?.message}>
                      <input type="time" className={fieldClass('hora')} {...register('hora', req)} />
                    </InputField>
                    <InputField icon={Users} label="Pasajeros" required error={errors.personas?.message}>
                      <input type="number" min="1" className={fieldClass('personas')} placeholder="2" {...register('personas', req)} />
                    </InputField>
                  </>
                )}

                {/* Paquete */}
                {activeTab === 'paquete' && (
                  <>
                    <InputField icon={MapPin} label="Paquete turístico" required error={errors.servicio?.message}>
                      <select className={fieldClass('servicio')} {...register('servicio', req)}>
                        <option value="">Seleccionar paquete...</option>
                        {PAQUETES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </InputField>
                    <InputField icon={Calendar} label="Check-in" required error={errors.checkIn?.message}>
                      <input type="date" className={fieldClass('checkIn')} {...register('checkIn', req)} />
                    </InputField>
                    <InputField icon={Calendar} label="Check-out" required error={errors.checkOut?.message}>
                      <input type="date" className={fieldClass('checkOut')} {...register('checkOut', req)} />
                    </InputField>
                    <InputField icon={Users} label="Personas" required error={errors.personas?.message}>
                      <input type="number" min="1" className={fieldClass('personas')} placeholder="2" {...register('personas', req)} />
                    </InputField>
                  </>
                )}

                {/* Common: monto */}
                <InputField icon={DollarSign} label="Monto (R$)" required error={errors.monto?.message}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={fieldClass('monto')}
                    placeholder="500.00"
                    {...register('monto', { required: 'Campo obligatorio', min: { value: 0.01, message: 'Debe ser mayor a 0' } })}
                  />
                </InputField>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-700" />

            {/* Notas */}
            <div>
              <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-sky-100 dark:bg-sky-900/40 rounded-full flex items-center justify-center text-xs font-bold text-sky-600">3</span>
                Notas adicionales
              </h3>
              <InputField icon={FileText} label="Observaciones (opcional)">
                <textarea
                  className="input-field resize-none h-24"
                  placeholder="Información adicional, solicitudes especiales del cliente..."
                  {...register('notas')}
                />
              </InputField>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  '✅ Registrar venta'
                )}
              </button>
              <button type="button" onClick={() => reset()} className="btn-secondary">
                Limpiar
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
