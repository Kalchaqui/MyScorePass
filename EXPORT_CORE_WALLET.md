# Cómo Exportar Clave Privada de Core Wallet

## ⚠️ ADVERTENCIA DE SEGURIDAD

**NUNCA compartas tu clave privada o frase semilla con nadie.**
- Solo úsala para importar a MetaMask en tu propio dispositivo
- No la envíes por email, mensajes, o cualquier medio no seguro
- Una vez que tengas acceso, considera crear una nueva wallet si la compartiste accidentalmente

## Método 1: Exportar Clave Privada (Recomendado)

### Pasos en Core Wallet:

1. **Abre Core Wallet**
   - Ve a la aplicación Core o extensión del navegador

2. **Accede a la Configuración de la Cuenta**
   - Haz clic en el menú (☰) o en el icono de configuración
   - Busca "Account Settings" o "Configuración de Cuenta"
   - O busca "Export" o "Exportar"

3. **Selecciona tu cuenta**
   - Asegúrate de seleccionar la cuenta correcta: `0xaAd92902bD807A5c54741F564A35B8eD46740865`
   - La cuenta debe estar en "Avalanche (C-Chain)"

4. **Exportar Clave Privada**
   - Busca la opción "Export Private Key" o "Exportar Clave Privada"
   - Puede estar en "Advanced" o "Avanzado"
   - Core Wallet te pedirá tu contraseña para confirmar

5. **Copia la Clave Privada**
   - Se mostrará como una cadena hexadecimal que comienza con `0x`
   - Ejemplo: `0x1234567890abcdef...`
   - **Copia esta clave completa**

## Método 2: Si Core Wallet es "Seedless"

Si tu cuenta es "Seedless" (sin semilla), Core Wallet puede usar un sistema diferente. En ese caso:

1. **Verifica si puedes exportar**
   - Algunas cuentas seedless no permiten exportar la clave privada directamente
   - Busca en la configuración de Core Wallet

2. **Alternativa: Usar la misma wallet en ambos**
   - Si Core Wallet y MetaMask pueden usar la misma extensión/provider
   - O conecta Core Wallet directamente a la dApp

## Importar a MetaMask

Una vez que tengas la clave privada:

1. **Abre MetaMask**
   - Si no lo tienes, instálalo desde https://metamask.io

2. **Importar Cuenta**
   - Haz clic en el icono de cuenta (círculo) en la esquina superior derecha
   - Selecciona "Import Account" o "Importar Cuenta"

3. **Pega la Clave Privada**
   - Selecciona "Private Key" o "Clave Privada"
   - Pega la clave que copiaste de Core Wallet
   - Haz clic en "Import" o "Importar"

4. **Verifica**
   - Tu cuenta debería aparecer con la misma dirección: `0xaAd92902bD807A5c54741F564A35B8eD46740865`
   - Verifica que el balance sea el mismo

## Configurar Avalanche Fuji en MetaMask

Después de importar:

1. **Añadir Red**
   - En MetaMask, haz clic en la red actual (probablemente "Ethereum Mainnet")
   - Selecciona "Add Network" o "Añadir Red"
   - O ve a Settings > Networks > Add Network

2. **Configuración de Avalanche Fuji**
   - **Network Name**: Avalanche Fuji Testnet
   - **RPC URL**: `https://api.avax-test.network/ext/bc/C/rpc`
   - **Chain ID**: 43113
   - **Currency Symbol**: AVAX
   - **Block Explorer URL**: `https://testnet.snowtrace.io`

3. **Guardar y Cambiar**
   - Guarda la red
   - Cambia a "Avalanche Fuji Testnet"

4. **Añadir USDC Token**
   - En MetaMask, ve a "Import tokens"
   - Pega la dirección: `0x5425890298aed601595a70AB815c96711a31Bc65`
   - MetaMask debería detectar USDC automáticamente

## Verificar que Funciona

1. **Conecta MetaMask a MyScorePass**
   - Ve a `http://localhost:3000`
   - Haz clic en "Conectar Wallet"
   - Selecciona MetaMask
   - Deberías ver tu dirección: `0xaAd9...40865`

2. **Verifica el Balance**
   - Deberías ver 6 AVAX y 1 USDC (según las imágenes que compartiste)

## Notas Importantes

- **Seguridad**: Nunca compartas tu clave privada
- **Backup**: Asegúrate de tener un backup seguro de tu clave privada
- **Múltiples Wallets**: Puedes usar la misma cuenta en Core Wallet y MetaMask simultáneamente
- **Testnet**: Recuerda que estás en testnet, estos tokens no tienen valor real

## Troubleshooting

**Si no encuentras la opción de exportar:**
- Busca en "Advanced Settings" o "Configuración Avanzada"
- Algunas versiones de Core Wallet pueden tener la opción en diferentes lugares
- Consulta la documentación oficial de Core Wallet

**Si la importación falla:**
- Verifica que copiaste la clave completa (debe empezar con `0x`)
- Asegúrate de que no hay espacios adicionales
- Intenta copiar y pegar de nuevo

