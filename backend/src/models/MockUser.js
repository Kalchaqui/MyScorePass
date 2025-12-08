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
    console.error('⚠️  Archivo mockUsers.json no encontrado en:', MOCK_USERS_FILE);
    return [];
  }
  try {
    const data = fs.readFileSync(MOCK_USERS_FILE, 'utf8');
    const users = JSON.parse(data);
    console.log('✅ Usuarios cargados desde archivo:', users.length);
    return users;
  } catch (error) {
    console.error('❌ Error leyendo mockUsers.json:', error.message);
    return [];
  }
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
  console.log('Total usuarios cargados:', users.length);
  console.log('Filtros recibidos en search():', JSON.stringify(filters));
  
  if (users.length === 0) {
    console.error('⚠️  No se encontraron usuarios en el archivo JSON');
    return [];
  }

  // Filtrar por score mínimo (solo si se especifica)
  if (filters.minScore !== null && filters.minScore !== undefined && filters.minScore !== '') {
    const beforeFilter = users.length;
    users = users.filter(u => u.score >= parseInt(filters.minScore));
    console.log(`Filtro minScore (${filters.minScore}): ${beforeFilter} -> ${users.length} usuarios`);
  } else {
    console.log('minScore no aplicado (valor:', filters.minScore, ')');
  }

  // Filtrar por score máximo (solo si se especifica)
  if (filters.maxScore !== null && filters.maxScore !== undefined && filters.maxScore !== '') {
    const beforeFilter = users.length;
    users = users.filter(u => u.score <= parseInt(filters.maxScore));
    console.log(`Filtro maxScore (${filters.maxScore}): ${beforeFilter} -> ${users.length} usuarios`);
  } else {
    console.log('maxScore no aplicado (valor:', filters.maxScore, ')');
  }

  // Filtrar por nivel de verificación (solo si se especifica)
  if (filters.verificationLevel !== null && filters.verificationLevel !== undefined && filters.verificationLevel !== '') {
    const beforeFilter = users.length;
    users = users.filter(u => u.identity.verificationLevel === parseInt(filters.verificationLevel));
    console.log(`Filtro verificationLevel (${filters.verificationLevel}): ${beforeFilter} -> ${users.length} usuarios`);
  } else {
    console.log('verificationLevel no aplicado (valor:', filters.verificationLevel, ')');
  }

  // Buscar por nombre (aplicar siempre que se especifique)
  console.log('Antes de filtrar por nombre, usuarios restantes:', users.length);
  if (filters.name && filters.name.trim() !== '') {
    const nameLower = filters.name.toLowerCase().trim();
    console.log('Buscando nombre:', nameLower);
    console.log('Tipo de filters.name:', typeof filters.name);
    console.log('Valor de filters.name:', filters.name);
    const beforeFilter = users.length;
    
    // Mostrar algunos nombres de ejemplo para debug
    if (users.length > 0) {
      console.log('Primeros 3 nombres de usuarios disponibles:', users.slice(0, 3).map(u => u.identity.name));
    }
    
    users = users.filter(u => {
      const userName = u.identity.name.toLowerCase();
      const matches = userName.includes(nameLower);
      if (matches) {
        console.log('Usuario encontrado:', u.identity.name, 'ID:', u.id);
      }
      return matches;
    });
    console.log(`Filtro por nombre: ${beforeFilter} -> ${users.length} usuarios`);
  } else {
    console.log('Nombre no especificado o vacío. filters.name:', filters.name);
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
