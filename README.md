# MyScorePass - Credit Scoring Infrastructure for Exchanges

> **First commit for MVP**

<div align="center">
  <h3>🏆 Hack2Build: Payments x402 Hackathon - Avalanche</h3>
  <p>Infraestructura B2B de scoring crediticio con pagos x402 para exchanges y bancos</p>
</div>

## 📋 Descripción

MyScorePass es una plataforma B2B que proporciona infraestructura de scoring crediticio para exchanges, bancos e instituciones financieras. Los clientes pueden:

1. **Registrarse como exchange/banco** con autenticación tradicional
2. **Comprar suscripciones prepago** vía x402 (ej: 1,000 USDC = 10 consultas)
3. **Consultar base de datos mockeada** de 100 usuarios con scores e identidades
4. **Consumir créditos automáticamente** por cada consulta realizada

Modelo de negocio: Los exchanges compran créditos y consultan usuarios mockeados para testing y desarrollo.

## 🌐 Red

**Avalanche Fuji Testnet** (Chain ID: 43113)

## 🏗️ Arquitectura MVP

### Backend (Node.js + Express)

- **`/api/auth`**: Autenticación de exchanges
  - `POST /api/auth/register` - Registro de exchange
  - `POST /api/auth/login` - Login de exchange
  - `GET /api/auth/me` - Información del exchange autenticado

- **`/api/subscriptions`**: Gestión de suscripciones y créditos
  - `POST /api/subscriptions/purchase` - Comprar créditos vía x402 (1,000 USDC = 10 créditos)
  - `GET /api/subscriptions/balance` - Obtener saldo de créditos
  - `GET /api/subscriptions/usage` - Historial de compras y consumo

- **`/api/mockUsers`**: Consulta de usuarios mockeados
  - `GET /api/mockUsers` - Listar usuarios (consume 1 crédito)
  - `GET /api/mockUsers/:id` - Detalle de usuario (consume 1 crédito)
  - `GET /api/mockUsers/stats` - Estadísticas de la base de datos

- **`/api/exchanges`**: Gestión de información de exchanges
  - `GET /api/exchanges/me` - Información del exchange
  - `PUT /api/exchanges/me` - Actualizar información

### Frontend (Next.js 14)

- **`/`** - Página principal con información del servicio B2B
- **`/login`** - Login y registro de exchanges
- **`/dashboard`** - Dashboard principal con saldo y estadísticas
- **`/dashboard/users`** - Consultar usuarios mockeados
- **`/dashboard/subscription`** - Comprar créditos vía x402
- **`/dashboard/usage`** - Ver historial de compras y consumo

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- Wallet compatible (MetaMask, Core Wallet, u otra compatible con EIP-1193)
- Avalanche Fuji Testnet configurado en tu wallet
- Cuenta de Thirdweb (para x402 facilitator) - opcional para MVP

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd Loanet

# Instalar dependencias del frontend
cd frontend
npm install

# Instalar dependencias del backend
cd ../backend
npm install

# Instalar dependencias de contratos
cd ../contracts
npm install
```

### Configuración

#### Frontend

Crear `frontend/.env.local`:

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=95c681fed611038183e9f022713f6212
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Backend

Crear `backend/.env`:

```env
PORT=3001
JWT_SECRET=myscorepass-jwt-secret-change-in-production

# Thirdweb x402 (Opcional - si no se configura, funciona en modo simulado)
THIRDWEB_SECRET_KEY=PUcYKHrbU8um7_8EPGsICFpqYSEasqzPxniMjyCB44X-FnRzjEzwarccfwfUa-pkaNXbTTER6jp3zcJtLaVj0Q
THIRDWEB_SERVER_WALLET_ADDRESS=0x4DE893AF2077552E539Cd926b660159bBb1e0413
MERCHANT_WALLET_ADDRESS=0x5d7282E3fe75956E2E1a1625a17c26e9766662FA
```

> **Nota**: Las direcciones de contratos ya no son necesarias para el modelo B2B actual. La base de datos es mockeada.

### Ejecutar

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

La aplicación estará disponible en:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

## 🧪 Testing para Jueces del Hackathon

### Flujo de Prueba Completo

1. **Registrar Exchange**
   - Abrir `http://localhost:3000`
   - Ir a `/login` y hacer clic en "Registrarse"
   - Completar formulario:
     - Nombre: "Binance Test"
     - Email: "test@binance.com"
     - Contraseña: "password123"
     - Wallet Address (opcional)

2. **Login**
   - Iniciar sesión con las credenciales creadas
   - Serás redirigido al dashboard

3. **Comprar Créditos vía x402**
   - Ir a `/dashboard/subscription`
   - Seleccionar cantidad de créditos (mínimo 10)
   - Hacer clic en "Comprar créditos"
   - El sistema responderá con HTTP 402
   - Confirmar pago simulado
   - Los créditos se acreditarán automáticamente

4. **Consultar Usuarios Mockeados**
   - Ir a `/dashboard/users`
   - Usar filtros opcionales (score, nombre, nivel de verificación)
   - Hacer clic en "Consultar Usuarios"
   - Se consumirá 1 crédito automáticamente
   - Verás la lista de usuarios mockeados

5. **Ver Historial**
   - Ir a `/dashboard/usage`
   - Ver compras y consumo de créditos

### Endpoints x402

El endpoint de compra de suscripción está protegido con x402:

```bash
POST /api/subscriptions/purchase
Headers: Authorization: Bearer <token>
Body: { "credits": 10 }
```

Sin el header `X-Payment`, devuelve HTTP 402:

```json
{
  "amount": "1000",
  "currency": "USDC",
  "network": "avalanche-fuji",
  "description": "Purchase 10 credits for user database access",
  "credits": 10,
  "pricePerCredit": 100
}
```

### Base de Datos Mockeada

- **100 usuarios** generados automáticamente
- Cada usuario tiene:
  - Wallet address aleatorio
  - Score crediticio (300-1000)
  - Identidad mockeada (nombre, DNI, email)
  - Nivel de verificación (0-3)

Para regenerar usuarios:
```bash
cd backend
node src/scripts/seedMockUsers.js
```

## 📱 User Journey MVP

1. Usuario conecta wallet en `/`
2. Usuario sube DNI en `/onboarding`
3. Admin aprueba identidad (off-chain por ahora)
4. Usuario va a `/test` o `/dashboard/score`
5. Usuario hace clic en "Calculate Score"
6. Backend responde con HTTP 402
7. Frontend detecta 402 y muestra opción de pago (simulado en MVP)
8. Usuario "paga" (simulado) y backend procesa
9. Score se calcula y muestra (por ahora score fijo: 300)
10. SBT se minteará en versión futura

## 🔧 Características Técnicas

### x402 Integration

- Middleware `verifyX402Payment` en backend usando Thirdweb facilitator
- Detección de HTTP 402 en frontend
- Compra de suscripciones prepago vía x402
- Modo simulado si Thirdweb no está configurado

### Sistema de Créditos

- **Precio**: 100 USDC por crédito
- **Mínimo de compra**: 10 créditos (1,000 USDC)
- **Consumo automático**: 1 crédito por consulta de usuarios
- **Tracking completo**: Historial de compras y consumo

### Base de Datos Mockeada

- **100 usuarios** generados automáticamente
- **Datos incluidos**:
  - Wallet address (aleatorio)
  - Score crediticio (300-1000, distribución realista)
  - Identidad (nombre, DNI argentino, email)
  - Nivel de verificación (0-3)

### Autenticación

- **JWT tokens** para autenticación de exchanges
- **Login tradicional** (email/password)
- **Sin wallet connection** requerida (solo opcional para wallet del exchange)

## 📝 Notas del MVP

### Lo que SÍ está implementado:
- ✅ Sistema de autenticación tradicional para exchanges
- ✅ Base de datos mockeada de 100 usuarios
- ✅ Sistema de suscripciones prepago
- ✅ Compra de créditos vía x402
- ✅ Consulta de usuarios con consumo automático de créditos
- ✅ Dashboard completo para exchanges
- ✅ Tracking de compras y consumo

### Lo que NO está implementado (futuro):
- ⚠️ Verificación real de pagos x402 con facilitator (actualmente simulado, pero configurable)
- ⚠️ Base de datos real (actualmente JSON files, fácil migrar a DB)
- ⚠️ Más usuarios mockeados (fácil agregar más con el script)

## 🤝 Contribuciones

Este proyecto fue desarrollado para el **Hack2Build: Payments x402 Hackathon** en Avalanche.

**Construido con ❤️ para el ecosistema Avalanche**

---

## 📚 Recursos

- [x402 Protocol Documentation](https://x402.gitbook.io/x402)
- [Avalanche Fuji Testnet](https://docs.avax.network/quickstart/fuji-workflow)
- [Thirdweb x402](https://portal.thirdweb.com/x402)
