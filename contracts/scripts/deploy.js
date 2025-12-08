const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying MyScorePass contracts to", hre.network.name);
  console.log("=".repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));
  console.log("");

  // 1. Deploy IdentityRegistry
  console.log("1️⃣  Deploying IdentityRegistry...");
  const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  const identityRegistryAddress = await identityRegistry.getAddress();
  console.log("✅ IdentityRegistry deployed at:", identityRegistryAddress);
  console.log("");

  // 2. Deploy CreditScoringMini
  console.log("2️⃣  Deploying CreditScoringMini...");
  const CreditScoringMini = await hre.ethers.getContractFactory("CreditScoringMini");
  const creditScoring = await CreditScoringMini.deploy();
  await creditScoring.waitForDeployment();
  const creditScoringAddress = await creditScoring.getAddress();
  console.log("✅ CreditScoringMini deployed at:", creditScoringAddress);
  console.log("");

  // 3. Deploy MyScorePassSBT
  console.log("3️⃣  Deploying MyScorePassSBT...");
  const MyScorePassSBT = await hre.ethers.getContractFactory("MyScorePassSBT");
  const scorePassSBT = await MyScorePassSBT.deploy();
  await scorePassSBT.waitForDeployment();
  const scorePassSBTAddress = await scorePassSBT.getAddress();
  console.log("✅ MyScorePassSBT deployed at:", scorePassSBTAddress);
  console.log("");

  // Summary
  console.log("=".repeat(60));
  console.log("🎉 Deployment completed successfully!");
  console.log("=".repeat(60));
  console.log("");
  console.log("📋 CONTRACT ADDRESSES:");
  console.log("━".repeat(60));
  console.log("IdentityRegistry:  ", identityRegistryAddress);
  console.log("CreditScoringMini: ", creditScoringAddress);
  console.log("MyScorePassSBT:    ", scorePassSBTAddress);
  console.log("━".repeat(60));
  console.log("");
  console.log("💡 Next steps:");
  console.log("1. Save these addresses in backend/.env and frontend/.env.local");
  console.log("2. Configure MERCHANT_WALLET_ADDRESS (can be the same as deployer)");
  console.log("3. Restart backend to load the addresses");
  console.log("4. Test x402 endpoints in /test");
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
