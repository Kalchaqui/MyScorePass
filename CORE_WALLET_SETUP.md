# Configuración Core Wallet para MyScorePass

## Tu Dirección Core Wallet
**`0xaAd92902bD807A5c54741F564A35B8eD46740865`**

## Configuración

### 1. Añadir Avalanche Fuji Testnet a Core Wallet

Core Wallet debería detectar automáticamente la red cuando intentes conectar, pero si necesitas añadirla manualmente:

**Configuración de Red:**
- **Nombre**: Avalanche Fuji Testnet
- **RPC URL**: `https://api.avax-test.network/ext/bc/C/rpc`
- **Chain ID**: 43113
- **Símbolo**: AVAX
- **Explorador**: https://testnet.snowtrace.io

### 2. Añadir USDC Token

Para ver tu balance de USDC en Core Wallet:

1. Abre Core Wallet
2. Ve a la sección de tokens
3. Añade token personalizado:
   - **Dirección del contrato**: `0x5425890298aed601595a70AB815c96711a31Bc65`
   - **Símbolo**: USDC
   - **Decimals**: 6

### 3. Conectar Core Wallet a MyScorePass

1. Asegúrate de que Core Wallet esté instalado y activo en tu navegador
2. Abre `http://localhost:3000`
3. Haz clic en "Conectar Wallet"
4. Busca "Injected" o "Otros" en el modal de RainbowKit (Core Wallet aparecerá automáticamente si está instalado)
5. Si no aparece, verifica que:
   - Core Wallet esté instalado y activo
   - La extensión no esté bloqueada
   - Refresca la página después de instalar Core Wallet
6. Selecciona Core Wallet y acepta la conexión

## Compatibilidad

Core Wallet es compatible con:
- ✅ EIP-1193 (estándar de wallets)
- ✅ RainbowKit (usado en MyScorePass)
- ✅ Wagmi (usado en MyScorePass)
- ✅ Thirdweb (usado para x402)

## Verificar Conexión

Una vez conectado, deberías ver:
- Tu dirección en el header: `0xaAd9...40865`
- Acceso a todas las funcionalidades de MyScorePass
- Posibilidad de probar endpoints x402 en `/test`

## Notas

- Core Wallet funciona igual que MetaMask para este proyecto
- Todos los contratos y transacciones funcionan igual
- El flujo x402 es idéntico independientemente de la wallet

## Troubleshooting

Si Core Wallet no aparece en el modal de conexión:

1. **Verifica que Core Wallet esté instalado y activo**
   - Abre las extensiones del navegador
   - Asegúrate de que Core Wallet esté habilitado

2. **Refresca la página completamente**
   - Presiona `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac) para hard refresh
   - O cierra y vuelve a abrir la pestaña

3. **Verifica la consola del navegador**
   - Presiona `F12` para abrir DevTools
   - Ve a la pestaña "Console"
   - Busca errores relacionados con wallets

4. **Prueba en modo incógnito**
   - A veces otras extensiones pueden interferir
   - Abre una ventana incógnito y prueba ahí

5. **Verifica que Core Wallet esté en la red correcta**
   - Core Wallet debería estar configurado para Avalanche Fuji Testnet
   - Si no, añádela manualmente (ver sección 1)

6. **Si aún no aparece**
   - Core Wallet debería aparecer en la sección "Otros" del modal
   - Si no aparece, puede ser que Core Wallet no esté exponiendo correctamente el provider EIP-1193
   - En ese caso, puedes usar MetaMask temporalmente y luego importar tu cuenta de Core Wallet a MetaMask

