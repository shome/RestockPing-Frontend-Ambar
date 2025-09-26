import express from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = express.Router();

// Get locations
router.get('/locations', async (req, res, next) => {
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
      total: locations.length,
    });
  } catch (error) {
    next(error);
  }
});

// Search labels
router.get('/labels', async (req, res, next) => {
  try {
    const { query, limit = '10' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.json({
        success: true,
        labels: [],
        total: 0,
      });
    }

    const labels = await prisma.label.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
          { synonyms: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: parseInt(limit as string),
      select: {
        id: true,
        code: true,
        name: true,
        synonyms: true,
        active: true,
        location_id: true,
      },
    });

    res.json({
      success: true,
      labels,
      total: labels.length,
    });
  } catch (error) {
    next(error);
  }
});

// Create request
const createRequestSchema = z.object({
  locationId: z.string().min(1),
  phone: z.string().min(1),
  labelName: z.string().optional(),
  labelId: z.string().optional(),
});

router.post('/requests', async (req, res, next) => {
  try {
    const { locationId, phone, labelName, labelId } = createRequestSchema.parse(req.body);

    // Validate location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw createError('Location not found', 404);
    }

    // Create request
    const request = await prisma.request.create({
      data: {
        phone,
        labelName,
        labelId,
        locationId,
        status: 'PENDING',
      },
    });

    logger.info('Request created', {
      requestId: request.id,
      phone: phone.replace(/\d(?=\d{4})/g, '*'), // Mask phone number in logs
      locationId,
      labelName,
      labelId,
    });

    res.json({
      success: true,
      requestId: request.id,
      message: 'Request created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Mock captcha endpoints for compatibility
router.get('/captcha', async (req, res, next) => {
  try {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const sessionId = Math.random().toString(36).substring(7);

    res.json({
      success: true,
      sessionId,
      question: `What is ${num1} + ${num2}?`,
      num1,
      num2,
      expiresIn: 300, // 5 minutes
    });
  } catch (error) {
    next(error);
  }
});

const verifyCaptchaSchema = z.object({
  captchaSessionId: z.string(),
  captchaAnswer: z.number(),
});

router.post('/captcha/verify', async (req, res, next) => {
  try {
    const { captchaSessionId, captchaAnswer } = verifyCaptchaSchema.parse(req.body);

    // Mock captcha verification - always return true for demo
    res.json({
      success: true,
      valid: true,
      message: 'Captcha verified successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
