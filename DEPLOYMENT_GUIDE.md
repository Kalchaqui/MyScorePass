# 📘 Guía de Deployment - DeFiCred

Esta guía te llevará paso a paso para desplegar DeFiCred en la testnet de Moonbeam (Moonbase Alpha) y configurar toda la aplicación.

## 📋 Tabla de Contenidos

1. [Pre-requisitos](#pre-requisitos)
2. [Configurar Wallet](#configurar-wallet)
3. [Obtener Tokens de Testnet](#obtener-tokens-de-testnet)
4. [Desplegar Smart Contracts](#desplegar-smart-contracts)
5. [Configurar Frontend](#configurar-frontend)
6. [Configurar Backend](#configurar-backend)
7. [Probar la Aplicación](#probar-la-aplicación)
8. [Troubleshooting](#troubleshooting)

## 🔧 Pre-requisitos

### Software Necesario

```bash
# Node.js v18 o superior
node --version

# npm v9 o superior
npm --version

# Git
git --version
```

### Instalación (si no tienes Node.js)

**Windows:**
- Descargar desde [nodejs.org](https://nodejs.org/)

**macOS:**
```bash
brew install node
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 👛 Configurar Wallet

### 1. Instalar MetaMask

1. Instalar extensión de Chrome: [MetaMask](https://metamask.io/)
2. Crear nueva wallet o importar existente
3. **IMPORTANTE**: Guardar tu seed phrase en un lugar seguro

### 2. Agregar Moonbase Alpha Network

En MetaMask:
1. Click en el selector de red (arriba)
2. Click en "Agregar red"
3. Ingresar los siguientes datos:

```
Network Name: Moonbase Alpha
RPC URL: https://rpc.api.moonbase.moonbeam.network
Chain ID: 1287
Currency Symbol: DEV
Block Explorer: https://moonbase.moonscan.io
```

4. Click en "Guardar"

### 3. Exportar Private Key

⚠️ **NUNCA compartas tu private key. Úsala solo para testing.**

1. En MetaMask, click en los 3 puntos → Detalles de la cuenta
2. Click en "Exportar clave privada"
3. Ingresar contraseña
4. Copiar la clave (sin el `0x` inicial)

## 💰 Obtener Tokens de Testnet

### Opción 1: Faucet de Moonbeam

1. Ir a [Moonbeam Faucet](https://faucet.moonbeam.network/)
2. Pegar tu dirección de wallet
3. Completar captcha
4. Recibirás ~1 DEV token

### Opción 2: Discord de Moonbeam

1. Unirse al [Discord de Moonbeam](https://discord.gg/moonbeam)
2. Ir al canal `#testnet-faucet`
3. Usar comando: `!faucet <tu-dirección>`

## 🚀 Desplegar Smart Contracts

### 1. Clonar e Instalar

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/DeFiCred.git
cd DeFiCred

# Instalar dependencias de contratos
cd contracts
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Crear archivo .env
cp .env.example .env

# Editar .env
nano .env  # o usar tu editor favorito
```

Agregar tu private key (SIN el 0x):
```env
PRIVATE_KEY=tu_private_key_aqui_sin_0x
```

### 3. Compilar Contratos

```bash
npx hardhat compile
```

Deberías ver:
```
✓ Compiled 5 Solidity files successfully
```

### 4. Ejecutar Tests (Opcional pero Recomendado)

```bash
npx hardhat test
```

Todos los tests deberían pasar ✅

### 5. Desplegar a Moonbase Alpha

```bash
npx hardhat run scripts/deploy.js --network moonbase
```

**Salida esperada:**
```
🚀 Desplegando contratos de DeFiCred en moonbase
============================================================
📍 Desplegando con la cuenta: 0x...
💰 Balance: 1.0 DEV

1️⃣  Desplegando MockUSDC...
✅ MockUSDC desplegado en: 0xABC...

2️⃣  Desplegando IdentityRegistry...
✅ IdentityRegistry desplegado en: 0xDEF...

... (continuación)

🎉 ¡Deployment completado exitosamente!
============================================================

📋 DIRECCIONES DE LOS CONTRATOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MockUSDC:           0x...
IdentityRegistry:   0x...
CreditScoring:      0x...
LendingPool:        0x...
LoanManager:        0x...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 6. Guardar Direcciones

Las direcciones se guardarán automáticamente en `contracts/deployment-info.json`.

⚠️ **IMPORTANTE**: Guarda estas direcciones, las necesitarás para el frontend.

## 🎨 Configurar Frontend

### 1. Instalar Dependencias

```bash
cd ../frontend
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
nano .env
```

Reemplazar con las direcciones de tus contratos desplegados:

```env
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_CREDIT_SCORING_ADDRESS=0x...
NEXT_PUBLIC_LENDING_POOL_ADDRESS=0x...
NEXT_PUBLIC_LOAN_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...

NEXT_PUBLIC_CHAIN_ID=1287
NEXT_PUBLIC_RPC_URL=https://rpc.api.moonbase.moonbeam.network
NEXT_PUBLIC_NETWORK_NAME=Moonbase Alpha

NEXT_PUBLIC_API_URL=http://localhost:3001

# WalletConnect Project ID (opcional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

### 3. Iniciar Frontend

```bash
npm run dev
```

Frontend estará disponible en: [http://localhost:3000](http://localhost:3000)

## 🔧 Configurar Backend

### 1. Instalar Dependencias

```bash
cd ../backend
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
nano .env
```

```env
PORT=3001
ADMIN_SECRET=tu_secret_super_seguro
RPC_URL=https://rpc.api.moonbase.moonbeam.network
CHAIN_ID=1287
```

### 3. Iniciar Backend

```bash
npm run dev
```

Backend estará disponible en: [http://localhost:3001](http://localhost:3001)

## ✅ Probar la Aplicación

### 1. Verificar que todo esté corriendo

```bash
# Terminal 1: Frontend
cd frontend && npm run dev

# Terminal 2: Backend
cd backend && npm run dev
```

### 2. Abrir la Aplicación

Ir a [http://localhost:3000](http://localhost:3000)

### 3. Conectar Wallet

1. Click en "Connect Wallet"
2. Seleccionar MetaMask
3. Aprobar conexión
4. Verificar que estés en Moonbase Alpha network

### 4. Flujo Completo de Prueba

#### A. Crear Identidad
1. Ir a Dashboard
2. Click en "Crear Identidad"
3. Cargar documento simulado
4. Confirmar transacción en MetaMask

#### B. Obtener Tokens USDC de Prueba
```bash
# En la consola de Hardhat
npx hardhat console --network moonbase

# Luego ejecutar:
const MockUSDC = await ethers.getContractAt("MockUSDC", "TU_USDC_ADDRESS");
await MockUSDC.faucet(ethers.parseUnits("1000", 6));
```

#### C. Calcular Score
1. En Dashboard, click en "Calcular Score"
2. Confirmar transacción
3. Ver tu score calculado

#### D. Depositar Fondos (Como Prestamista)
1. Ir a "Prestar Fondos"
2. Aprobar USDC
3. Depositar cantidad (ej: 500 USDC)

#### E. Solicitar Préstamo (Como Prestatario)
1. Ir a "Solicitar Préstamo"
2. Ingresar monto (dentro de tu límite)
3. Seleccionar duración
4. Confirmar transacción

#### F. Repagar Préstamo
1. Ir a "Mis Préstamos"
2. Click en "Repagar"
3. Aprobar USDC
4. Confirmar repago

## 🐛 Troubleshooting

### Problema: "Insufficient funds"

**Solución:**
```bash
# Obtener más DEV tokens del faucet
# https://faucet.moonbeam.network/
```

### Problema: "User rejected transaction"

**Solución:**
- Asegurarse de aprobar la transacción en MetaMask
- Verificar que tengas suficiente DEV para gas

### Problema: "Network mismatch"

**Solución:**
1. Verificar que MetaMask esté en Moonbase Alpha (Chain ID: 1287)
2. Cambiar red en MetaMask

### Problema: "Contract not deployed"

**Solución:**
1. Verificar que las direcciones en `.env` sean correctas
2. Verificar en [Moonbase Moonscan](https://moonbase.moonscan.io/) que los contratos existan

### Problema: Error de compilación en Hardhat

**Solución:**
```bash
# Limpiar cache y recompilar
npx hardhat clean
rm -rf cache artifacts
npx hardhat compile
```

### Problema: Frontend no conecta con contratos

**Solución:**
1. Verificar que el backend esté corriendo
2. Verificar CORS en el backend
3. Revisar console del navegador (F12) para errores
4. Verificar que las direcciones de contratos en `.env` sean correctas

### Problema: "Nonce too high"

**Solución:**
1. En MetaMask: Settings → Advanced → Reset Account
2. Esto reseteará el nonce de transacciones

## 📊 Verificar Deployment

### En Moonbase Moonscan

1. Ir a [https://moonbase.moonscan.io/](https://moonbase.moonscan.io/)
2. Buscar cada dirección de contrato
3. Deberías ver:
   - ✅ Transacción de creación
   - ✅ Bytecode del contrato
   - ✅ Transacciones si ya interactuaste

### Healthcheck de Backend

```bash
curl http://localhost:3001/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "message": "DeFiCred Backend is running"
}
```

## 🎉 ¡Deployment Exitoso!

Si llegaste hasta aquí, ¡felicidades! 🎊

Tu aplicación DeFiCred está:
- ✅ Desplegada en Moonbase Alpha
- ✅ Frontend funcionando
- ✅ Backend funcionando
- ✅ Lista para la demo de la hackathon

## 📝 Checklist Final

- [ ] Contratos desplegados en Moonbase Alpha
- [ ] Direcciones guardadas en frontend/.env
- [ ] Frontend corriendo en localhost:3000
- [ ] Backend corriendo en localhost:3001
- [ ] Wallet conectada y en Moonbase Alpha
- [ ] Tokens DEV para gas
- [ ] Tokens USDC de prueba obtenidos
- [ ] Flujo completo probado (identidad → score → préstamo)
- [ ] Screenshots/video de la demo preparados

## 🚀 Próximos Pasos

1. **Para la Demo**: Preparar wallet con fondos y transacciones de ejemplo
2. **Para Producción**: Considerar auditoría de seguridad
3. **Mejoras**: Integrar oráculos reales, KYC automatizado

---

**¿Necesitas ayuda?** Abre un issue en GitHub o contacta al equipo.

**¡Buena suerte con la hackathon! 🍀**


