const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'connected' },
        api: { status: 'running' }
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'admin123') {
      res.json({
        success: true,
        token: 'mock-admin-token',
        expires_in: 86400
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Team login
app.post('/api/team/login', async (req, res) => {
  try {
    const { pin, location_id } = req.body;
    
    // Find PIN in database
    const teamPin = await prisma.teamPin.findFirst({
      where: {
        pin: pin,
        locationId: location_id,
        status: 'ACTIVE'
      },
      include: {
        location: true
      }
    });
    
    if (teamPin) {
      res.json({
        success: true,
        session_token: 'mock-team-token',
        expires_in: 86400,
        location: teamPin.location
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid PIN or location'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get locations
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        timezone: true
      }
    });
    
    res.json({
      success: true,
      locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get team PINs (admin only)
app.get('/api/admin/pins', async (req, res) => {
  try {
    const pins = await prisma.teamPin.findMany({
      include: {
        location: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formattedPins = pins.map(pin => ({
      id: pin.id,
      pin: pin.pin,
      location_name: pin.location.name,
      expire_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      active: pin.status === 'ACTIVE',
      created_at: pin.createdAt.toISOString(),
      type: 'team'
    }));
    
    res.json({
      success: true,
      pins: formattedPins,
      total: pins.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create team PIN
app.post('/api/admin/team-pins', async (req, res) => {
  try {
    const { pin, locationId, expireAt } = req.body;
    
    // Check if PIN already exists
    const existingPin = await prisma.teamPin.findFirst({
      where: {
        pin: pin,
        locationId: locationId
      }
    });
    
    if (existingPin) {
      return res.status(409).json({
        success: false,
        message: 'PIN already exists for this location'
      });
    }
    
    const teamPin = await prisma.teamPin.create({
      data: {
        pin: pin,
        locationId: locationId,
        status: 'ACTIVE'
      }
    });
    
    res.json({
      success: true,
      pin_id: teamPin.id,
      pin: teamPin.pin,
      expire_at: expireAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      message: 'Team PIN created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get admin locations
app.get('/api/admin/locations', async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        timezone: true
      }
    });
    
    res.json({
      success: true,
      locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 RestockPing Backend running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🔑 Admin login: admin / admin123`);
  console.log(`📍 Team PIN: 1234 (Paris Office)`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.post('/api/captcha/verify', async (req, res) => {
  try {
    const { captchaSessionId, captchaAnswer } = req.body;
    
    // Simple validation - in real app, store session data
    res.json({
      success: true,
      valid: true,
      message: 'Captcha verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Labels search endpoint
app.get('/api/labels', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    const labels = await prisma.label.findMany({
      where: query ? {
        OR: [
          { name: { contains: query } },
          { synonyms: { contains: query } },
          { code: { contains: query } }
        ]
      } : {},
      take: parseInt(limit),
      include: {
        location: {
          select: { name: true }
        }
      }
    });
    
    const formattedLabels = labels.map(label => ({
      id: label.id,
      location_id: label.locationId,
      code: label.code,
      name: label.name,
      synonyms: label.synonyms,
      active: label.active
    }));
    
    res.json({
      success: true,
      labels: formattedLabels,
      total: labels.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create request endpoint
app.post('/api/requests', async (req, res) => {
  try {
    const { locationId, phone, labelName, labelId } = req.body;
    
    // Create request in database
    const request = await prisma.request.create({
      data: {
        phone: phone,
        labelName: labelName,
        labelId: labelId,
        locationId: locationId,
        status: 'PENDING'
      }
    });
    
    res.json({
      success: true,
      requestId: request.id,
      message: 'Request created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 RestockPing Backend running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🔑 Admin login: admin / admin123`);
  console.log(`📍 Team PIN: 1234 (Paris Office)`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
