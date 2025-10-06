# 📋 Plan Simplificado - DeFiCred con Privy + KYC Manual

## 🎯 Objetivo: Login Social + Upload DNI + Aprobación Admin

---

## 🏗️ ARQUITECTURA SIMPLIFICADA

```
┌─────────────────────────────────────────────────────────┐
│  FLUJO COMPLETO                                         │
└─────────────────────────────────────────────────────────┘

USUARIO NUEVO:
1. Abre app → Click "Iniciar Sesión"
2. Login con Email/Google (Privy)
3. Sistema crea wallet automáticamente
4. Sube foto de DNI
5. Estado: "Esperando aprobación"

ADMIN (0x6cef...):
6. Ve lista de usuarios pendientes
7. Ve foto del DNI de cada usuario
8. Acepta o Rechaza

USUARIO APROBADO:
9. Puede calcular score
10. Puede solicitar préstamos

USUARIO RECHAZADO:
11. No puede continuar
```

---

## 📊 CAMBIOS EN EL SISTEMA

### **Frontend:**

```
ANTES:
- ConnectButton (MetaMask)
- Usuario necesita wallet

AHORA:
- Login con email/Google (Privy)
- Wallet se crea automática
- Upload de DNI
- Estado de aprobación
```

### **Backend:**

```javascript
// Estructura de usuario
{
  privyUserId: "did:privy:xxx",
  walletAddress: "0x...",
  email: "user@email.com",
  dniImageUrl: "ipfs://Qm...",
  status: "pending" | "approved" | "rejected",
  approvedBy: "0x6cef..." | null,
  createdAt: timestamp
}
```

### **Smart Contract:**

```solidity
// Sin cambios mayores
// La aprobación se maneja en backend
// Cuando admin aprueba → llama verifyIdentity on-chain
```

---

## 🗓️ PLAN DE 7 DÍAS REVISADO

### DÍA 1 (HOY) - Privy Integration

**Tareas:**
- [x] Instalar Privy ✅
- [x] Configurar providers ✅
- [ ] Actualizar todas las páginas para Privy
- [ ] Probar login con email
- [ ] Probar wallet embedded

**Tiempo:** 4-5 horas

---

### DÍA 2 - Sistema de Upload DNI

**Frontend:**
- [ ] Página /onboarding con upload de DNI
- [ ] Drag & drop para imagen
- [ ] Preview de la imagen
- [ ] Submit a backend

**Backend:**
- [ ] Endpoint POST /api/upload-dni
- [ ] Guardar imagen en IPFS o servidor
- [ ] Guardar en base de datos:
  ```javascript
  users.push({
    privyUserId,
    walletAddress,
    email,
    dniImageUrl,
    status: "pending"
  })
  ```

**Tiempo:** 6-7 horas

---

### DÍA 3 - Admin Dashboard Mejorado

**Frontend - Admin Panel:**
- [ ] Lista de usuarios pendientes
- [ ] Ver DNI de cada usuario
- [ ] Botones: Aprobar / Rechazar
- [ ] Razón de rechazo (textarea)

**Backend:**
- [ ] Endpoint POST /api/admin/approve
- [ ] Verificar que caller sea admin (0x6cef...)
- [ ] Si aprueba → llamar IdentityRegistry.verifyIdentity on-chain
- [ ] Actualizar status en DB

**Tiempo:** 6-7 horas

---

### DÍA 4 - Estados y Notificaciones

**Frontend:**
- [ ] Dashboard muestra estado actual
- [ ] "Pendiente de aprobación" (amarillo)
- [ ] "Aprobado" (verde) → puede continuar
- [ ] "Rechazado" (rojo) → mensaje

**Backend:**
- [ ] Notificaciones por email (opcional)
- [ ] Webhook cuando cambia estado

**Tiempo:** 4-5 horas

---

### DÍA 5 - Prevención de Duplicados

**Backend:**
- [ ] Hash del DNI antes de guardar
- [ ] Verificar unicidad: checkDNIExists(hash)
- [ ] Si existe → rechazar registro
- [ ] Mensaje: "Este DNI ya está registrado"

**Smart Contract (opcional):**
- [ ] mapping(bytes32 dniHash => address wallet)
- [ ] On-chain verification de unicidad

**Tiempo:** 5-6 horas

---

### DÍA 6 - Testing + Polish

**Testing:**
- [ ] Flujo completo con 3 usuarios diferentes
- [ ] Aprobar 1, rechazar 1, dejar 1 pendiente
- [ ] Verificar que duplicados no funcionen
- [ ] Testing de préstamos completo

**Polish:**
- [ ] Mejorar mensajes de error
- [ ] Animaciones suaves
- [ ] Loading states
- [ ] Responsive mobile

**Tiempo:** 7-8 horas

---

### DÍA 7 - Demo + Presentación

**Demo:**
- [ ] Video demo de 3 minutos
- [ ] Screenshots profesionales
- [ ] Wallet de prueba lista

**Presentación:**
- [ ] Actualizar slides
- [ ] Practicar pitch
- [ ] Preparar respuestas a preguntas

**Tiempo:** Full day

---

## 🔧 IMPLEMENTACIÓN HOY (Día 1)

Voy a actualizar las páginas restantes para Privy ahora mismo.

**¿Continuamos?** 🚀
