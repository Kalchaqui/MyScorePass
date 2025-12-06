const hre = require("hardhat");

async function main() {
  console.log("🚀 Desplegando contratos de MyScorePass en", hre.network.name);
  console.log("=".repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Desplegando con la cuenta:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));
  console.log("");

  // 1. Desplegar IdentityRegistry
  console.log("1️⃣  Desplegando IdentityRegistry...");
  const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  const identityRegistryAddress = await identityRegistry.getAddress();
  console.log("✅ IdentityRegistry desplegado en:", identityRegistryAddress);
  console.log("");

  // 2. Desplegar CreditScoringMini
  console.log("2️⃣  Desplegando CreditScoringMini...");
  const CreditScoringMini = await hre.ethers.getContractFactory("CreditScoringMini");
  const creditScoring = await CreditScoringMini.deploy();
  await creditScoring.waitForDeployment();
  const creditScoringAddress = await creditScoring.getAddress();
  console.log("✅ CreditScoringMini desplegado en:", creditScoringAddress);
  console.log("");

  // 3. Desplegar MyScorePassSBT
  console.log("3️⃣  Desplegando MyScorePassSBT...");
  const MyScorePassSBT = await hre.ethers.getContractFactory("MyScorePassSBT");
  const scorePassSBT = await MyScorePassSBT.deploy();
  await scorePassSBT.waitForDeployment();
  const scorePassSBTAddress = await scorePassSBT.getAddress();
  console.log("✅ MyScorePassSBT desplegado en:", scorePassSBTAddress);
  console.log("");

  // Resumen
  console.log("=".repeat(60));
  console.log("🎉 ¡Deployment completado exitosamente!");
  console.log("=".repeat(60));
  console.log("");
  console.log("📋 DIRECCIONES DE LOS CONTRATOS:");
  console.log("━".repeat(60));
  console.log("IdentityRegistry:  ", identityRegistryAddress);
  console.log("CreditScoringMini: ", creditScoringAddress);
  console.log("MyScorePassSBT:    ", scorePassSBTAddress);
  console.log("━".repeat(60));
  console.log("");
  console.log("💡 Próximos pasos:");
  console.log("1. Guardar estas direcciones en backend/.env y frontend/.env.local");
  console.log("2. Configurar MERCHANT_WALLET_ADDRESS (puede ser la misma que deployer)");
  console.log("3. Reiniciar backend para que cargue las direcciones");
  console.log("4. Probar endpoints x402 en /test");
  console.log("");

  // Guardar direcciones en un archivo JSON
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      identityRegistry: identityRegistryAddress,
      creditScoring: creditScoringAddress,
      scorePassSBT: scorePassSBTAddress,
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
