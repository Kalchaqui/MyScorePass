# 🚀 Deployment en Paseo usando Remix IDE

## ⚠️ Problema con Hardhat

Paseo Asset Hub usa `pallet_revive` (experimental) que tiene limitaciones con contratos Solidity compilados con Hardhat.

## ✅ Solución: Polkadot Remix IDE

### Paso 1: Abrir Remix de Polkadot

Ve a: **https://remix.polkadot.io/**

---

### Paso 2: Crear Workspace

1. En Remix, click en "File Explorers" (ícono de archivos)
2. Click en "Create" → "Blank" workspace
3. Nombre: "DeFiCred"

---

### Paso 3: Copiar Contratos

Copia estos archivos uno por uno a Remix:

#### **A. IERC20Simple.sol** (Crear primero)

Path en Remix: `contracts/interfaces/IERC20Simple.sol`

```solidity
// Copiar contenido de:
contracts/contracts/interfaces/IERC20Simple.sol
```

#### **B. MockUSDC.sol**

Path: `contracts/MockUSDC.sol`

```solidity
// Copiar contenido de:
contracts/contracts/MockUSDC.sol
```

#### **C. IdentityRegistry.sol**

Path: `contracts/IdentityRegistry.sol`

```solidity
// Copiar contenido de:
contracts/contracts/IdentityRegistry.sol
```

#### **D. CreditScoring.sol**

Path: `contracts/CreditScoring.sol`

```solidity
// Copiar contenido de:
contracts/contracts/CreditScoring.sol
```

#### **E. LendingPool.sol**

Path: `contracts/LendingPool.sol`

```solidity
// Copiar contenido de:
contracts/contracts/LendingPool.sol
```

#### **F. InsurancePool.sol**

Path: `contracts/InsurancePool.sol`

```solidity
// Copiar contenido de:
contracts/contracts/InsurancePool.sol
```

#### **G. LoanManager.sol**

Path: `contracts/LoanManager.sol`

```solidity
// Copiar contenido de:
contracts/contracts/LoanManager.sol
```

---

### Paso 4: Configurar Compilador

1. Click en "Solidity Compiler" (ícono)
2. Compiler version: **0.8.0**
3. EVM Version: **istanbul**
4. Optimization: **Enabled, 200 runs**
5. Click "Compile" en cada contrato

---

### Paso 5: Conectar a Paseo

1. Click en "Deploy & Run Transactions"
2. Environment: **Injected Provider - MetaMask**
3. En MetaMask:
   - Cambiar a red "Paseo Asset Hub"
   - Verificar que tienes ~5,000 PAS

---

### Paso 6: Desplegar Contratos (EN ORDEN)

#### **1. MockUSDC**

```
Contract: MockUSDC
Constructor: (ninguno)
[Deploy] → Confirmar en MetaMask
```

📝 **Guarda la dirección:** `0xABC...` (MockUSDC)

---

#### **2. IdentityRegistry**

```
Contract: IdentityRegistry
Constructor: (ninguno)
[Deploy] → Confirmar
```

📝 **Guarda la dirección:** `0xDEF...` (IdentityRegistry)

---

#### **3. CreditScoring**

```
Contract: CreditScoring
Constructor: _identityRegistry = 0xDEF... (pegar dirección de IdentityRegistry)
[Deploy] → Confirmar
```

📝 **Guarda la dirección:** `0xGHI...` (CreditScoring)

---

#### **4. LendingPool**

```
Contract: LendingPool
Constructor: _stablecoin = 0xABC... (pegar dirección de MockUSDC)
[Deploy] → Confirmar
```

📝 **Guarda la dirección:** `0xJKL...` (LendingPool)

---

#### **5. InsurancePool**

```
Contract: InsurancePool
Constructor: _stablecoin = 0xABC... (pegar dirección de MockUSDC)
[Deploy] → Confirmar
```

📝 **Guarda la dirección:** `0xMNO...` (InsurancePool)

---

#### **6. LoanManager**

```
Contract: LoanManager
Constructor (4 parámetros):
├─ _creditScoring = 0xGHI...
├─ _lendingPool = 0xJKL...
├─ _insurancePool = 0xMNO...
└─ _stablecoin = 0xABC...

[Deploy] → Confirmar
```

📝 **Guarda la dirección:** `0xPQR...` (LoanManager)

---

### Paso 7: Configurar Permisos

En Remix, con cada contrato desplegado:

#### **A. CreditScoring - Transferir Ownership**

```
1. En "Deployed Contracts", expandir CreditScoring
2. Función: transferOwnership
3. newOwner: 0xPQR... (dirección de LoanManager)
4. [transact] → Confirmar
```

#### **B. LendingPool - Set LoanManager**

```
1. Expandir LendingPool
2. Función: setLoanManager
3. _loanManager: 0xPQR... (dirección de LoanManager)
4. [transact] → Confirmar
```

#### **C. InsurancePool - Set LoanManager**

```
1. Expandir InsurancePool
2. Función: setLoanManager
3. _loanManager: 0xPQR... (dirección de LoanManager)
4. [transact] → Confirmar
```

---

### Paso 8: Mint Tokens de Prueba

```
1. Expandir MockUSDC
2. Función: faucet
3. amount: 10000000000 (10,000 USDC con 6 decimales)
4. [transact] → Confirmar
```

---

### Paso 9: Guardar Direcciones

Crea un archivo con todas las direcciones:

```json
{
  "network": "paseo",
  "chainId": 420420422,
  "contracts": {
    "mockUSDC": "0xABC...",
    "identityRegistry": "0xDEF...",
    "creditScoring": "0xGHI...",
    "lendingPool": "0xJKL...",
    "insurancePool": "0xMNO...",
    "loanManager": "0xPQR..."
  }
}
```

---

### Paso 10: Verificar en BlockScout

Para cada contrato, verifica en:

🔗 **https://blockscout-passet-hub.parity-testnet.parity.io/**

Busca cada dirección y verifica que:
- ✅ Aparece el contrato
- ✅ Transacción de creación exitosa
- ✅ Balance correcto

---

## 🎯 Ventajas de Usar Remix:

✅ Diseñado específicamente para Polkadot
✅ Mejor compatibilidad con `pallet_revive`
✅ Compilador optimizado
✅ Interface visual (no comandos)
✅ Debugging en tiempo real

---

## ⏱️ Tiempo Estimado:

- Copiar contratos: 5 minutos
- Compilar: 2 minutos
- Desplegar 6 contratos: 10 minutos
- Configurar permisos: 5 minutos
- **Total: ~20-25 minutos**

---

## 💡 Después del Deployment:

1. **Actualizar frontend/.env** con las direcciones
2. **Tomar screenshots** de los contratos en BlockScout
3. **Probar** el sistema completo
4. **Preparar demo** para la hackathon

---

Esta guía te llevará al deployment exitoso usando Remix IDE 🚀
