const hre = require("hardhat");

async function main() {
  console.log("🚀 Fundeando LendingPool con USDC...");
  
  // Direcciones de los contratos desplegados
  const USDC_ADDRESS = "0x482aAC0Eda23639A4fCd2662E8C67B557e21ef37";
  const LENDING_POOL_ADDRESS = "0x0561eC805C7fbf2392b3353BD5f0920665Ee2b66";
  
  // Admin wallet (debe tener USDC y PAS para gas)
  const [admin] = await hre.ethers.getSigners();
  console.log("👤 Admin wallet:", admin.address);
  
  // Conectar a los contratos
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = MockUSDC.attach(USDC_ADDRESS);
  
  const LendingPoolMini = await hre.ethers.getContractFactory("LendingPoolMini");
  const lendingPool = LendingPoolMini.attach(LENDING_POOL_ADDRESS);
  
  // Verificar balance actual del admin
  const adminBalance = await usdc.balanceOf(admin.address);
  console.log("💰 Balance USDC del admin:", hre.ethers.formatUnits(adminBalance, 6), "USDC");
  
  // Verificar balance actual del LendingPool
  const poolBalance = await usdc.balanceOf(LENDING_POOL_ADDRESS);
  console.log("🏦 Balance USDC del LendingPool:", hre.ethers.formatUnits(poolBalance, 6), "USDC");
  
  // Si el admin no tiene USDC, mintear algunos
  if (adminBalance < hre.ethers.parseUnits("1000", 6)) {
    console.log("🪙 Minteando 10,000 USDC para el admin...");
    const mintTx = await usdc.mint(admin.address, hre.ethers.parseUnits("10000", 6));
    await mintTx.wait();
    console.log("✅ USDC minteados exitosamente");
  }
  
  // Depositar USDC en el LendingPool
  const depositAmount = hre.ethers.parseUnits("5000", 6); // 5,000 USDC
  console.log("💸 Depositando", hre.ethers.formatUnits(depositAmount, 6), "USDC en LendingPool...");
  
  // Aprobar el LendingPool para gastar USDC
  const approveTx = await usdc.approve(LENDING_POOL_ADDRESS, depositAmount);
  await approveTx.wait();
  console.log("✅ Aprobación de USDC completada");
  
  // Depositar en el LendingPool
  const depositTx = await lendingPool.deposit(depositAmount);
  await depositTx.wait();
  console.log("✅ Depósito en LendingPool completado");
  
  // Verificar balance final del LendingPool
  const finalPoolBalance = await usdc.balanceOf(LENDING_POOL_ADDRESS);
  console.log("🏦 Balance final del LendingPool:", hre.ethers.formatUnits(finalPoolBalance, 6), "USDC");
  
  console.log("🎉 ¡LendingPool fundeado exitosamente!");
  console.log("💡 Ahora los usuarios pueden solicitar préstamos hasta", hre.ethers.formatUnits(finalPoolBalance, 6), "USDC");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
