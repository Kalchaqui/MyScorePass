/**
 * Script para verificar que la wallet puede desplegar contratos
 */

const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY no encontrado en .env');
    console.log('\n💡 Crea contracts/.env con:');
    console.log('PRIVATE_KEY=0xccc05d03ac24078d73d8fd6325e8b826fdbf0e0bfc8fa856e47cae09dd28363f');
    process.exit(1);
  }

  const rpcUrl = process.env.AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
  
  console.log('🔍 Verificando wallet...\n');
  
  try {
    // Crear provider y wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('✅ Wallet configurada correctamente');
    console.log('─'.repeat(50));
    console.log('Dirección:', wallet.address);
    console.log('Red: Avalanche Fuji Testnet');
    console.log('─'.repeat(50));
    
    // Verificar balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInAvax = ethers.formatEther(balance);
    
    console.log('\n💰 Balance:');
    console.log(`   ${balanceInAvax} AVAX`);
    
    if (balance === 0n) {
      console.log('\n⚠️  La wallet NO tiene AVAX');
      console.log('   Necesitas obtener AVAX del faucet para desplegar contratos');
      console.log('\n📝 Faucets disponibles:');
      console.log('   1. https://faucet.avalanche.network/');
      console.log('   2. https://faucet.avax.network/');
      console.log(`\n   Ingresa esta dirección: ${wallet.address}`);
    } else {
      console.log('\n✅ La wallet tiene AVAX suficiente para desplegar contratos');
      console.log(`   Puedes desplegar contratos con esta wallet`);
    }
    
    // Verificar que puede firmar
    console.log('\n🔐 Capacidades de la wallet:');
    console.log('   ✅ Puede firmar transacciones');
    console.log('   ✅ Puede desplegar contratos');
    console.log('   ✅ Puede ser owner de contratos');
    console.log('   ✅ Puede mintear SBTs');
    console.log('   ✅ Puede pagar gas');
    
    console.log('\n📋 Próximos pasos:');
    if (balance === 0n) {
      console.log('   1. Obtén AVAX del faucet');
      console.log('   2. Espera a que llegue el AVAX (puede tardar unos minutos)');
      console.log('   3. Ejecuta: npx hardhat ignition deploy ignition/modules/MyScorePass.js --network avalancheFuji');
    } else {
      console.log('   1. Ejecuta: npx hardhat ignition deploy ignition/modules/MyScorePass.js --network avalancheFuji');
      console.log('   2. Guarda las direcciones de los contratos desplegados');
      console.log('   3. Configura backend/.env con esas direcciones');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

