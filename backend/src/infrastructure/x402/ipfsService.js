const crypto = require('crypto');

/**
 * Servicio simulado de IPFS para testing
 * En producción, usar Pinata, Infura IPFS, o nodo IPFS propio
 */

// Almacenamiento temporal en memoria (solo para desarrollo)
const storage = new Map();

/**
 * Simular upload a IPFS
 * @param {Object} file - Archivo de multer
 * @param {Object} metadata - Metadata adicional
 * @returns {String} IPFS hash simulado
 */
async function uploadToIPFS(file, metadata) {
  // Generar hash simulado tipo IPFS
  const hash = `Qm${crypto.randomBytes(23).toString('hex')}`;
  
  // Almacenar en memoria (en producción, subir a IPFS real)
  storage.set(hash, {
    buffer: file.buffer,
    mimetype: file.mimetype,
    originalname: file.originalname,
    size: file.size,
    metadata,
    timestamp: new Date().toISOString()
  });

  console.log(`📦 File uploaded to simulated IPFS: ${hash}`);
  
  return hash;
}

/**
 * Obtener archivo de IPFS
 * @param {String} hash - IPFS hash
 * @returns {Object} File data
 */
async function getFromIPFS(hash) {
  const data = storage.get(hash);
  
  if (!data) {
    throw new Error('File not found');
  }
  
  return data;
}

/**
 * Verificar si un hash existe
 * @param {String} hash - IPFS hash
 * @returns {Boolean}
 */
function exists(hash) {
  return storage.has(hash);
}

module.exports = {
  uploadToIPFS,
  getFromIPFS,
  exists
};

// Para producción con Pinata:
/*
const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

async function uploadToIPFS(file, metadata) {
  const options = {
    pinataMetadata: {
      name: file.originalname,
      keyvalues: metadata
    }
  };
  
  const result = await pinata.pinFileToIPFS(file.buffer, options);
  return result.IpfsHash;
}
*/


