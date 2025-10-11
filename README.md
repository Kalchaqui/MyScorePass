

# Loanet - Plataforma DeFi de Préstamos en Polkadot

Loanet es una plataforma descentralizada de préstamos construida en la testnet Paseo de Polkadot, que ofrece préstamos sin garantía con un sistema integral de scoring crediticio y mecanismos de protección de múltiples niveles.

## 🌐 Red
**Paseo Testnet (Polkadot)**

## 📋 Smart Contracts

### Direcciones de Contratos
- **IdentityRegistry**: `0x18d71DaCd2e657A8babf6C94E0f922C5746E0733`
- **CreditScoring**: `0x345F7F2556EC6480aAa8fCf8deb6CCa202Ed2A14`
- **LendingPool**: `0x0561eC805C7fbf2392b3353BD5f0920665Ee2b66`
- **LoanManager**: `0x84A5e36B1619c2333d687615aC40d2C141B00A55`
- **MockUSDC**: `0x482aAC0Eda23639A4fCd2662E8C67B557e21ef37`

### ABIs de Contratos
Todos los ABIs de contratos están disponibles en `frontend/config/abis.ts`

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- Wallet MetaMask
- Paseo testnet configurado en MetaMask

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/Kalchaqui/DeFiCred-.git
cd DeFiCred

# Instalar dependencias
cd frontend && npm install
cd ../backend && npm install
cd ../contracts && npm install
```

### Ejecutar la Aplicación
```bash
# Iniciar backend
cd backend && npm start

# Iniciar frontend (en otra terminal)
cd frontend && npm run dev
```

### Probar Smart Contracts

**🌐 En Producción (Recomendado para jueces):**
- **URL**: `https://frontend-5uwo30gqj-kalchas-projects.vercel.app/test`
- **Acceso**: Botón "Test Contracts" en el dashboard
- **Ventaja**: No requiere instalación local

**💻 En Local (Para desarrollo):**
- **URL**: `http://localhost:3000/test`
- **Requisito**: Ejecutar la aplicación localmente

**📋 Instrucciones de uso:**
1. Conecta tu wallet MetaMask
2. Selecciona un contrato para probar
3. Usa las funciones "Read" y "Write" para interactuar con los contratos
4. Verifica los resultados on-chain en tiempo real

## 🏗️ Arquitectura

### Frontend
- **Next.js 14** con App Router
- **Wagmi + RainbowKit** para conexión de wallet
- **Tailwind CSS** para estilos
- **React Hot Toast** para notificaciones

### Backend
- **Node.js + Express** servidor
- **Multer** para subida de archivos
- **CORS** habilitado para peticiones cross-origin

### Smart Contracts
- **Solidity 0.8.0**
- **Hardhat** para desarrollo
- **Polkadot Remix IDE** para despliegue

## 🔧 Características Principales

### Gestión de Identidad
- Subida y verificación de DNI
- Sistema de aprobación por administrador
- Identidad única por wallet

### Scoring Crediticio
- Cálculo de score inicial
- Límites de préstamo basados en score
- Seguimiento de rendimiento

### Sistema de Préstamos
- Préstamos sin garantía
- Planes de pago flexibles (1, 3, 6, 12 meses)
- Tasas de interés: 5%, 8%, 12%, 18% APY

### Sistema de Protección
- **Nivel 1**: Prevención (límites bajos, scoring progresivo)
- **Nivel 2**: Penalización (reducción de score, registro en blockchain)
- **Nivel 3**: Fondo de seguros (2% del monto del préstamo)

## 📱 Flujo de Usuario

1. **Verificación de Identidad**: Subir DNI → Aprobación de administrador
2. **Scoring Crediticio**: Calcular score inicial
3. **Solicitud de Préstamo**: Seleccionar monto y plan de pago
4. **Gestión de Préstamos**: Seguimiento de pagos e historial

## 🧪 Página de Test Obligatoria

**✅ Requisito del hackathon cumplido**

La aplicación incluye una página de pruebas integral que permite la interacción directa con todos los smart contracts:

### **🌐 Acceso en Producción:**
- **URL Directa**: `https://frontend-5uwo30gqj-kalchas-projects.vercel.app/test`
- **Desde Dashboard**: Botón "Test Contracts" en "Acciones Rápidas"
- **Ventaja**: Los jueces pueden acceder sin instalación

### **💻 Acceso Local:**
- **URL**: `http://localhost:3000/test`
- **Requisito**: Ejecutar aplicación localmente

### **🔧 Funcionalidades:**
- **Funciones Read**: Ver estado del contrato y datos del usuario
- **Funciones Write**: Ejecutar funciones del contrato
- **Seguimiento de Transacciones**: Monitorear hashes de transacciones y eventos
- **Manejo de Errores**: Mensajes de error claros y validación
- **5 Contratos Disponibles**: IdentityRegistry, CreditScoring, LendingPool, LoanManager, USDC

## 🔒 Seguridad

- Todos los contratos desplegados solo en testnet
- No se involucran activos reales
- Funciones de administrador protegidas
- Validación de entrada y manejo de errores

## 📄 Licencia

Licencia MIT - ver archivo LICENSE para detalles

## 🤝 Contribuciones

Este proyecto fue desarrollado para el Polkadot Hackathon. Para preguntas o contribuciones, por favor abre un issue en GitHub.

---

**Construido con ❤️ para el ecosistema Polkadot**
