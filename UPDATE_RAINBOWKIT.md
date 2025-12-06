# Actualizar RainbowKit para Mejor Soporte de Core Wallet

Si Core Wallet aún no aparece después de los cambios, actualiza las dependencias:

```bash
cd frontend
npm install @rainbow-me/rainbowkit@latest wagmi@latest viem@latest
```

Esto asegurará que tengas la última versión con mejor soporte para EIP-6963 (detección automática de wallets).

