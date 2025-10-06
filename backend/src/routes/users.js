const express = require('express');
const multer = require('multer');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configurar almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/dni');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `dni_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo imágenes permitidas'));
    }
  }
});

// Ruta del archivo de usuarios
const USERS_FILE = path.join(__dirname, '../../data/users.json');

// Leer usuarios
function getUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
    return [];
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

// Guardar usuarios
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

/**
 * POST /api/users/upload-dni
 * Usuario sube su DNI
 */
router.post('/upload-dni', upload.single('dni'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió imagen' });
    }

    const { privyUserId, walletAddress, email } = req.body;
    
    if (!privyUserId || !walletAddress) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const users = getUsers();
    
    // Hashear el DNI para verificar unicidad
    const fileBuffer = fs.readFileSync(req.file.path);
    const dniHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Verificar si ya existe esta wallet
    const existingWallet = users.find(u => u.walletAddress.toLowerCase() === walletAddress.toLowerCase());
    if (existingWallet) {
      return res.status(400).json({ 
        error: 'Esta wallet ya está registrada',
        status: existingWallet.status
      });
    }
    
    // Verificar si ya existe este DNI
    const existingDNI = users.find(u => u.dniHash === dniHash);
    if (existingDNI) {
      return res.status(400).json({ 
        error: 'Este DNI ya está registrado con otra wallet',
        existingWallet: existingDNI.walletAddress
      });
    }

    // Crear nuevo usuario
    const newUser = {
      id: users.length + 1,
      privyUserId,
      walletAddress,
      email,
      dniImageUrl: `/uploads/dni/${req.file.filename}`,
      dniHash, // Hash único del DNI
      status: 'pending',
      verificationLevel: 0,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    res.json({
      success: true,
      status: 'pending',
      message: 'DNI subido correctamente. Esperando aprobación del administrador.',
      user: newUser
    });

  } catch (error) {
    console.error('Error uploading DNI:', error);
    res.status(500).json({ error: 'Error al subir DNI' });
  }
});

/**
 * GET /api/users/status/:walletAddress
 * Obtener estado de usuario
 */
router.get('/status/:walletAddress', (req, res) => {
  try {
    const { walletAddress } = req.params;
    const users = getUsers();
    
    const user = users.find(u => u.walletAddress.toLowerCase() === walletAddress.toLowerCase());
    
    if (!user) {
      return res.json({
        exists: false,
        status: 'not_registered'
      });
    }

    res.json({
      exists: true,
      status: user.status,
      verificationLevel: user.verificationLevel,
      email: user.email,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: 'Error al obtener estado' });
  }
});

/**
 * GET /api/users/pending
 * Obtener usuarios pendientes (solo admin)
 */
router.get('/pending', (req, res) => {
  try {
    // TODO: Verificar que quien llama sea admin (0x6cef...)
    const adminAddress = '0x6ceffA0beE387C7c58bAb3C81e17D32223E68718';
    
    const users = getUsers();
    const pending = users.filter(u => u.status === 'pending');

    res.json({
      success: true,
      pending,
      count: pending.length
    });

  } catch (error) {
    console.error('Error getting pending users:', error);
    res.status(500).json({ error: 'Error al obtener pendientes' });
  }
});

/**
 * POST /api/users/approve
 * Aprobar o rechazar usuario (solo admin)
 */
router.post('/approve', async (req, res) => {
  try {
    const { userId, approved, verificationLevel, adminAddress } = req.body;
    
    // Verificar admin
    if (adminAddress.toLowerCase() !== '0x6ceffA0beE387C7c58bAb3C81e17D32223E68718'.toLowerCase()) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar estado
    users[userIndex].status = approved ? 'approved' : 'rejected';
    users[userIndex].verificationLevel = approved ? verificationLevel : 0;
    users[userIndex].approvedAt = new Date().toISOString();
    users[userIndex].approvedBy = adminAddress;

    saveUsers(users);

    res.json({
      success: true,
      message: approved ? 'Usuario aprobado' : 'Usuario rechazado',
      user: users[userIndex]
    });

  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Error al aprobar usuario' });
  }
});

// Ruta para verificar estado del usuario
router.get('/status/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  const users = getUsers();
  
  const user = users.find(u => u.walletAddress.toLowerCase() === walletAddress.toLowerCase());
  
  if (!user) {
    return res.json({ status: 'not_found' });
  }
  
  res.json({ 
    status: user.status,
    verificationLevel: user.verificationLevel,
    createdAt: user.createdAt
  });
});

module.exports = router;
