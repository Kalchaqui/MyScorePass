# 🔑 Cómo Obtener la Clave Privada de Core Wallet

## ⚠️ ADVERTENCIA DE SEGURIDAD

**NUNCA compartas tu clave privada con nadie.**
- Solo úsala en tu propio dispositivo
- No la envíes por email, mensajes, o cualquier medio
- Mantén un backup seguro

## Método 1: Desde la Interfaz de Core Wallet (Recomendado)

### Pasos:

1. **Abre Core Wallet**
   - Extensión del navegador o aplicación

2. **Ve a Configuración**
   - Haz clic en el menú (☰) o icono de configuración
   - Busca "Settings" o "Configuración"

3. **Accede a la Cuenta**
   - Selecciona tu cuenta: `0xaAd92902bD807A5c54741F564A35B8eD46740865`
   - Asegúrate de estar en "Avalanche (C-Chain)"

4. **Exportar Clave Privada**
   - Busca "Export Private Key" o "Exportar Clave Privada"
   - Puede estar en:
     - "Advanced" / "Avanzado"
     - "Account Settings" / "Configuración de Cuenta"
     - "Security" / "Seguridad"
   - Core Wallet te pedirá tu contraseña

5. **Copia la Clave**
   - Se mostrará como: `0x1234567890abcdef...` (64 caracteres después del 0x)
   - **Copia esta clave completa**

## Método 2: Usar Consola del Navegador (Solo si Core Wallet lo permite)

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Intentar acceder a la clave privada (puede no funcionar por seguridad)
if (window.ethereum && window.ethereum.isCore) {
  // Core Wallet puede no exponer esto directamente
  console.log('Core Wallet detectado, pero la clave privada no está disponible por seguridad');
}
```

**Nota**: La mayoría de wallets NO exponen la clave privada por JavaScript por seguridad.

## Método 3: Usar Frase Semilla (Seed Phrase)

Si Core Wallet te dio una frase semilla cuando creaste la cuenta:

1. **Obtén la frase semilla** desde Core Wallet
2. **Usa un script** para derivar la clave privada (ver abajo)

## Método 4: Crear una Nueva Wallet Solo para Deployment

Si no puedes exportar la clave privada, puedes:

1. **Crear una nueva wallet** solo para desplegar contratos
2. **Usar MetaMask** para crear una nueva cuenta de test
3. **Obtener AVAX de testnet** para esa nueva wallet
4. **Usar esa clave privada** para el deployment

### Crear Nueva Wallet con MetaMask:

```bash
# MetaMask te dará la clave privada cuando creas una nueva cuenta
# O puedes usar un generador de wallets
```

## Script para Derivar Clave Privada desde Seed Phrase

Si tienes la frase semilla, puedes usar este script (ejecutar localmente, NO en línea):

```javascript
// ⚠️ SOLO EJECUTAR EN TU COMPUTADORA LOCAL, NUNCA EN LÍNEA
// Requiere: npm install bip39 ethereumjs-wallet

const bip39 = require('bip39');
const { hdkey } = require('ethereumjs-wallet');

// Tu frase semilla (12 o 24 palabras)
const mnemonic = 'tus palabras aqui separadas por espacios';

// Validar frase
if (!bip39.validateMnemonic(mnemonic)) {
  console.error('Frase semilla inválida');
  process.exit(1);
}

// Derivar clave privada
const seed = bip39.mnemonicToSeedSync(mnemonic);
const hdwallet = hdkey.fromMasterSeed(seed);
const wallet = hdwallet.derivePath("m/44'/60'/0'/0/0").getWallet();

console.log('Dirección:', wallet.getAddressString());
console.log('Clave Privada:', wallet.getPrivateKeyString());
```

## Alternativa: Usar Core Wallet Directamente (Sin Exportar)

Si no puedes exportar la clave privada, puedes:

1. **Conectar Core Wallet a la dApp** (ya lo estás haciendo)
2. **Usar una wallet separada** solo para deployment del backend
3. **El backend puede usar una wallet diferente** a la del usuario

### Configuración Alternativa:

```env
# backend/.env
# Usa una wallet diferente solo para el backend
BACKEND_PRIVATE_KEY=0x... # Nueva wallet creada solo para backend
```

Esta wallet del backend:
- Solo necesita AVAX para gas
- Será el owner de los contratos
- Puede mintear SBTs
- NO necesita ser la misma que Core Wallet del usuario

## Recomendación Final

**Para el hackathon MVP, te recomiendo:**

1. **Crear una nueva wallet** solo para el backend (puede ser con MetaMask)
2. **Obtener AVAX de testnet** para esa wallet
3. **Usar esa clave privada** en `backend/.env`
4. **Los usuarios pueden seguir usando Core Wallet** normalmente

La wallet del backend y la wallet del usuario pueden ser diferentes. El backend solo necesita:
- Ser owner de los contratos (para mintear SBTs)
- Tener AVAX para gas

Los usuarios pueden usar cualquier wallet (Core Wallet, MetaMask, etc.) para interactuar con la dApp.

