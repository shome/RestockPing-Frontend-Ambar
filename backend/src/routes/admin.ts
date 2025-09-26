import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../server';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { SmsService } from '../services/smsService';
import { PinStatus } from '@prisma/client';

const router = express.Router();

// Admin login
const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = adminLoginSchema.parse(req.body);

    // Simple admin authentication (in production, use proper user management)
    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
      throw createError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { id: 'admin', type: 'admin' },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info('Admin login successful', { username, ip: req.ip });

    res.json({
      success: true,
      token,
      expires_in: 24 * 60 * 60, // 24 hours in seconds
    });
  } catch (error) {
    next(error);
  }
});

// Get all team PINs
router.get('/pins', authenticateAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { type, limit = '50', offset = '0' } = req.query;
    
    const pins = await prisma.teamPin.findMany({
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      include: {
        location: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.teamPin.count();

    const formattedPins = pins.map(pin => ({
      id: pin.id,
      pin: pin.pin,
      location_name: pin.location.name,
      expire_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Mock 30 days from now
      active: pin.status === PinStatus.ACTIVE,
      created_at: pin.createdAt.toISOString(),
      type: 'team',
    }));

    res.json({
      success: true,
      pins: formattedPins,
      total,
    });
  } catch (error) {
    next(error);
  }
});

// Create team PIN
const createTeamPinSchema = z.object({
  pin: z.string().length(4).regex(/^\d{4}$/).optional(),
  locationId: z.string().min(1),
  expireAt: z.string().optional(),
});

router.post('/team-pins', authenticateAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { pin: providedPin, locationId, expireAt } = createTeamPinSchema.parse(req.body);

    // Generate PIN if not provided
    const pin = providedPin || Math.floor(1000 + Math.random() * 9000).toString();

    // Check if location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw createError('Location not found', 404);
    }

    // Check if PIN already exists for this location
    const existingPin = await prisma.teamPin.findUnique({
      where: {
        pin_locationId: {
          pin,
          locationId,
        },
      },
    });

    if (existingPin) {
      throw createError('PIN already exists for this location', 409);
    }

    // Create team PIN
    const teamPin = await prisma.teamPin.create({
      data: {
        pin,
        locationId,
        status: PinStatus.ACTIVE,
      },
      include: {
        location: {
          select: { name: true }
        }
      }
    });

    logger.info('Team PIN created', {
      pinId: teamPin.id,
      locationId,
      locationName: location.name,
      adminId: req.user?.id,
    });

    res.json({
      success: true,
      pin_id: teamPin.id,
      pin: teamPin.pin,
      expire_at: expireAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      message: `Team PIN created successfully for ${location.name}`,
    });
  } catch (error) {
    next(error);
  }
});

// Rotate team PIN
const rotatePinSchema = z.object({
  pinId: z.string().min(1),
  newPin: z.string().length(4).regex(/^\d{4}$/).optional(),
});

router.patch('/pins/:pinId/rotate', authenticateAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { pinId } = req.params;
    const { newPin } = rotatePinSchema.parse({ pinId, ...req.body });

    // Find existing PIN
    const existingPin = await prisma.teamPin.findUnique({
      where: { id: pinId },
      include: { location: true },
    });

    if (!existingPin) {
      throw createError('PIN not found', 404);
    }

    // Generate new PIN if not provided
    const pin = newPin || Math.floor(1000 + Math.random() * 9000).toString();

    // Check if new PIN already exists for this location
    const duplicatePin = await prisma.teamPin.findUnique({
      where: {
        pin_locationId: {
          pin,
          locationId: existingPin.locationId,
        },
      },
    });

    if (duplicatePin && duplicatePin.id !== pinId) {
      throw createError('New PIN already exists for this location', 409);
    }

    // Update PIN
    const updatedPin = await prisma.teamPin.update({
      where: { id: pinId },
      data: { pin },
    });

    logger.info('Team PIN rotated', {
      pinId,
      oldPin: existingPin.pin,
      newPin: pin,
      locationId: existingPin.locationId,
      adminId: req.user?.id,
    });

    res.json({
      success: true,
      pin_id: updatedPin.id,
      pin: updatedPin.pin,
      message: `PIN rotated successfully for ${existingPin.location.name}`,
    });
  } catch (error) {
    next(error);
  }
});

// Disable team PIN
router.patch('/pins/:pinId/disable', authenticateAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { pinId } = req.params;

    // Find existing PIN
    const existingPin = await prisma.teamPin.findUnique({
      where: { id: pinId },
      include: { location: true },
    });

    if (!existingPin) {
      throw createError('PIN not found', 404);
    }

    // Disable PIN
    const updatedPin = await prisma.teamPin.update({
      where: { id: pinId },
      data: { status: PinStatus.DISABLED },
    });

    logger.info('Team PIN disabled', {
      pinId,
      pin: existingPin.pin,
      locationId: existingPin.locationId,
      adminId: req.user?.id,
    });

    res.json({
      success: true,
      pin_id: updatedPin.id,
      message: `PIN disabled successfully for ${existingPin.location.name}`,
    });
  } catch (error) {
    next(error);
  }
});

// Get locations
router.get('/locations', authenticateAdmin, async (req: AuthRequest, res, next) => {
  try {
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        timezone: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      locations,
    });
  } catch (error) {
    next(error);
  }
});

// Get SMS logs
router.get('/sms-logs', authenticateAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { limit = '50', offset = '0' } = req.query;
    
    const logs = await SmsService.getSmsLogs(
      parseInt(limit as string),
      parseInt(offset as string)
    );

    const stats = await SmsService.getSmsStats();

    res.json({
      success: true,
      logs,
      stats,
      total: stats.total,
    });
  } catch (error) {
    next(error);
  }
});

// Get dashboard data
router.get('/dashboard', authenticateAdmin, async (req: AuthRequest, res, next) => {
  try {
    const [totalLabels, totalPins, totalRequests, smsStats] = await Promise.all([
      prisma.label.count(),
      prisma.teamPin.count({ where: { status: PinStatus.ACTIVE } }),
      prisma.request.count(),
      SmsService.getSmsStats(),
    ]);

    res.json({
      success: true,
      labels: [],
      total_labels: totalLabels,
      total_subscribers: 0, // Mock data
      total_sends: smsStats.sent,
      total_pins: totalPins,
      total_requests: totalRequests,
      sms_stats: smsStats,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
