# 🎯 GUÍA SIMPLE PARA REMIX - DeFiCred

## ⚡ Solución Rápida: TODOS los Archivos en la Misma Carpeta

Para evitar problemas de imports en Remix, vamos a poner **todos los archivos juntos**.

---

## 📁 ESTRUCTURA EN REMIX (Simple):

```
contracts/
├─ IERC20Simple.sol          ← Interface
├─ MockUSDC.sol             ← Token
├─ IdentityRegistry.sol     ← Identidad
├─ CreditScoring.sol        ← Scoring
├─ LendingPool.sol          ← Pool
├─ InsurancePool.sol        ← Seguros
└─ LoanManager.sol          ← Manager
```

**TODOS en la misma carpeta `contracts/`** (sin subcarpetas)

---

## 🔧 CAMBIAR IMPORTS (Antes de Copiar a Remix):

En **TU EDITOR LOCAL** (VSCode/Cursor), cambiar estos 3 archivos:

### 1. LendingPool.sol - Línea 7

**Cambiar:**
```solidity
import "./interfaces/IERC20Simple.sol";
```

**Por:**
```solidity
import "./IERC20Simple.sol";
```

### 2. InsurancePool.sol - Línea 7

**Cambiar:**
```solidity
import "./interfaces/IERC20Simple.sol";
```

**Por:**
```solidity
import "./IERC20Simple.sol";
```

### 3. LoanManager.sol - Línea 10

**Cambiar:**
```solidity
import "./interfaces/IERC20Simple.sol";
```

**Por:**
```solidity
import "./IERC20Simple.sol";
```

---

## 📋 ORDEN DE COPIA A REMIX:

### Paso 1: Copiar IERC20Simple.sol (Interface)

**Archivo local:** `contracts/contracts/interfaces/IERC20Simple.sol`

**En Remix:**
1. Click en "contracts" (carpeta)
2. Click en el ícono "+" (nuevo archivo)
3. Nombre: `IERC20Simple.sol`
4. Copiar y pegar todo el contenido
5. Ctrl+S guardar

---

### Paso 2-7: Copiar el Resto

**Copiar EN ORDEN:**

2. `MockUSDC.sol`
3. `IdentityRegistry.sol`  
4. `CreditScoring.sol`
5. `LendingPool.sol` (ahora con import arreglado)
6. `InsurancePool.sol` (ahora con import arreglado)
7. `LoanManager.sol` (ahora con import arreglado)

**Todos en la carpeta `contracts/`** al mismo nivel

---

## ✅ VERIFICAR:

En Remix deberías ver:

```
📁 contracts
  ├─ 📄 IERC20Simple.sol       ✅
  ├─ 📄 MockUSDC.sol           ✅
  ├─ 📄 IdentityRegistry.sol   ✅
  ├─ 📄 CreditScoring.sol      ✅
  ├─ 📄 LendingPool.sol        ✅
  ├─ 📄 InsurancePool.sol      ✅
  └─ 📄 LoanManager.sol        ✅
```

**TODOS al mismo nivel, SIN carpeta interfaces/**

---

## 🔨 COMPILAR:

1. Click en "Solidity Compiler" (icono izquierda)
2. Compiler: **0.8.0**
3. EVM Version: **istanbul**
4. Enable optimization: ✅ (200 runs)
5. Click "Compile" en cada archivo

**Orden de compilación:**
1. IERC20Simple.sol
2. MockUSDC.sol
3. IdentityRegistry.sol
4. CreditScoring.sol
5. LendingPool.sol
6. InsurancePool.sol
7. LoanManager.sol

---

## ⚠️ Si Aún Tienes Error:

### Error de Licencia MIT:

Verificar que CADA archivo empiece EXACTAMENTE así:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
```

**Sin espacios extra, sin líneas vacías antes.**

---

Esta es la forma MÁS SIMPLE para Remix 🚀
