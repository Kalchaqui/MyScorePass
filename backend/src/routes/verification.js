const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');

/**
 * POST /api/verification/request
 * Solicitar verificación de identidad
 */
router.post('/request', async (req, res) => {
  try {
    const { walletAddress, documents, personalInfo } = req.body;

    if (!walletAddress || !documents || documents.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Simular proceso de verificación
    // En producción, aquí se integraría con servicios de verificación de identidad
    // como Veriff, Onfido, o servicios de KYC

    const verificationLevel = calculateVerificationLevel(documents, personalInfo);

    res.json({
      success: true,
      walletAddress,
      verificationLevel,
      status: 'pending',
      estimatedTime: '24-48 hours',
      message: 'Verification request submitted successfully'
    });

  } catch (error) {
    console.error('Error requesting verification:', error);
    res.status(500).json({ error: 'Failed to request verification' });
  }
});

/**
 * GET /api/verification/status/:address
 * Obtener estado de verificación
 */
router.get('/status/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid address' });
    }

    // En producción, consultar base de datos
    res.json({
      success: true,
      address,
      status: 'verified',
      verificationLevel: 2,
      verifiedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({ error: 'Failed to fetch verification status' });
  }
});

/**
 * POST /api/verification/approve
 * Aprobar verificación (llamado por administrador/oráculo)
 */
router.post('/approve', async (req, res) => {
  try {
    const { walletAddress, verificationLevel, adminKey } = req.body;

    // Verificar clave de administrador
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid address' });
    }

    // En producción, aquí se llamaría al smart contract para verificar on-chain
    // usando un wallet de oráculo autorizado

    res.json({
      success: true,
      walletAddress,
      verificationLevel,
      status: 'approved',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error approving verification:', error);
    res.status(500).json({ error: 'Failed to approve verification' });
  }
});

/**
 * Calcular nivel de verificación basado en documentos
 */
function calculateVerificationLevel(documents, personalInfo) {
  let level = 0;

  // Nivel 1: DNI/Pasaporte
  if (documents.some(d => d.type === 'dni' || d.type === 'passport')) {
    level = 1;
  }

  // Nivel 2: DNI + comprobante de domicilio o recibo de sueldo
  if (level === 1 && documents.some(d => d.type === 'proof_of_address' || d.type === 'income_proof')) {
    level = 2;
  }

  // Nivel 3: DNI + comprobante de domicilio + recibo de sueldo + extracto bancario
  if (level === 2 && documents.length >= 3 && documents.some(d => d.type === 'bank_statement')) {
    level = 3;
  }

  return level;
}

module.exports = router;


