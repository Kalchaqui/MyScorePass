const hre = require("hardhat");

async function main() {
  console.log("🔍 Verificando balance de USDC...");
  
  // Direcciones
  const USDC_ADDRESS = "0x482aAC0Eda23639A4fCd2662E8C67B557e21ef37";
  const USER_ADDRESS = "0xeD3a337939f72AFC95f94810dBd95dF95D9C18c2";
  const LENDING_POOL_ADDRESS = "0x0561eC805C7fbf2392b3353BD5f0920665Ee2b66";
  
  // Conectar a MockUSDC
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = MockUSDC.attach(USDC_ADDRESS);
  
  console.log("👤 Verificando balance del usuario:", USER_ADDRESS);
  
  // Verificar balance del usuario
  const userBalance = await usdc.balanceOf(USER_ADDRESS);
  console.log("💰 Balance USDC del usuario:", hre.ethers.formatUnits(userBalance, 6), "USDC");
  
  // Verificar balance del LendingPool
  const poolBalance = await usdc.balanceOf(LENDING_POOL_ADDRESS);
  console.log("🏦 Balance USDC del LendingPool:", hre.ethers.formatUnits(poolBalance, 6), "USDC");
  
  // Verificar si el usuario tiene USDC
  if (userBalance > 0) {
    console.log("✅ ¡El usuario SÍ tiene USDC!");
    console.log("💡 Si no lo ves en MetaMask, intenta:");
    console.log("   1. Refrescar la página de MetaMask");
    console.log("   2. Cerrar y abrir MetaMask");
    console.log("   3. Verificar que el token USDC esté importado");
  } else {
    console.log("❌ El usuario NO tiene USDC");
    console.log("💡 Posibles causas:");
    console.log("   1. La transacción de préstamo falló");
    console.log("   2. El LendingPool no tiene fondos suficientes");
    console.log("   3. Error en el contrato");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
