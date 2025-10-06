# 🏆 DeFiCred - Submission para NERDCONF Polkadot Hackathon

## 🎯 Resumen Ejecutivo

**DeFiCred** es una plataforma de préstamos P2P descentralizada que democratiza el acceso al crédito mediante un sistema de **scoring alternativo** basado en verificación de identidad y documentos, eliminando la necesidad de colateral tradicional en tokens.

### Problema que Resuelve

- 🚫 Millones de personas sin historial crediticio tradicional
- 💰 Plataformas DeFi actuales requieren sobre-colateralización (150-200%)
- 📄 No existe un sistema de reputación descentralizada para préstamos

### Nuestra Solución

- ✅ **Proof of Humanity** con ID único por usuario
- ✅ **Credit Scoring Descentralizado** (0-1000 puntos)
- ✅ Préstamos basados en **reputación verificable**
- ✅ Sistema **P2P** donde todos ganan
- ✅ Construido en **Polkadot/Moonbeam**

## 🔧 Stack Tecnológico

### Blockchain
- **Moonbeam** (Parachain de Polkadot)
- **Solidity 0.8.20** para smart contracts
- **Hardhat** para desarrollo y testing
- Compatible con **Paseo Testnet**

### Smart Contracts (4 contratos principales)
1. **IdentityRegistry.sol** - Sistema de identidad única
2. **CreditScoring.sol** - Motor de scoring crediticio
3. **LendingPool.sol** - Pool de liquidez P2P
4. **LoanManager.sol** - Gestión de préstamos

### Frontend
- **Next.js 14** (React)
- **TypeScript** para type safety
- **TailwindCSS** para UI moderna
- **Wagmi + RainbowKit** para integración Web3
- **ethers.js** para interacción con blockchain

### Backend
- **Node.js + Express**
- API RESTful para oráculos
- Servicio de carga de documentos (IPFS-ready)

## 🌟 Características Destacadas

### 1. Sistema de Identidad Único
- Cada usuario recibe un **Proof of Humanity** único
- Imposible crear múltiples identidades con la misma wallet
- Basado en hash criptográfico (address + timestamp + blockhash)

### 2. Scoring Inteligente
```
Score = (Verificación × 40%) + (Documentos × 30%) + (Antigüedad × 30%)

Nivel 1 (Básico):     DNI/Pasaporte         → $100-$150
Nivel 2 (Medio):      + Comprobante sueldo  → $500-$750
Nivel 3 (Completo):   + Extracto bancario   → $2,000-$3,000
```

### 3. Incentivos para Buen Comportamiento
- ✅ Pagar a tiempo → **+50 puntos** de score
- ❌ Default → **-200 puntos** de score
- 📈 Score actualizable agregando más documentos

### 4. Interfaz Homebanking
- Dashboard intuitivo tipo banco tradicional
- Vista clara de:
  - Estado de identidad
  - Credit score actual
  - Préstamos activos
  - Límite de crédito disponible

### 5. Sistema P2P Completo
- **Prestamistas**: Depositan fondos y ganan intereses (5% APY)
- **Prestatarios**: Solicitan préstamos según su score
- **Pool compartido**: Liquidez distribuida automáticamente

## 📊 Flujo de Usuario

### Para Prestatarios

```
1. Conectar Wallet
   ↓
2. Crear Identidad (Proof of Humanity)
   ↓
3. Cargar Documentos (DNI, recibos, etc.)
   ↓
4. Obtener Score (automático on-chain)
   ↓
5. Solicitar Préstamo (hasta su límite)
   ↓
6. Recibir USDC/USDT
   ↓
7. Repagar a Tiempo → Mejora Score
```

### Para Prestamistas

```
1. Conectar Wallet
   ↓
2. Depositar USDC/USDT en Pool
   ↓
3. Ganar Intereses Automáticamente
   ↓
4. Retirar Cuando Quiera
```

## 🎨 Screenshots (Conceptual)

### Landing Page
- Hero section con call-to-action
- Explicación de 3 pasos (Verificar → Score → Prestar)
- Estadísticas del protocolo

### Dashboard
- Cards con estado de identidad, score y préstamos
- Acciones rápidas para solicitar/prestar
- Interfaz limpia tipo homebanking

### Gestión de Identidad
- Upload de documentos
- Visualización de nivel de verificación
- Historial de documentos cargados

## 🔐 Seguridad

### Smart Contracts
- ✅ Uso de **OpenZeppelin** contracts auditados
- ✅ **ReentrancyGuard** en funciones críticas
- ✅ **Ownable** para control de acceso
- ✅ **SafeERC20** para transferencias seguras

### Tests Comprehensivos
```bash
✓ IdentityRegistry - Crear identidad
✓ IdentityRegistry - Agregar documentos
✓ IdentityRegistry - Verificación
✓ CreditScoring - Calcular score
✓ CreditScoring - Actualizar score
✓ LendingPool - Depósitos
✓ LendingPool - Retiros
✓ LendingPool - Cálculo de intereses
✓ LoanManager - Solicitar préstamo
✓ LoanManager - Repagar préstamo
✓ LoanManager - Límites de crédito

11 passing tests
```

## 📈 Métricas y Demostraciones

### Gas Costs (Estimados en Moonbeam)
- Crear identidad: ~150,000 gas
- Calcular score: ~100,000 gas
- Solicitar préstamo: ~200,000 gas
- Repagar préstamo: ~180,000 gas

### Capacidades del Sistema
- ✅ Múltiples usuarios simultáneos
- ✅ Préstamos concurrentes
- ✅ Pool de liquidez escalable
- ✅ Actualizaciones de score en tiempo real

## 🚀 Deployment

### Testnets Soportadas
1. **Moonbase Alpha** (Principal)
   - RPC: https://rpc.api.moonbase.moonbeam.network
   - Chain ID: 1287

2. **Shibuya (Astar)** (Alternativa)
   - RPC: https://evm.shibuya.astar.network
   - Chain ID: 81

3. **Paseo** (Configurable)
   - Configuración lista en hardhat.config.js

### Instrucciones de Deployment

```bash
# 1. Compilar contratos
cd contracts && npx hardhat compile

# 2. Desplegar en testnet
npx hardhat run scripts/deploy.js --network moonbase

# 3. Iniciar frontend
cd frontend && npm run dev

# 4. Iniciar backend
cd backend && npm run dev
```

Ver [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) para instrucciones detalladas.

## 🛣️ Roadmap Post-Hackathon

### Fase 1 - Mejoras Inmediatas (1-2 meses)
- [ ] Integración con **Chainlink oráculos** para datos off-chain
- [ ] KYC automatizado con **Veriff/Onfido**
- [ ] Optimización de gas costs
- [ ] Auditoría de seguridad básica

### Fase 2 - Expansión (3-6 meses)
- [ ] Colateral en **RWA** (Real World Assets)
- [ ] **Machine Learning** para scoring mejorado
- [ ] Integración con otras parachains de Polkadot
- [ ] Token de gobernanza **CRED**

### Fase 3 - Mainnet (6-12 meses)
- [ ] Deployment en Polkadot mainnet
- [ ] **DAO** para decisiones del protocolo
- [ ] Seguros contra defaults (Insurance Fund)
- [ ] Expansión a otras regiones/monedas

## 💡 Innovación e Impacto

### ¿Por qué es Innovador?

1. **Primer sistema de scoring on-chain** sin necesidad de colateral
2. **Proof of Humanity único** por usuario (previene Sybil attacks)
3. **Incentivos dinámicos** que mejoran con buen comportamiento
4. **Totalmente descentralizado** - no depende de bureaus crediticios

### Impacto Social

- 📊 **2.5 billones** de personas sin acceso a crédito tradicional
- 🌍 **Inclusión financiera** real en países en desarrollo
- 💰 Elimina intermediarios costosos (bancos tradicionales)
- 🤝 Crea una economía P2P justa y transparente

## 🏗️ Arquitectura Técnica

```
┌──────────────────────────────────────────────────┐
│              Frontend (Next.js)                  │
│  - React Components                              │
│  - Wagmi/RainbowKit                              │
│  - TypeScript                                    │
└───────────────┬──────────────────────────────────┘
                │
                ├─────────────┬────────────────┐
                ▼             ▼                ▼
    ┌────────────────┐  ┌──────────┐  ┌──────────────┐
    │  Moonbeam      │  │ Backend  │  │  Oráculos    │
    │  (Polkadot)    │  │  API     │  │  Externos    │
    └────────────────┘  └──────────┘  └──────────────┘
            │
    ┌───────┴───────┐
    │               │
┌───▼────┐   ┌────▼────┐
│Identity│   │ Credit  │
│Registry│   │ Scoring │
└────────┘   └─────────┘
    │               │
┌───▼────┐   ┌────▼────┐
│Lending │   │  Loan   │
│  Pool  │   │ Manager │
└────────┘   └─────────┘
```

## 📝 Repositorio

- **GitHub**: [DeFiCred](https://github.com/tu-usuario/DeFiCred)
- **Documentación completa** en README.md
- **Guía de deployment** paso a paso
- **Tests comprehensivos** incluidos

## 👥 Equipo

- Desarrollador Full-Stack con experiencia en blockchain
- Especialización en Solidity y React
- Participante en múltiples hackathons

## 📧 Contacto

- **GitHub**: [@tu-usuario](https://github.com/tu-usuario)
- **Email**: tu-email@ejemplo.com
- **Discord**: Tu#1234

## 🙏 Agradecimientos

Un agradecimiento especial a:
- **NERDCONF** por organizar esta hackathon
- **Polkadot** por la infraestructura increíble
- **Moonbeam** por facilitar el desarrollo EVM en Polkadot
- **OpenZeppelin** por los contratos seguros
- La comunidad de desarrolladores de Polkadot

## 📄 Licencia

MIT License - Open Source

---

## 🎬 Demo en Vivo

**Video Demo**: [Link al video]
**Deployment en Testnet**: [Link a Moonscan]
**Website**: [Link si está hosteado]

---

## ✨ Conclusión

**DeFiCred** representa una solución real a un problema global: la falta de acceso al crédito para millones de personas. Usando la tecnología de Polkadot y un sistema de scoring innovador, creamos una plataforma que es:

- ✅ **Inclusiva** - Acceso para todos
- ✅ **Transparente** - Todo on-chain
- ✅ **Justa** - Recompensa el buen comportamiento
- ✅ **Escalable** - Construida en Polkadot
- ✅ **Sostenible** - Modelo económico viable

Estamos emocionados de presentar este proyecto en **NERDCONF** y contribuir al ecosistema de Polkadot.

---

**¡Gracias por considerar DeFiCred! 🚀**

*"Democratizando el acceso al crédito, una identidad a la vez."*


