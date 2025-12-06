# MyScorePass - x402 Setup Guide

## Paso 1: Configurar Thirdweb x402

### 1.1 Instalar Dependencias

```bash
cd frontend
npm install thirdweb @thirdweb-dev/sdk
```

### 1.2 Configurar Variables de Entorno

Crear `.env.local` en `frontend/`:

```env
# Thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=tu_client_id_aqui
THIRDWEB_SECRET_KEY=tu_secret_key_aqui

# Facilitator Wallet (ERC4337 Smart Account)
THIRDWEB_SERVER_WALLET_ADDRESS=0x_facilitator_address_aqui

# Merchant Wallet (quien recibe los pagos)
MERCHANT_WALLET_ADDRESS=0x_merchant_address_aqui

# Network
NEXT_PUBLIC_CHAIN_ID=43113  # Avalanche Fuji Testnet
```

### 1.3 Obtener Credenciales de Thirdweb

1. Ir a https://thirdweb.com/dashboard
2. Conectar wallet
3. Crear nuevo proyecto o usar existente
4. Obtener **Client ID** y **Secret Key**

### 1.4 Configurar Facilitator Wallet (ERC4337)

**IMPORTANTE**: Debes usar ERC4337 Smart Account, NO ERC-7702

1. En Thirdweb Dashboard → **Server Wallets**
2. Activar switch **"Show ERC4337 Smart Account"**
3. Seleccionar red: **Avalanche Fuji Testnet**
4. Copiar la dirección del Smart Account → `THIRDWEB_SERVER_WALLET_ADDRESS`
5. Enviar tokens de testnet a esa dirección (para pagar gas)

### 1.5 Configurar Merchant Wallet

Esta es la wallet que recibirá los pagos (2 USDC por cada score calculado).

Puede ser tu wallet personal o una wallet dedicada.

