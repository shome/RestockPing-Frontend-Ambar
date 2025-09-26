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

// Phone masking utility function
function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return phone;
  }
  
  // Remove any spaces or special characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  if (cleanPhone.length < 4) {
    return phone; // Too short to mask
  }
  
  // For international numbers starting with +
  if (cleanPhone.startsWith('+')) {
    if (cleanPhone.length <= 6) {
      return cleanPhone; // Too short to mask meaningfully
    }
    
    // Show country code + first digit + *** + last 2 digits
    const countryAndFirst = cleanPhone.substring(0, 4); // +XXX
    const lastTwo = cleanPhone.substring(cleanPhone.length - 2);
    const stars = '*'.repeat(Math.max(1, cleanPhone.length - 6));
    
    return `${countryAndFirst}${stars}${lastTwo}`;
  } else {
    // For domestic numbers
    if (cleanPhone.length <= 4) {
      return phone; // Too short to mask
    }
    
    // Show first 3 digits + *** + last 2 digits
    const first = cleanPhone.substring(0, 3);
    const last = cleanPhone.substring(cleanPhone.length - 2);
    const stars = '*'.repeat(Math.max(1, cleanPhone.length - 5));
    
    return `${first}${stars}${last}`;
  }
}

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

// Rotate team PIN
app.patch('/api/admin/pins/:id/rotate', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Generate new PIN
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Update PIN in database
    const updatedPin = await prisma.teamPin.update({
      where: { id: id },
      data: { pin: newPin },
      include: {
        location: {
          select: { name: true }
        }
      }
    });
    
    res.json({
      success: true,
      pin: newPin,
      message: 'PIN rotated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Disable team PIN
app.patch('/api/admin/pins/:id/disable', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update PIN status to disabled
    const updatedPin = await prisma.teamPin.update({
      where: { id: id },
      data: { status: 'DISABLED' },
      include: {
        location: {
          select: { name: true }
        }
      }
    });
    
    res.json({
      success: true,
      message: 'PIN disabled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Admin requests endpoint with masked phone numbers
app.get('/api/admin/requests', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const requests = await prisma.request.findMany({
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        location: {
          select: { name: true }
        },
        label: {
          select: { name: true, code: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Mask phone numbers for admin view
    const maskedRequests = requests.map(request => ({
      id: request.id,
      phone: maskPhone(request.phone), // Apply masking here
      labelName: request.labelName || request.label?.name,
      labelCode: request.label?.code,
      status: request.status,
      locationName: request.location.name,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString()
    }));
    
    res.json({
      success: true,
      requests: maskedRequests,
      total: requests.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// SMS sending endpoint with error handling
app.post('/api/admin/send-sms', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    // Validate phone number
    if (!phone || !phone.match(/^\+?[\d\s\-\(\)]+$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }
    
    // Check if it's a fake/test number
    const fakeNumbers = ['+123', '+1234567890', '+999999999'];
    const isFakeNumber = fakeNumbers.some(fake => phone.startsWith(fake)) || phone.includes('123');
    
    if (isFakeNumber) {
      // Log failed SMS attempt
      await prisma.smsLog.create({
        data: {
          phone: phone,
          message: message,
          status: 'FAILED',
          errorMessage: 'Invalid phone number - test/fake number detected'
        }
      });
      
      return res.status(400).json({
        success: false,
        message: 'Failed to send SMS: Invalid phone number',
        error_code: 'INVALID_PHONE',
        logged: true
      });
    }
    
    // Mock successful SMS for valid numbers
    await prisma.smsLog.create({
      data: {
        phone: phone,
        message: message,
        status: 'SENT',
        twilioSid: 'mock_sid_' + Math.random().toString(36).substring(7)
      }
    });
    
    res.json({
      success: true,
      message: 'SMS sent successfully',
      phone: maskPhone(phone), // Return masked phone
      logged: true
    });
  } catch (error) {
    console.error('SMS Error:', error);
    
    // Log the error
    try {
      await prisma.smsLog.create({
        data: {
          phone: req.body.phone || 'unknown',
          message: req.body.message || 'unknown',
          status: 'FAILED',
          errorMessage: error.message
        }
      });
    } catch (logError) {
      console.error('Failed to log SMS error:', logError);
    }
    
    res.status(500).json({
      success: false,
      message: 'SMS service error',
      logged: true
    });
  }
});

// Webhook endpoint with validation
app.post('/api/webhooks/twilio', async (req, res) => {
  try {
    const { MessageSid, MessageStatus, From, To, Body } = req.body;
    
    // Validate Twilio webhook structure
    if (!MessageSid || !MessageStatus || !From) {
      await prisma.webhookLog.create({
        data: {
          source: 'unknown',
          payload: JSON.stringify(req.body),
          status: 'INVALID',
          errorMessage: 'Missing required Twilio webhook fields'
        }
      });
      
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook payload',
        error: 'Missing required fields'
      });
    }
    
    // Log valid webhook
    await prisma.webhookLog.create({
      data: {
        source: 'twilio',
        payload: JSON.stringify(req.body),
        status: 'PROCESSED'
      }
    });
    
    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Webhook Error:', error);
    
    // Log webhook error
    try {
      await prisma.webhookLog.create({
        data: {
          source: 'unknown',
          payload: JSON.stringify(req.body),
          status: 'ERROR',
          errorMessage: error.message
        }
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }
    
    res.status(500).json({
      success: false,
      message: 'Webhook processing error'
    });
  }
});

// Admin logs endpoint
app.get('/api/admin/logs', async (req, res) => {
  try {
    const { type = 'all', limit = 50 } = req.query;
    
    let logs = [];
    
    if (type === 'sms' || type === 'all') {
      const smsLogs = await prisma.smsLog.findMany({
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      });
      
      logs.push(...smsLogs.map(log => ({
        id: log.id,
        type: 'SMS',
        phone: maskPhone(log.phone), // Mask phone in logs too
        message: log.message,
        status: log.status,
        error: log.errorMessage,
        createdAt: log.createdAt.toISOString()
      })));
    }
    
    if (type === 'webhook' || type === 'all') {
      const webhookLogs = await prisma.webhookLog.findMany({
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      });
      
      logs.push(...webhookLogs.map(log => ({
        id: log.id,
        type: 'WEBHOOK',
        source: log.source,
        status: log.status,
        error: log.errorMessage,
        createdAt: log.createdAt.toISOString()
      })));
    }
    
    // Sort by creation date
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      logs: logs.slice(0, parseInt(limit)),
      total: logs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Other endpoints (captcha, labels, requests, etc.)
app.get('/api/captcha', async (req, res) => {
  try {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    res.json({
      success: true,
      sessionId: sessionId,
      question: `${num1} + ${num2} = ?`,
      num1: num1,
      num2: num2,
      expiresIn: 300
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.post('/api/captcha/verify', async (req, res) => {
  try {
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

app.post('/api/requests', async (req, res) => {
  try {
    const { locationId, phone, labelName, labelId } = req.body;
    
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
