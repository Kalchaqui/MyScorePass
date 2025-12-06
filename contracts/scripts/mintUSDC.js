/**
 * Script para mintear USDC de prueba en Avalanche Fuji
 * 
 * NOTA: Este script solo funciona si tienes acceso al contrato USDC
 * o si el contrato tiene una función pública de mint para testnet.
 * 
 * Para la mayoría de casos, es mejor usar un DEX para intercambiar AVAX por USDC.
 */

const { ethers } = require("hardhat");

// Contrato USDC en Fuji Testnet
const USDC_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65";

// Tu dirección
const RECIPIENT = "0xcdd9d07826002987a5f8359c2ff6f6bb49a51a5b";

// ABI mínimo del contrato USDC (solo funciones que necesitamos)
const USDC_ABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

async function main() {
  console.log("🔵 Minting USDC en Avalanche Fuji...\n");

  const [signer] = await ethers.getSigners();
  console.log("📝 Usando cuenta:", signer.address);
  console.log("🎯 Recipiente:", RECIPIENT);
  console.log("");

  // Conectar al contrato USDC
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

  try {
    // Verificar balance actual
    const decimals = await usdc.decimals();
    const currentBalance = await usdc.balanceOf(RECIPIENT);
    console.log("💰 Balance actual:", ethers.formatUnits(currentBalance, decimals), "USDC");

    // Intentar mintear 1000 USDC (1000 * 10^6 porque USDC tiene 6 decimals)
    const amount = ethers.parseUnits("1000", decimals);
    console.log("\n🔄 Intentando mintear 1000 USDC...");

    // NOTA: Esto probablemente fallará porque el contrato USDC real
    // no tiene una función mint pública. Este script es solo para referencia.
    const tx = await usdc.mint(RECIPIENT, amount);
    console.log("⏳ Transacción enviada:", tx.hash);

    await tx.wait();
    console.log("✅ Transacción confirmada!");

    // Verificar nuevo balance
    const newBalance = await usdc.balanceOf(RECIPIENT);
    console.log("💰 Nuevo balance:", ethers.formatUnits(newBalance, decimals), "USDC");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n💡 Sugerencia: El contrato USDC probablemente no tiene mint público.");
    console.log("   Usa un DEX (TraderJoe o Pangolin) para intercambiar AVAX por USDC.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

