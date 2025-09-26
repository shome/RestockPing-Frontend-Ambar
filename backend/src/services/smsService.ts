import twilio from 'twilio';
import { prisma } from '../server';
import { logger } from '../utils/logger';
import { SmsStatus } from '@prisma/client';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export interface SendSmsOptions {
  to: string;
  message: string;
  logToDatabase?: boolean;
}

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class SmsService {
  static async sendSms({ to, message, logToDatabase = true }: SendSmsOptions): Promise<SendSmsResult> {
    let smsLogId: string | null = null;

    try {
      // Create initial SMS log entry
      if (logToDatabase) {
        const smsLog = await prisma.smsLog.create({
          data: {
            phone: to,
            message,
            status: SmsStatus.PENDING,
          },
        });
        smsLogId = smsLog.id;
      }

      // Validate phone number format
      if (!this.isValidPhoneNumber(to)) {
        const error = `Invalid phone number format: ${to}`;
        logger.error('SMS sending failed - invalid phone number:', { phone: to, error });
        
        if (smsLogId) {
          await prisma.smsLog.update({
            where: { id: smsLogId },
            data: {
              status: SmsStatus.FAILED,
              errorMessage: error,
            },
          });
        }

        return { success: false, error };
      }

      // Check if Twilio is configured
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
        const error = 'Twilio SMS service not configured';
        logger.error('SMS sending failed - Twilio not configured');
        
        if (smsLogId) {
          await prisma.smsLog.update({
            where: { id: smsLogId },
            data: {
              status: SmsStatus.FAILED,
              errorMessage: error,
            },
          });
        }

        return { success: false, error };
      }

      // Send SMS via Twilio
      const twilioMessage = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to,
      });

      logger.info('SMS sent successfully:', {
        to,
        messageId: twilioMessage.sid,
        status: twilioMessage.status,
      });

      // Update SMS log with success
      if (smsLogId) {
        await prisma.smsLog.update({
          where: { id: smsLogId },
          data: {
            status: SmsStatus.SENT,
            twilioSid: twilioMessage.sid,
          },
        });
      }

      return { success: true, messageId: twilioMessage.sid };

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown SMS error';
      
      logger.error('SMS sending failed:', {
        phone: to,
        error: errorMessage,
        code: error.code,
        moreInfo: error.moreInfo,
      });

      // Update SMS log with failure
      if (smsLogId) {
        await prisma.smsLog.update({
          where: { id: smsLogId },
          data: {
            status: SmsStatus.FAILED,
            errorMessage,
          },
        });
      }

      return { success: false, error: errorMessage };
    }
  }

  static async sendBulkSms(recipients: string[], message: string): Promise<{
    success: number;
    failed: number;
    results: SendSmsResult[];
  }> {
    const results: SendSmsResult[] = [];
    let success = 0;
    let failed = 0;

    for (const phone of recipients) {
      const result = await this.sendSms({ to: phone, message });
      results.push(result);
      
      if (result.success) {
        success++;
      } else {
        failed++;
      }

      // Add small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.info('Bulk SMS completed:', {
      total: recipients.length,
      success,
      failed,
    });

    return { success, failed, results };
  }

  static isValidPhoneNumber(phone: string): boolean {
    // Basic phone number validation - should start with + and contain 10-15 digits
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
  }

  static async getSmsLogs(limit: number = 50, offset: number = 0) {
    return await prisma.smsLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getSmsStats() {
    const [total, sent, failed, pending] = await Promise.all([
      prisma.smsLog.count(),
      prisma.smsLog.count({ where: { status: SmsStatus.SENT } }),
      prisma.smsLog.count({ where: { status: SmsStatus.FAILED } }),
      prisma.smsLog.count({ where: { status: SmsStatus.PENDING } }),
    ]);

    return {
      total,
      sent,
      failed,
      pending,
      successRate: total > 0 ? (sent / total) * 100 : 0,
    };
  }
}
