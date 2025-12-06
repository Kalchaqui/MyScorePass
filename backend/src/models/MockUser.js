/**
 * MockUser Model
 * Representa un usuario mockeado en la base de datos
 */

const fs = require('fs');
const path = require('path');

const MOCK_USERS_FILE = path.join(__dirname, '../../data/mockUsers.json');

/**
 * Obtener todos los usuarios mockeados
 */
function getAllMockUsers() {
  if (!fs.existsSync(MOCK_USERS_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(MOCK_USERS_FILE, 'utf8'));
}

/**
 * Guardar usuarios mockeados
 */
function saveMockUsers(users) {
  fs.mkdirSync(path.dirname(MOCK_USERS_FILE), { recursive: true });
  fs.writeFileSync(MOCK_USERS_FILE, JSON.stringify(users, null, 2));
}

/**
 * Buscar usuario por ID
 */
function findById(id) {
  const users = getAllMockUsers();
  return users.find(u => u.id === parseInt(id));
}

/**
 * Buscar usuario por wallet address
 */
function findByWalletAddress(walletAddress) {
  const users = getAllMockUsers();
  return users.find(u => u.walletAddress.toLowerCase() === walletAddress.toLowerCase());
}

/**
 * Obtener usuarios con paginación
 */
function getPaginated(page = 1, limit = 20) {
  const users = getAllMockUsers();
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    users: users.slice(start, end),
    total: users.length,
    page,
    limit,
    totalPages: Math.ceil(users.length / limit),
  };
}

/**
 * Buscar usuarios por filtros
 */
function search(filters = {}) {
  let users = getAllMockUsers();

  // Filtrar por score mínimo
  if (filters.minScore) {
    users = users.filter(u => u.score >= parseInt(filters.minScore));
  }

  // Filtrar por score máximo
  if (filters.maxScore) {
    users = users.filter(u => u.score <= parseInt(filters.maxScore));
  }

  // Filtrar por nivel de verificación
  if (filters.verificationLevel !== undefined) {
    users = users.filter(u => u.identity.verificationLevel === parseInt(filters.verificationLevel));
  }

  // Buscar por nombre
  if (filters.name) {
    const nameLower = filters.name.toLowerCase();
    users = users.filter(u => 
      u.identity.name.toLowerCase().includes(nameLower)
    );
  }

  return users;
}

module.exports = {
  getAllMockUsers,
  findById,
  findByWalletAddress,
  getPaginated,
  search,
  saveMockUsers,
};
