/**
 * Script para generar 100 usuarios mockeados
 * Ejecutar: node src/scripts/seedMockUsers.js
 */

const MockUser = require('../models/MockUser');
const { ethers } = require('ethers');

// Nombres y apellidos para generar datos realistas
const firstNames = [
  'Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Carmen',
  'José', 'Isabel', 'Miguel', 'Patricia', 'Francisco', 'Lucía', 'Antonio', 'Sofía',
  'Manuel', 'Elena', 'David', 'Marta', 'Javier', 'Cristina', 'Daniel', 'Paula',
  'Alejandro', 'Andrea', 'Roberto', 'Natalia', 'Fernando', 'Claudia', 'Ricardo', 'Diana',
  'Sergio', 'Valentina', 'Andrés', 'Camila', 'Diego', 'Gabriela', 'Raúl', 'Mariana',
  'Eduardo', 'Alejandra', 'Gustavo', 'Daniela', 'Héctor', 'Fernanda', 'Óscar', 'Jimena',
  'Rodrigo', 'Valeria', 'Sebastián', 'Regina', 'Emilio', 'Ximena', 'Felipe', 'Renata',
];

const lastNames = [
  'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez',
  'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez',
  'Muñoz', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres', 'Domínguez', 'Vázquez',
  'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez', 'Molina', 'Morales',
  'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Iglesias',
  'Nuñez', 'Medina', 'Garrido', 'Cortés', 'Castillo', 'Lozano', 'Guerrero', 'Cano',
  'Prieto', 'Méndez', 'Calvo', 'Cruz', 'Gallego', 'Vidal', 'León', 'Márquez',
];

const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];

/**
 * Generar wallet address aleatorio
 */
function generateWalletAddress() {
  const randomBytes = ethers.randomBytes(20);
  return ethers.getAddress(ethers.hexlify(randomBytes));
}

/**
 * Generar DNI argentino (formato: XX.XXX.XXX)
 */
function generateDNI() {
  const part1 = Math.floor(Math.random() * 99).toString().padStart(2, '0');
  const part2 = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `${part1}.${part2.substring(0, 3)}.${part2.substring(3)}`;
}

/**
 * Generar email basado en nombre
 */
function generateEmail(firstName, lastName) {
  const base = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const number = Math.floor(Math.random() * 100);
  return `${base}${number}@${domain}`;
}

/**
 * Generar score crediticio (300-1000)
 */
function generateScore() {
  // Distribución: más usuarios con scores medios-altos
  const rand = Math.random();
  if (rand < 0.2) {
    // 20% scores bajos (300-500)
    return Math.floor(Math.random() * 200) + 300;
  } else if (rand < 0.6) {
    // 40% scores medios (500-750)
    return Math.floor(Math.random() * 250) + 500;
  } else {
    // 40% scores altos (750-1000)
    return Math.floor(Math.random() * 250) + 750;
  }
}

/**
 * Generar nivel de verificación (0-3)
 */
function generateVerificationLevel() {
  const rand = Math.random();
  if (rand < 0.1) return 0; // 10% no verificados
  if (rand < 0.3) return 1; // 20% nivel 1
  if (rand < 0.7) return 2; // 40% nivel 2
  return 3; // 30% nivel 3
}

/**
 * Generar un usuario mockeado
 */
function generateMockUser(id) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const score = generateScore();
  const verificationLevel = generateVerificationLevel();

  return {
    id,
    walletAddress: generateWalletAddress(),
    score,
    identity: {
      name: `${firstName} ${lastName}`,
      dni: generateDNI(),
      email: generateEmail(firstName, lastName),
      verificationLevel,
    },
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(), // Último año
  };
}

/**
 * Generar 100 usuarios mockeados
 */
function seedMockUsers() {
  console.log('🌱 Generando 100 usuarios mockeados...\n');

  const users = [];
  for (let i = 1; i <= 100; i++) {
    users.push(generateMockUser(i));
  }

  // Guardar usuarios
  MockUser.saveMockUsers(users);

  console.log('✅ 100 usuarios mockeados generados exitosamente!\n');
  console.log('📊 Estadísticas:');
  console.log(`   Total usuarios: ${users.length}`);
  console.log(`   Score promedio: ${Math.round(users.reduce((sum, u) => sum + u.score, 0) / users.length)}`);
  console.log(`   Score mínimo: ${Math.min(...users.map(u => u.score))}`);
  console.log(`   Score máximo: ${Math.max(...users.map(u => u.score))}`);
  console.log(`   Verificación nivel 0: ${users.filter(u => u.identity.verificationLevel === 0).length}`);
  console.log(`   Verificación nivel 1: ${users.filter(u => u.identity.verificationLevel === 1).length}`);
  console.log(`   Verificación nivel 2: ${users.filter(u => u.identity.verificationLevel === 2).length}`);
  console.log(`   Verificación nivel 3: ${users.filter(u => u.identity.verificationLevel === 3).length}`);
  console.log('\n💾 Usuarios guardados en: backend/data/mockUsers.json');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedMockUsers();
}

module.exports = { seedMockUsers, generateMockUser };
