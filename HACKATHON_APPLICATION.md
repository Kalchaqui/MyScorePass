# Hackathon Application - MyScorePass

## Team Information

### Team Name
**MyScorePass**

### One-sentence description
MyScorePass es una plataforma de scoring crediticio Web3 que permite a usuarios obtener reputación financiera verificable mediante pagos x402, recibiendo un Soulbound Token (SBT) portátil que pueden usar para acceder a préstamos sin colateral en cualquier plataforma DeFi.

---

### Team Members

**Diego Raúl Barrionuevo**
- **Email**: [tu-email@ejemplo.com]
- **Telegram**: @[tu-telegram]
- **Role**: Full-Stack Developer & Smart Contract Developer
- **Responsibilities**: 
  - Arquitectura del sistema
  - Desarrollo de Smart Contracts (SBT)
  - Integración x402
  - Frontend y Backend
- **Relevant Experience**:
  - Desarrollo de DeFiCred (plataforma de préstamos en Polkadot)
  - Experiencia en Solidity, Hardhat, Next.js
  - Integración de wallets (Wagmi, RainbowKit)
  - Sistemas de scoring crediticio

---

### Why is your team uniquely positioned to build this project?

Contamos con experiencia en Fintech bancaria y desarrollo Web3 por participaciones en otros hackathons como el Hack2Build: Privacy Edition donde otuvimos mención de honor con el proyecto saluData

Esta experiencia nos permite:
1. **Entender el problema real**: Conocemos las limitaciones de los sistemas actuales de scoring y préstamos
2. **Experiencia técnica**: Dominio de Solidity, smart contracts, integración de wallets, y arquitectura DeFi
3. **Enfoque en el usuario**: Hemos iterado sobre UX/UI para hacer sistemas complejos accesibles
4. **Adaptabilidad**: Se estudio primero una Dapps de prestamos complejos pero se simplificó solo a scoring crediticio, demostrando capacidad de pivotar según necesidades del mercado

Además, entendemos profundamente el protocolo x402 y cómo integrarlo para crear un modelo de negocio sostenible basado en pagos por uso, lo cual es perfecto para servicios de scoring crediticio.

---

## Problem Identification

### What problem are you addressing?

El problema principal es que no existe un scoring descentralizado y confiable que permita evaluar a cada individuo, por lo que las plataformas blockchain de exchange o lending no pueden prestar activos como stablecoin por esta razón, además de la falta de acceso a crédito para personas no bancarizadas o con historial crediticio limitado** en el ecosistema DeFi. Actualmente:

1. **No hay historial crediticio Web3**: Las plataformas DeFi no tienen forma de evaluar la confiabilidad de un usuario sin colateral
2. **KYC repetitivo y costoso**: Cada plataforma requiere su propio proceso de verificación
3. **Falta de reputación portátil**: No existe un sistema de scoring que pueda ser usado en múltiples plataformas
4. **Barrera de entrada alta**: Los préstamos sin colateral son casi imposibles sin un sistema de reputación verificable

### Who experiences this problem?

**Usuarios Primarios (B2C):**
- **Personas no bancarizadas** en países en desarrollo que quieren acceder a servicios DeFi
- **Usuarios nuevos en Web3** sin historial crediticio tradicional
- **Desarrolladores y freelancers** que necesitan capital para proyectos pero no tienen activos como colateral
- **Pequeños emprendedores** que buscan préstamos rápidos sin burocracia

**Necesidades:**
- Acceso a crédito sin colateral
- Proceso simple y rápido
- Reputación portátil entre plataformas
- Privacidad (no revelar todos sus datos a cada plataforma)

**Usuarios Secundarios (B2B):**
- **Plataformas DeFi de préstamos** que necesitan evaluar riesgo sin colateral
- **Protocolos de lending** que quieren expandir su base de usuarios

### How is the problem currently solved (if at all)?

**Soluciones Tradicionales:**
1. **Préstamos con colateral**: Requieren activos bloqueados (over-collateralized), limitando acceso
2. **KYC manual por plataforma**: Cada plataforma hace su propio proceso, costoso y repetitivo
3. **Scoring centralizado**: Sistemas como Credit Karma no funcionan en Web3 y requieren datos bancarios tradicionales

**Soluciones Web3 Actuales:**
1. **Protocolos de identidad** (como ENS, Proof of Humanity): Verifican identidad pero no reputación crediticia
2. **Sistemas de scoring aislados**: Cada plataforma calcula su propio score, no es portátil
3. **Préstamos sin colateral limitados**: Solo para usuarios con historial extenso en la misma plataforma

**Limitaciones:**
- No hay un sistema unificado de reputación crediticia Web3
- Los scores no son portátiles entre plataformas
- Falta de incentivos para construir reputación desde cero
- Procesos costosos y lentos

### What is your proposed solution?

**ScorePass** resuelve estos problemas mediante:

1. **Scoring Crediticio Web3 Portátil**:
   - Usuario paga con USDC o otro token (vía x402) para obtener su score
   - Recibe un **Soulbound Token (SBT)** que certifica su reputación
   - El SBT es **portátil** - puede usarse en cualquier plataforma DeFi

2. **Modelo de Pago por Uso (x402)**:
   - Sin suscripciones ni cuentas
   - Pago único por obtener/actualizar score
   - Proceso completamente programático (ideal para AI agents también)

3. **Verificación de Identidad Reputacional**:
   - Verificación de identidad + cálculo de score en un solo proceso
   - Datos privados off-chain, solo hash verificable on-chain
   - Privacidad preservada

4. **Ecosistema Abierto**:
   - Cualquier plataforma DeFi puede leer el SBT del usuario
   - Evalúan riesgo sin necesidad de su propio proceso de KYC
   - Sistema de reputación compartido beneficia a todo el ecosistema

**Ventajas sobre soluciones actuales:**
- ✅ **Portabilidad**: Un score, múltiples plataformas
- ✅ **Accesibilidad**: Cualquiera puede obtener score pagando 2 USDC
- ✅ **Privacidad**: Solo hash on-chain, datos completos off-chain
- ✅ **Rapidez**: Proceso automatizado, resultado en minutos
- ✅ **Sostenible**: Modelo de negocio claro (pago por uso)
- ✅ **Sin colateral**: Permite préstamos sin garantía basados en reputación

---

## Proposed Solution

### Architecture Design Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  - Dashboard de usuario                                      │
│  - Integración x402 SDK                                   │
│  - Visualización de SBT                                     │
│  - Conexión wallet (Wagmi + RainbowKit)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)               │
│  - API REST con middleware x402                              │
│  - Verificación de identidad                                 │
│  - Cálculo de score (off-chain)                              │
│  - Integración con Smart Contracts                           │
│  - Almacenamiento de datos (hash on-chain, datos off-chain)  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              SMART CONTRACTS (Solidity)                      │
│  - ScorePassSBT.sol (ERC-5192 Soulbound Token)               │
│  - IdentityRegistry.sol (Verificación de identidad)          │
│  - ScoreRegistry.sol (Registro de scores verificables)       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    AVALANCHE C-CHAIN                          │
│  - Red: Fuji Testnet (desarrollo) / Mainnet (producción)      │
│  - Token: USDC para pagos x402                                │
│  - Facilitador x402 para verificación de pagos              │
└─────────────────────────────────────────────────────────────┘
```

**Componentes Principales:**

1. **Frontend (Next.js 14)**
   - UI/UX para usuarios
   - Integración con x402 SDK para pagos
   - Visualización de SBT y score
   - Conexión de wallet

2. **Backend (Express + x402)**
   - Middleware x402 para rutas protegidas
   - Endpoints:
     - `POST /api/score/calculate` Ejemplo (2 USDC) - Calcular score + mint SBT
     - `GET /api/score/query` Ejemplo (0.50 USDC) - Consultar score existente
     - `GET /api/score/verify` Ejemplo (0.10 USDC) - Verificar SBT (para otras dApps)
   - Lógica de scoring (algoritmo off-chain)
   - Integración con contratos inteligentes

3. **Smart Contracts (Solidity)**
   - **ScorePassSBT**: Contrato ERC-5192 (Soulbound Token)
     - Mint SBT con metadata: scoreHash, verificationLevel, timestamp
     - No transferible (soulbound)
   - **IdentityRegistry**: Gestión de identidades verificadas
   - **ScoreRegistry**: Registro de scores verificables (hash on-chain)

4. **x402 Integration**
   - Facilitador para verificación de pagos
   - SDK en frontend para manejo automático de pagos
   - Middleware en backend para protección de rutas

### User Journey

**Paso 1: Conectar Wallet**
- Usuario visita scorepass.com
- Conecta su wallet (MetaMask, WalletConnect)
- Ve dashboard inicial

**Paso 2: Verificar Identidad (Opcional pero recomendado)**
- Usuario sube DNI (frente y reverso)
- Sistema verifica identidad (puede ser automático o con admin)
- Identidad registrada en blockchain (IdentityRegistry)

**Paso 3: Obtener Score (Pago x402)**
- Usuario hace click: "Calcular Score - 2 USDC"
- Frontend llama: `POST /api/score/calculate`
- Backend responde: HTTP 402 (Payment Required)
- SDK x402 muestra modal de pago
- Usuario aprueba pago de 2 USDC en MetaMask
- SDK reintenta request con header `X-PAYMENT`
- Backend verifica pago → Calcula score → Mint SBT
- Usuario recibe:
  - Score crediticio (ej: 750/1000)
  - SBT Token ID (#123)
  - Score hash verificable

**Paso 4: Usar SBT en Otras Plataformas**
- Usuario va a plataforma DeFi de préstamos (ej: LendApp)
- Solicita préstamo sin colateral
- LendApp lee SBT del usuario desde blockchain
- Evalúa: verificationLevel >= 2 → Aprobar préstamo
- Usuario recibe préstamo basado en su reputación

**Paso 5: Actualizar Score (Opcional)**
- Después de usar préstamos y pagar a tiempo
- Usuario puede actualizar score pagando 2 USDC nuevamente
- Nuevo SBT con score mejorado

### MoSCoW Framework

#### MUST HAVE (MVP para Hackathon)

1. **Sistema de Pago x402**
   - Integración completa con x402
   - Middleware en backend
   - SDK en frontend
   - Verificación de pagos

2. **Smart Contract SBT**
   - Contrato ERC-5192 (Soulbound Token)
   - Mint SBT con metadata (scoreHash, verificationLevel)
   - No transferible

3. **Cálculo de Score**
   - Algoritmo básico de scoring
   - Factores: verificación de identidad, documentos, antigüedad
   - Generación de hash verificable

4. **Verificación de Identidad Básica**
   - Subida de DNI
   - Verificación manual o automática
   - Registro en IdentityRegistry

5. **Frontend Funcional**
   - Dashboard de usuario
   - Flujo de pago x402
   - Visualización de score y SBT
   - Conexión de wallet

6. **API Backend**
   - Endpoint para calcular score (con x402)
   - Endpoint para consultar score
   - Integración con smart contracts

#### SHOULD HAVE (Mejoras importantes)

1. **Sistema de Scoring Avanzado**
   - Algoritmo más sofisticado
   - Múltiples factores de evaluación
   - Machine Learning (opcional)

2. **Verificación Automática de Identidad**
   - OCR para lectura de DNI
   - Validación automática
   - Reducción de tiempo de aprobación

3. **Dashboard Mejorado**
   - Historial de scores
   - Gráficos de evolución
   - Lista de plataformas que aceptan ScorePass

4. **API para Otras dApps**
   - Endpoint `/api/score/verify` para verificación
   - Documentación para desarrolladores
   - SDK para integración

5. **Sistema de Recompensas**
   - Mejora de score por buen comportamiento
   - Penalización por incumplimientos
   - Actualización dinámica

#### COULD HAVE (Nice to have)

1. **Reputación Multicadena**
   - SBT verificable en múltiples blockchains
   - Bridge de reputación

2. **Sistema de Referidos**
   - Incentivos por referir usuarios
   - Mejora de score por red social

3. **Integración con Oráculos**
   - Datos externos para scoring
   - Verificación de ingresos
   - Historial crediticio tradicional (si disponible)

4. **Gobernanza DAO**
   - Comunidad decide criterios de scoring
   - Propuestas y votación

5. **Analytics y Reportes**
   - Dashboard de analytics para plataformas
   - Métricas de uso
   - Insights de mercado

#### WON'T HAVE (Fuera de scope)

1. **Sistema de Préstamos Completo**
   - ScorePass solo provee scoring, no préstamos
   - Otras plataformas manejan préstamos

2. **Exchange de Tokens**
   - No es un exchange
   - Solo scoring y reputación

3. **Staking o Yield Farming**
   - No hay tokens gobernanza
   - Modelo simple de pago por uso

4. **NFTs Transferibles**
   - Solo SBT (no transferibles)
   - Enfoque en reputación, no especulación

---

## Technical Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Wagmi, RainbowKit
- **Backend**: Node.js, Express, x402-express middleware
- **Smart Contracts**: Solidity 0.8.0+, Hardhat, ERC-5192
- **Blockchain**: Avalanche C-Chain (Fuji Testnet)
- **Payments**: x402 Protocol, USDC
- **Storage**: IPFS (para documentos), Database (para datos off-chain)

---

## Timeline (2 semanas)

**Semana 1:**
- Día 1-2: Setup y configuración (Avalanche, x402)
- Día 3-4: Smart Contracts (SBT, IdentityRegistry)
- Día 5-6: Backend con x402
- Día 7: Integración frontend-backend

**Semana 2:**
- Día 8-9: Frontend completo
- Día 10-11: Testing y debugging
- Día 12: Demo y documentación
- Día 13: Pitch preparation

---

## Success Metrics

1. **Usuarios**: 50+ usuarios con SBT en testnet
2. **Pagos x402**: 100+ transacciones exitosas
3. **Integraciones**: 2-3 plataformas DeFi usando ScorePass SBT
4. **Técnico**: 0 bugs críticos, contratos auditados básicamente

---

## Future Roadmap

- **Q1 2025**: Lanzamiento en Avalanche Mainnet
- **Q2 2025**: Integración con 10+ plataformas DeFi
- **Q3 2025**: Scoring avanzado con ML
- **Q4 2025**: Expansión a otras blockchains (Polygon, Base)

