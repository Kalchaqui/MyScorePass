# 🏦 DeFiCred - Crédito Descentralizado

**DeFiCred** es una plataforma de préstamos descentralizada que utiliza **Proof of Humanity** y **Credit Scoring** para ofrecer préstamos sin garantías en el ecosistema **Polkadot**.

## 🚀 Características Principales

### 🛡️ Sistema de Verificación de Identidad
- **DNI Upload**: Subida segura de documentos de identidad
- **Verificación Manual**: Proceso de aprobación por administradores
- **Proof of Humanity**: Identidad única en blockchain
- **Unicidad**: 1 DNI = 1 Wallet (hash SHA256)

### 📊 Credit Scoring Inteligente
- **Scoring Progresivo**: Límites basados en historial crediticio
- **Penalización por Default**: Sistema de reputación on-chain
- **Blacklist**: Prevención de usuarios problemáticos

### 💰 Sistema de Préstamos
- **Sin Garantías**: Préstamos basados en reputación
- **Cuotas Flexibles**: 1, 3, 6 y 12 meses
- **Tasas Competitivas**: 5%, 8%, 12% y 18% APY
- **Pagos por Cuotas**: Sistema de instalments

### 🛡️ Sistema de Protección de 3 Niveles
1. **NIVEL 1 - Prevención**: Límites iniciales bajos ($100-$500)
2. **NIVEL 2 - Penalización**: Score -200, blacklist pública
3. **NIVEL 3 - Seguro**: Fondo de seguros del 2% del préstamo

## 🏗️ Arquitectura Técnica

### Frontend
- **Next.js 14** con App Router
- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **RainbowKit** para conexión de wallets
- **Wagmi** para interacción con blockchain
- **Ethers.js** para operaciones Ethereum

### Backend
- **Node.js** con Express
- **Multer** para upload de archivos
- **CORS** habilitado
- **File System** para almacenamiento local

### Smart Contracts
- **Solidity 0.8.0**
- **DeFiCredAIO.sol**: Contrato todo-en-uno
- **ERC20**: MockUSDC para testing
- **Paseo Testnet**: Polkadot Asset Hub

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- MetaMask o wallet compatible
- PAS tokens (Paseo Testnet)

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/DeFiCred.git
cd DeFiCred
```

### 2. Instalar dependencias del frontend
```bash
cd frontend
npm install
```

### 3. Instalar dependencias del backend
```bash
cd ../backend
npm install
```

### 4. Configurar variables de entorno
```bash
# Frontend (.env.local)
NEXT_PUBLIC_RPC_URL=https://testnet-passet-hub-eth-rpc.polkadot.io
NEXT_PUBLIC_CHAIN_ID=420420422

# Backend (.env)
PORT=3001
```

### 5. Iniciar servicios
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🎯 Uso de la Plataforma

### Para Usuarios
1. **Conectar Wallet** en http://localhost:3000
2. **Subir DNI** en `/onboarding`
3. **Esperar Aprobación** del administrador
4. **Crear Identidad** en `/dashboard/identity`
5. **Calcular Score** en `/dashboard/score`
6. **Solicitar Préstamo** en `/dashboard/borrow`

### Para Administradores
1. **Conectar Wallet Admin** (`0x6ceffA0beE387C7c58bAb3C81e17D32223E68718`)
2. **Acceder a Panel** en `/admin`
3. **Revisar DNIs** pendientes
4. **Aprobar/Rechazar** usuarios

## 🔗 Contratos Desplegados

### Paseo Testnet
- **DeFiCredAIO**: `0x...` (Contrato principal)
- **MockUSDC**: `0x...` (Token de prueba)

### Direcciones Importantes
- **Admin Wallet**: `0x6ceffA0beE387C7c58bAb3C81e17D32223E68718`
- **RPC URL**: `https://testnet-passet-hub-eth-rpc.polkadot.io`
- **Chain ID**: `420420422`

## 🛠️ Desarrollo

### Estructura del Proyecto
```
DeFiCred/
├── frontend/          # Next.js App
│   ├── app/          # App Router
│   ├── components/   # Componentes React
│   ├── hooks/        # Custom Hooks
│   └── config/       # Configuración
├── backend/          # Node.js API
│   ├── src/          # Código fuente
│   ├── uploads/      # Archivos subidos
│   └── data/         # Base de datos JSON
├── contracts/        # Smart Contracts
│   ├── contracts/    # Solidity files
│   └── scripts/      # Deployment scripts
└── docs/            # Documentación
```

### Scripts Disponibles
```bash
# Frontend
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Servidor producción

# Backend
npm start            # Servidor producción
npm run dev          # Desarrollo con nodemon

# Contracts
npx hardhat compile  # Compilar contratos
npx hardhat deploy   # Desplegar contratos
```

## 🔒 Seguridad

### Medidas Implementadas
- **Reentrancy Guards** en contratos
- **Input Validation** en frontend y backend
- **File Type Validation** para uploads
- **Hash SHA256** para unicidad de DNIs
- **Admin-only** funciones críticas

### Consideraciones
- **Testnet Only**: No usar en mainnet sin auditoría
- **Mock Tokens**: USDC es solo para testing
- **File Storage**: Considerar IPFS para producción

## 🎯 Roadmap

### Fase 1 ✅ (Completado)
- [x] Sistema de identidad básico
- [x] Upload de DNI
- [x] Credit scoring
- [x] Préstamos básicos
- [x] Frontend completo

### Fase 2 🚧 (En desarrollo)
- [ ] Integración con Sumsub
- [ ] Oracle de datos externos
- [ ] Sistema de reputación avanzado
- [ ] Pool de liquidez

### Fase 3 🔮 (Futuro)
- [ ] Cross-chain bridges
- [ ] DeFi integrations
- [ ] Mobile app
- [ ] Governance token

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Desarrollador Principal**: [Tu Nombre]
- **Blockchain Developer**: [Tu Nombre]
- **UI/UX Designer**: [Tu Nombre]

## 📞 Contacto

- **Email**: tu-email@ejemplo.com
- **Twitter**: @tu-twitter
- **LinkedIn**: tu-linkedin
- **GitHub**: tu-github

## 🙏 Agradecimientos

- **Polkadot** por el ecosistema
- **RainbowKit** por la integración de wallets
- **Next.js** por el framework
- **Comunidad DeFi** por la inspiración

---

**⭐ Si te gusta el proyecto, dale una estrella en GitHub!**