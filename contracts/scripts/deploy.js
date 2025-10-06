const hre = require("hardhat");

async function main() {
  console.log("🚀 Desplegando contratos de DeFiCred en", hre.network.name);
  console.log("=".repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Desplegando con la cuenta:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));
  console.log("");

  // 1. Desplegar MockUSDC (para testnet)
  console.log("1️⃣  Desplegando MockUSDC...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ MockUSDC desplegado en:", usdcAddress);
  console.log("");

  // 2. Desplegar IdentityRegistry
  console.log("2️⃣  Desplegando IdentityRegistry...");
  const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  const identityRegistryAddress = await identityRegistry.getAddress();
  console.log("✅ IdentityRegistry desplegado en:", identityRegistryAddress);
  console.log("");

  // 3. Desplegar CreditScoring
  console.log("3️⃣  Desplegando CreditScoring...");
  const CreditScoring = await hre.ethers.getContractFactory("CreditScoring");
  const creditScoring = await CreditScoring.deploy(identityRegistryAddress);
  await creditScoring.waitForDeployment();
  const creditScoringAddress = await creditScoring.getAddress();
  console.log("✅ CreditScoring desplegado en:", creditScoringAddress);
  console.log("");

  // 4. Desplegar LendingPool
  console.log("4️⃣  Desplegando LendingPool...");
  const LendingPool = await hre.ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(usdcAddress);
  await lendingPool.waitForDeployment();
  const lendingPoolAddress = await lendingPool.getAddress();
  console.log("✅ LendingPool desplegado en:", lendingPoolAddress);
  console.log("");

  // 5. Desplegar InsurancePool (Fondo de Seguros)
  console.log("5️⃣  Desplegando InsurancePool (Fondo de Seguros)...");
  const InsurancePool = await hre.ethers.getContractFactory("InsurancePool");
  const insurancePool = await InsurancePool.deploy(usdcAddress);
  await insurancePool.waitForDeployment();
  const insurancePoolAddress = await insurancePool.getAddress();
  console.log("✅ InsurancePool desplegado en:", insurancePoolAddress);
  console.log("");

  // 6. Desplegar LoanManager
  console.log("6️⃣  Desplegando LoanManager...");
  const LoanManager = await hre.ethers.getContractFactory("LoanManager");
  const loanManager = await LoanManager.deploy(
    creditScoringAddress,
    lendingPoolAddress,
    insurancePoolAddress,
    usdcAddress
  );
  await loanManager.waitForDeployment();
  const loanManagerAddress = await loanManager.getAddress();
  console.log("✅ LoanManager desplegado en:", loanManagerAddress);
  console.log("");

  // 7. Configurar permisos
  console.log("7️⃣  Configurando permisos...");
  
  // Dar permisos a LoanManager para modificar scores
  await creditScoring.transferOwnership(loanManagerAddress);
  console.log("✅ CreditScoring ownership transferido a LoanManager");
  
  // Configurar LoanManager en LendingPool
  await lendingPool.setLoanManager(loanManagerAddress);
  console.log("✅ LoanManager configurado en LendingPool");
  
  // Configurar LoanManager en InsurancePool
  await insurancePool.setLoanManager(loanManagerAddress);
  console.log("✅ LoanManager configurado en InsurancePool");
  console.log("");

  // 8. Mint tokens iniciales para testing
  console.log("8️⃣  Minteando tokens de prueba...");
  const initialMint = hre.ethers.parseUnits("10000", 6); // 10,000 USDC
  await usdc.mint(deployer.address, initialMint);
  console.log("✅ Minteados 10,000 USDC para el deployer");
  console.log("");

  // Resumen
  console.log("=".repeat(60));
  console.log("🎉 ¡Deployment completado exitosamente!");
  console.log("=".repeat(60));
  console.log("");
  console.log("📋 DIRECCIONES DE LOS CONTRATOS:");
  console.log("━".repeat(60));
  console.log("MockUSDC:          ", usdcAddress);
  console.log("IdentityRegistry:  ", identityRegistryAddress);
  console.log("CreditScoring:     ", creditScoringAddress);
  console.log("LendingPool:       ", lendingPoolAddress);
  console.log("InsurancePool:     ", insurancePoolAddress);
  console.log("LoanManager:       ", loanManagerAddress);
  console.log("━".repeat(60));
  console.log("");
  console.log("💡 Próximos pasos:");
  console.log("1. Guardar estas direcciones en tu archivo .env del frontend");
  console.log("2. Depositar USDC en el LendingPool para habilitar préstamos");
  console.log("3. Crear identidades de usuario y calcular scores");
  console.log("");

  // Guardar direcciones en un archivo JSON
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      mockUSDC: usdcAddress,
      identityRegistry: identityRegistryAddress,
      creditScoring: creditScoringAddress,
      lendingPool: lendingPoolAddress,
      insurancePool: insurancePoolAddress,
      loanManager: loanManagerAddress
    }
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("✅ Información de deployment guardada en deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


