import express from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../server';
import { authenticateTeam, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { SmsService } from '../services/smsService';
import { PinStatus } from '@prisma/client';

const router = express.Router();

// Team login with PIN validation
const teamLoginSchema = z.object({
  pin: z.string().length(4).regex(/^\d{4}$/),
  location_id: z.string().min(1),
});

router.post('/login', async (req, res, next) => {
  try {
    const { pin, location_id } = teamLoginSchema.parse(req.body);

    // Find active PIN for the location
    const teamPin = await prisma.teamPin.findFirst({
      where: {
        pin,
        locationId: location_id,
        status: PinStatus.ACTIVE,
      },
      include: {
        location: {
          select: { id: true, name: true, slug: true, timezone: true }
        }
      }
    });

    if (!teamPin) {
      logger.warn('Team login failed - invalid PIN or location', {
        pin: pin.replace(/./g, '*'), // Mask PIN in logs
        locationId: location_id,
        ip: req.ip,
      });
      
      throw createError('Invalid PIN or location', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: teamPin.id,
        type: 'team',
        locationId: location_id,
        locationName: teamPin.location.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info('Team login successful', {
      pinId: teamPin.id,
      locationId: location_id,
      locationName: teamPin.location.name,
      ip: req.ip,
    });

    res.json({
      success: true,
      session_token: token,
      expires_in: 24 * 60 * 60, // 24 hours in seconds
      location: teamPin.location,
    });
  } catch (error) {
    next(error);
  }
});

// Get team dashboard data
router.get('/dashboard', authenticateTeam, async (req: AuthRequest, res, next) => {
  try {
    const locationId = req.user?.locationId;
    
    if (!locationId) {
      throw createError('Location not found in token', 400);
    }

    // Get dashboard metrics for the location
    const [totalLabels, pendingRequests, recentRequests] = await Promise.all([
      prisma.label.count({
        where: { locationId, active: true }
      }),
      prisma.request.count({
        where: { locationId, status: 'PENDING' }
      }),
      prisma.request.findMany({
        where: { locationId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          label: {
            select: { name: true, code: true }
          }
        }
      }),
    ]);

    // Mock some dashboard data
    const topLabels = await prisma.label.findMany({
      where: { locationId, active: true },
      take: 5,
      select: {
        id: true,
        code: true,
        name: true,
      }
    });

    const dashboardLabels = topLabels.map(label => ({
      id: label.id,
      code: label.code,
      name: label.name,
      waitingCount: Math.floor(Math.random() * 10), // Mock data
      lastSendTimestamp: new Date().toISOString(),
    }));

    res.json({
      success: true,
      metrics: {
        activeVisitors: Math.floor(Math.random() * 50), // Mock data
        pendingAlerts: pendingRequests,
        topLabels: dashboardLabels,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Scan product
const scanSchema = z.object({
  code: z.string().min(1),
  method: z.enum(['scan', 'manual']),
});

router.post('/scan', authenticateTeam, async (req: AuthRequest, res, next) => {
  try {
    const { code, method } = scanSchema.parse(req.body);
    const locationId = req.user?.locationId;

    if (!locationId) {
      throw createError('Location not found in token', 400);
    }

    // Find label by code
    const label = await prisma.label.findFirst({
      where: {
        OR: [
          { code: code },
          { name: { contains: code, mode: 'insensitive' } },
          { synonyms: { contains: code, mode: 'insensitive' } },
        ],
        locationId,
        active: true,
      },
      include: {
        location: {
          select: { name: true }
        }
      }
    });

    if (!label) {
      throw createError('Product not found', 404);
    }

    // Mock subscriber data
    const subscribersCount = Math.floor(Math.random() * 100);
    const sentCount = Math.floor(Math.random() * 50);

    logger.info('Product scanned', {
      labelId: label.id,
      code: label.code,
      method,
      locationId,
      teamId: req.user?.id,
    });

    res.json({
      success: true,
      label: {
        id: label.id,
        code: label.code,
        name: label.name,
        synonyms: label.synonyms,
        location_id: label.locationId,
        location_name: label.location.name,
        active: label.active,
      },
      subscribers_count: subscribersCount,
      sent_count: sentCount,
      last_sent: new Date().toISOString(),
      next_allowed: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
    });
  } catch (error) {
    next(error);
  }
});

// Send alerts
const sendAlertsSchema = z.object({
  labelId: z.string().min(1),
  message: z.string().min(1).max(160),
});

router.post('/send', authenticateTeam, async (req: AuthRequest, res, next) => {
  try {
    const { labelId, message } = sendAlertsSchema.parse(req.body);
    const locationId = req.user?.locationId;

    if (!locationId) {
      throw createError('Location not found in token', 400);
    }

    // Find label
    const label = await prisma.label.findFirst({
      where: {
        id: labelId,
        locationId,
        active: true,
      },
    });

    if (!label) {
      throw createError('Label not found', 404);
    }

    // Get subscribers for this label (mock data for now)
    const mockSubscribers = [
      '+1234567890',
      '+1987654321',
      '+1555123456',
    ];

    // Send SMS to all subscribers
    const smsResult = await SmsService.sendBulkSms(mockSubscribers, message);

    logger.info('Alerts sent', {
      labelId,
      labelName: label.name,
      message,
      totalSubscribers: mockSubscribers.length,
      successCount: smsResult.success,
      failedCount: smsResult.failed,
      teamId: req.user?.id,
      locationId,
    });

    res.json({
      success: true,
      sent_count: smsResult.success,
      total_subscribers: mockSubscribers.length,
      label_name: label.name,
      last_send_timestamp: new Date().toISOString(),
      next_allowed_send: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
    });
  } catch (error) {
    next(error);
  }
});

// Get audit logs
router.get('/logs', authenticateTeam, async (req: AuthRequest, res, next) => {
  try {
    const { limit = '50', offset = '0' } = req.query;
    const locationId = req.user?.locationId;

    if (!locationId) {
      throw createError('Location not found in token', 400);
    }

    // Mock audit logs for now
    const mockLogs = Array.from({ length: parseInt(limit as string) }, (_, i) => ({
      id: `log-${i}`,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      user: 'Team Member',
      action: 'Alert Sent',
      details: `Sent alert for product ${i + 1}`,
      sent_count: Math.floor(Math.random() * 20),
      label_name: `Product ${i + 1}`,
      full_timestamp: new Date().toISOString(),
    }));

    res.json({
      success: true,
      logs: mockLogs,
      total: 100, // Mock total
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
