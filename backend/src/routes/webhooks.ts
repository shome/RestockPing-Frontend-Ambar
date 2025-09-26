import express from 'express';
import { prisma } from '../server';
import { logger } from '../utils/logger';
import { WebhookStatus, SmsStatus } from '@prisma/client';

const router = express.Router();

// Twilio webhook for SMS status updates
router.post('/twilio/sms', async (req, res, next) => {
  try {
    const payload = req.body;
    
    // Log webhook received
    const webhookLog = await prisma.webhookLog.create({
      data: {
        source: 'twilio',
        payload,
        status: WebhookStatus.RECEIVED,
      },
    });

    // Validate Twilio webhook
    if (!payload.MessageSid || !payload.MessageStatus) {
      logger.warn('Invalid Twilio webhook payload', { payload });
      
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          status: WebhookStatus.INVALID,
          errorMessage: 'Missing required fields: MessageSid or MessageStatus',
        },
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid webhook payload',
      });
    }

    // Update SMS log if exists
    const smsLog = await prisma.smsLog.findFirst({
      where: { twilioSid: payload.MessageSid },
    });

    if (smsLog) {
      let status: SmsStatus;
      
      switch (payload.MessageStatus.toLowerCase()) {
        case 'delivered':
          status = SmsStatus.DELIVERED;
          break;
        case 'failed':
        case 'undelivered':
          status = SmsStatus.FAILED;
          break;
        case 'sent':
          status = SmsStatus.SENT;
          break;
        default:
          status = smsLog.status; // Keep current status
      }

      await prisma.smsLog.update({
        where: { id: smsLog.id },
        data: {
          status,
          ...(payload.ErrorMessage && { errorMessage: payload.ErrorMessage }),
        },
      });

      logger.info('SMS status updated', {
        smsLogId: smsLog.id,
        messageSid: payload.MessageSid,
        status: payload.MessageStatus,
      });
    }

    // Mark webhook as processed
    await prisma.webhookLog.update({
      where: { id: webhookLog.id },
      data: { status: WebhookStatus.PROCESSED },
    });

    res.json({ success: true });
  } catch (error: any) {
    logger.error('Webhook processing error:', error);
    
    // Log webhook error
    try {
      await prisma.webhookLog.create({
        data: {
          source: 'unknown',
          payload: req.body || {},
          status: WebhookStatus.ERROR,
          errorMessage: error.message,
        },
      });
    } catch (dbError) {
      logger.error('Failed to log webhook error:', dbError);
    }

    res.status(400).json({
      success: false,
      message: 'Invalid webhook',
    });
  }
});

// Generic webhook handler for unknown sources
router.post('/*', async (req, res, next) => {
  try {
    logger.warn('Unknown webhook received', {
      path: req.path,
      headers: req.headers,
      body: req.body,
    });

    // Log unknown webhook
    await prisma.webhookLog.create({
      data: {
        source: 'unknown',
        payload: {
          path: req.path,
          headers: req.headers,
          body: req.body,
        },
        status: WebhookStatus.INVALID,
        errorMessage: 'Unknown webhook source',
      },
    });

    res.status(400).json({
      success: false,
      message: 'Invalid webhook',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
