const express = require('express');
const multer = require('multer');
const router = express.Router();
const { uploadToIPFS } = require('../services/ipfsService');

// Configurar multer para almacenamiento en memoria
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

/**
 * POST /api/documents/upload
 * Subir documento a IPFS y retornar hash
 */
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { walletAddress, documentType } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Subir a IPFS (o almacenamiento simulado para testing)
    const ipfsHash = await uploadToIPFS(req.file, { walletAddress, documentType });

    res.json({
      success: true,
      ipfsHash,
      fileName: req.file.originalname,
      documentType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

/**
 * GET /api/documents/:hash
 * Obtener información de un documento
 */
router.get('/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    // En producción, recuperar de IPFS
    // Por ahora, retornar metadata simulada
    
    res.json({
      success: true,
      hash,
      available: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

module.exports = router;


