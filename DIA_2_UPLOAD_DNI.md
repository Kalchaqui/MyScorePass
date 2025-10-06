# 📅 Día 2: Sistema de Upload DNI + Aprobación Admin

## 🎯 Objetivo: Usuario sube DNI → Admin ve y aprueba → Usuario puede pedir préstamos

---

## 🏗️ Lo que Vamos a Construir:

```
┌────────────────────────────────────────┐
│ USUARIO NUEVO (Privy logueado)        │
├────────────────────────────────────────┤
│ 1. Dashboard → "Subir DNI"             │
│ 2. Sube foto/imagen de DNI             │
│ 3. Ve mensaje: "Pendiente aprobación"  │
│ 4. Espera...                           │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ ADMIN (tu wallet especial)             │
├────────────────────────────────────────┤
│ 1. Panel Admin → Lista de pendientes   │
│ 2. Ve foto del DNI del usuario         │
│ 3. Acepta o Rechaza                    │
│ 4. Si acepta → user puede pedir        │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ USUARIO APROBADO                       │
├────────────────────────────────────────┤
│ 1. Ve: "✅ Aprobado - Nivel 2"         │
│ 2. Puede calcular score                │
│ 3. Puede solicitar préstamos           │
└────────────────────────────────────────┘
```

---

## 📦 Backend API a Crear:

### **1. POST /api/upload-dni**

```javascript
// Recibe:
{
  privyUserId: "did:privy:xxx",
  walletAddress: "0x...",
  email: "user@email.com",
  dniImage: File
}

// Guarda en:
users: [{
  id: 1,
  privyUserId: "did:privy:xxx",
  walletAddress: "0x...",
  email: "user@email.com",
  dniImageUrl: "/uploads/dni_1.jpg",
  status: "pending",
  createdAt: timestamp
}]

// Retorna:
{
  success: true,
  status: "pending",
  message: "DNI subido, esperando aprobación"
}
```

---

### **2. GET /api/admin/pending-users**

```javascript
// Solo si caller es admin (0x6cef...)

// Retorna:
[{
  id: 1,
  email: "user@email.com",
  walletAddress: "0x...",
  dniImageUrl: "/uploads/dni_1.jpg",
  status: "pending",
  createdAt: "2025-10-05T20:00:00Z"
}]
```

---

### **3. POST /api/admin/approve**

```javascript
// Recibe:
{
  userId: 1,
  approved: true,  // o false
  verificationLevel: 2,
  reason: "Documentación válida" // opcional
}

// Si aprobado:
// 1. Actualiza status en DB → "approved"
// 2. Llama smart contract:
//    IdentityRegistry.verifyIdentity(walletAddress, level)
// 3. (Opcional) Envía email al usuario

// Retorna:
{
  success: true,
  message: "Usuario aprobado"
}
```

---

### **4. GET /api/user/status/:walletAddress**

```javascript
// Usuario consulta su estado

// Retorna:
{
  status: "pending" | "approved" | "rejected",
  verificationLevel: 0 | 1 | 2 | 3,
  message: "..."
}
```

---

## 🎨 Frontend a Crear:

### **1. Página: /onboarding**

```jsx
// Nueva página después del login
// Si no tiene DNI subido → muestra upload
// Si tiene DNI pendiente → muestra "esperando"
// Si aprobado → redirect a dashboard

<div>
  <h2>Sube tu DNI</h2>
  <DragDropZone />
  <button>Subir DNI</button>
</div>
```

---

### **2. Mejorar: /admin**

```jsx
// Lista de usuarios pendientes
<div>
  {pendingUsers.map(user => (
    <div key={user.id}>
      <img src={user.dniImageUrl} />
      <p>{user.email}</p>
      <p>{user.walletAddress}</p>
      <button onClick={() => approve(user.id, 2)}>
        Aprobar (Nivel 2)
      </button>
      <button onClick={() => reject(user.id)}>
        Rechazar
      </button>
    </div>
  ))}
</div>
```

---

### **3. Componente: StatusBanner**

```jsx
// Mostrar en dashboard si no está aprobado

{status === 'pending' && (
  <div className="warning-banner">
    ⏳ Tu cuenta está pendiente de aprobación
  </div>
)}

{status === 'approved' && (
  <div className="success-banner">
    ✅ Cuenta aprobada - Puedes solicitar préstamos
  </div>
)}
```

---

## 🗂️ Base de Datos Simple:

**Opción 1: JSON file** (más simple)

```javascript
// backend/data/users.json
[
  {
    "id": 1,
    "privyUserId": "did:privy:xxx",
    "walletAddress": "0x...",
    "email": "user@email.com",
    "dniImageUrl": "/uploads/dni_1.jpg",
    "status": "pending",
    "verificationLevel": 0,
    "createdAt": "2025-10-05T20:00:00Z"
  }
]
```

**Opción 2: MongoDB/PostgreSQL** (más robusto)

---

## ⏱️ Tiempo Estimado Día 2:

```
Mañana (4 horas):
├─ Backend API endpoints (2.5 horas)
├─ Upload de archivos (1 hora)
└─ Testing (0.5 horas)

Tarde (3 horas):
├─ Página /onboarding (1.5 horas)
├─ Admin panel mejorado (1 hora)
└─ Testing completo (0.5 horas)

Total: 7 horas
```

---

## 🛠️ Dependencias Adicionales Necesarias:

```bash
# Backend
npm install multer  # Ya lo tienes
npm install uuid    # IDs únicos

# Frontend  
npm install react-dropzone  # Drag & drop
```

---

## ✅ Checklist Día 2:

```
□ Endpoint POST /api/upload-dni
□ Endpoint GET /api/admin/pending-users
□ Endpoint POST /api/admin/approve
□ Endpoint GET /api/user/status
□ Página /onboarding con upload
□ Admin panel con lista de pendientes
□ Status banner en dashboard
□ Testing flujo completo
```

---

## 🎯 Resultado Final Día 2:

Usuario → Login → Upload DNI → Espera → Admin aprueba → Usuario pide préstamo

**TODO desde el navegador, sin Remix!** 🚀

---

Mañana empezamos temprano con esto 😊
