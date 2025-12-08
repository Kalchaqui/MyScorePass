# Plan de Integración de Privy

## Objetivo
Reemplazar el sistema de autenticación actual (JWT manual) con Privy, manteniendo compatibilidad con:
- Backend JWT existente
- x402 payments (Thirdweb)
- Wallets (RainbowKit/Wagmi)

## Pasos de Implementación

### 1. Instalación
```bash
npm install @privy-io/react-auth
```

### 2. Configuración de Privy Dashboard
- Crear cuenta en https://privy.io
- Obtener App ID y App Secret
- Configurar métodos de login: Email/Password (para B2B)

### 3. Variables de Entorno
Agregar a `frontend/.env.local`:
```
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id
PRIVY_APP_SECRET=your_app_secret
```

### 4. Archivos a Modificar

#### `frontend/app/providers.tsx`
- Agregar `PrivyProvider` envolviendo la app
- Configurar con App ID
- Mantener ThirdwebProvider y RainbowKitProvider

#### `frontend/app/login/page.tsx`
- Reemplazar formulario manual con Privy's `usePrivy()` hook
- Usar `login()` de Privy para email/password
- Mantener diseño visual actual

#### `frontend/lib/auth.ts`
- Integrar Privy con backend JWT
- Cuando Privy autentica, obtener token del backend
- Mantener funciones `getCurrentExchange()`, `getAuthHeaders()`

#### `frontend/middleware.ts`
- Usar Privy middleware para proteger rutas
- O usar `usePrivy().ready` en componentes

#### `frontend/app/dashboard/*`
- Usar `usePrivy()` para verificar autenticación
- Obtener token JWT del backend después de Privy auth

### 5. Flujo de Autenticación

1. Usuario inicia sesión con Privy (email/password)
2. Privy autentica y devuelve `user` object
3. Frontend llama a backend `/api/auth/privy-login` con `privyUserId`
4. Backend crea/obtiene exchange y devuelve JWT token
5. Frontend guarda JWT token para llamadas al backend
6. Backend sigue usando JWT para autenticación

### 6. Ventajas de Privy
- ✅ Autenticación robusta con email/password
- ✅ Compatible con wallets (si se necesita después)
- ✅ UI personalizable
- ✅ Manejo de sesiones automático
- ✅ Compatible con Next.js 14

### 7. Compatibilidad
- ✅ Backend JWT: Se mantiene, solo cambia cómo se obtiene el token inicial
- ✅ x402: No afecta, Thirdweb sigue funcionando
- ✅ Wallets: Privy puede manejar wallets también si se necesita

## Notas Importantes
- Privy maneja la autenticación del frontend
- El backend sigue usando JWT (no cambia)
- Necesitamos crear endpoint `/api/auth/privy-login` en backend para sincronizar Privy user con Exchange

