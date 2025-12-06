# Arquitectura MyScorePass MVP

## Visión General

MyScorePass es una plataforma MVP de scoring crediticio Web3 que integra:
- Verificación de identidad on-chain
- Pagos x402 para servicios de scoring
- Soulbound Tokens (SBT) para certificar reputación

## Componentes Principales

### 1. Smart Contracts (Solidity)

#### IdentityRegistry.sol
**Ubicación**: `contracts/contracts/IdentityRegistry.sol`

**Funcionalidad**:
- Gestión de identidades únicas por wallet
- Almacenamiento de hashes de documentos (IPFS)
- Niveles de verificación (1-3)
- Verificación on-chain por owner/admin

**Funciones clave**:
```solidity
function createIdentity(string memory _documentHash) external
function verifyIdentity(address _user, uint256 _level) external onlyOwner
function getIdentity(address _user) external view returns (...)
```

#### CreditScoringMini.sol
**Ubicación**: `contracts/contracts/CreditScoringMini.sol`

**Funcionalidad**:
- Cálculo de score crediticio inicial (fijo: 300 en MVP)
- Almacenamiento de score y maxLoan por usuario
- Sistema de blacklist
- Recompensas y penalizaciones (solo owner)

**Funciones clave**:
```solidity
function calculateInitialScore(address _user) external returns (uint256)
function getScore(address _user) external view returns (uint256, uint256, uint256)
```

### 2. Backend (Node.js + Express)

**Ubicación**: `backend/src/`

#### Estructura de Rutas

```
/api
├── /users          # Gestión de usuarios y DNI
├── /documents      # Subida a IPFS
├── /verification   # Proceso de verificación
└── /score          # Endpoints x402 protegidos
```

#### Middleware x402

**Ubicación**: `backend/src/routes/score.js`

El middleware `checkX402Payment`:
1. Verifica si existe header `X-Payment`
2. Si no existe, devuelve HTTP 402 con información de pago
3. Si existe, permite continuar (verificación real pendiente)

**Montos de pago**:
- Calculate Score: 0.50 USDC
- Query Score: 0.50 USDC
- Verify SBT: 0.10 USDC

### 3. Frontend (Next.js 14)

**Ubicación**: `frontend/app/`

#### Páginas Principales

- **`/`** (`page.tsx`): Landing page con explicación del proyecto
- **`/dashboard`** (`dashboard/page.tsx`): Dashboard principal con tarjetas
- **`/dashboard/identity`** (`dashboard/identity/page.tsx`): Gestión de identidad
- **`/dashboard/score`** (`dashboard/score/page.tsx`): Visualización de score
- **`/onboarding`** (`onboarding/page.tsx`): Flujo de subida de DNI
- **`/test`** (`test/page.tsx`): Panel de pruebas x402 (tema oscuro)
- **`/demo`** (`demo/page.tsx`): Demo simplificado

#### Componentes

- **`WalletManager`**: Gestión de conexión de wallet (Wagmi + RainbowKit)
- **`AnimatedBackground`**: Fondo animado para páginas
- **`SplashScreen`**: Pantalla de bienvenida

#### Configuración

- **`providers.tsx`**: Configuración de Wagmi, RainbowKit y Thirdweb
- **`config/contracts.ts`**: Direcciones de contratos
- **`config/abis.ts`**: ABIs de contratos
- **`lib/x402.ts`**: Configuración x402 (client, facilitator, montos)
- **`lib/x402Client.ts`**: Funciones cliente para llamar endpoints x402

## Flujo de Datos

### Flujo de Verificación de Identidad

```
Usuario → Frontend (/onboarding)
  ↓
Sube DNI (frente + reverso)
  ↓
Backend (/api/users/upload-dni)
  ↓
Almacena imágenes localmente
  ↓
Crea registro en users.json (status: pending)
  ↓
Admin aprueba (/api/users/approve)
  ↓
Estado cambia a 'approved'
  ↓
Usuario puede calcular score
```

### Flujo de Cálculo de Score con x402

```
Usuario → Frontend (/test o /dashboard/score)
  ↓
Clic en "Calculate Score"
  ↓
Frontend → POST /api/score/calculate
  ↓
Backend verifica X-Payment header
  ↓
Si no existe → HTTP 402 con info de pago
  ↓
Frontend detecta 402
  ↓
[MVP: Simula pago]
  ↓
Frontend retry con X-Payment header
  ↓
Backend procesa
  ↓
Calcula score (off-chain o on-chain)
  ↓
Responde con score, scoreHash, sbtTokenId
```

## Integración x402

### Backend

El middleware x402 está implementado en `backend/src/routes/score.js`:

```javascript
function checkX402Payment(req, res, next) {
  const paymentHeader = req.headers['x-payment'];
  
  if (!paymentHeader) {
    return res.status(402).json({
      amount: req.paymentAmount || PAYMENT_AMOUNTS.CALCULATE_SCORE,
      currency: 'USDC',
      network: 'avalanche-fuji',
      recipient: MERCHANT_WALLET,
      description: req.paymentDescription || 'Payment required',
    });
  }
  
  // TODO: Verify payment with Thirdweb facilitator
  next();
}
```

### Frontend

El cliente x402 está en `frontend/lib/x402Client.ts`:

```typescript
export async function calculateScoreWithX402(walletAddress: string) {
  const response = await fetch('/api/score/calculate', {
    method: 'POST',
    body: JSON.stringify({ walletAddress }),
  });
  
  if (response.status === 402) {
    // x402 SDK should handle payment automatically
    // For MVP, we simulate the payment flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    return await fetch('/api/score/calculate', { ... }); // Retry
  }
  
  return response.json();
}
```

## Base de Datos

### Backend (JSON Files)

- **`backend/data/users.json`**: Almacena usuarios y estado de verificación
- **`backend/uploads/dni/`**: Almacena imágenes de DNI subidas

### On-Chain

- **IdentityRegistry**: Identidades verificadas
- **CreditScoringMini**: Scores crediticios

## Seguridad

### MVP (Actual)

- Verificación de admin por dirección hardcodeada
- Almacenamiento local de DNI (no recomendado para producción)
- Verificación de pagos x402 simulada

### Producción (Futuro)

- Encriptación de documentos
- IPFS para almacenamiento descentralizado
- Verificación real de pagos con facilitator
- Autenticación robusta de admin
- Rate limiting en endpoints

## Próximos Pasos

1. **Implementar contrato SBT** (MyScorePassSBT.sol)
2. **Integrar verificación real de pagos x402** con Thirdweb facilitator
3. **Mejorar algoritmo de scoring** (off-chain)
4. **Migrar a base de datos real** (PostgreSQL/MongoDB)
5. **Implementar IPFS real** para documentos
6. **Añadir tests automatizados**

