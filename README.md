# Travel in Rio — Plataforma de Gestión de Ventas

Aplicación web para el equipo de ventas de **Travel in Rio**, empresa de turismo en Río de Janeiro, Brasil.

## 🚀 Tecnologías

- **React 18 + Vite**
- **Tailwind CSS**
- **Firebase** (Authentication + Firestore)
- **React Router v6**
- **React Hook Form**
- **Lucide React** (íconos)

## ⚙️ Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/damian11daba/travel-in-rio.git
cd travel-in-rio
npm install
```

### 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto llamado `travel-in-rio`
3. Activa **Authentication** → Email/Password
4. Activa **Firestore Database**
5. Copia las credenciales y crea el archivo `.env.local`:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

### 4. Build para producción

```bash
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── layout/     → Navbar, PrivateRoute
│   ├── ui/         → Card, Button, Input, Badge
│   └── forms/      → SaleForm con tabs por tipo
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Sales.jsx
│   └── History.jsx
├── context/
│   └── AuthContext.jsx
├── firebase/
│   └── config.js
└── hooks/
    └── useDarkMode.js
```

## 📊 Tipos de Venta

- **Tours y Excursiones** — destino, fecha, cantidad de personas
- **Transfers** — origen → destino, fecha/hora
- **Paquetes Turísticos** — check-in / check-out, hotel + tour

## 💰 Moneda

Todas las ventas se registran en **BRL (Reales brasileños)**.

---

Desarrollado para Travel in Rio 🌴
