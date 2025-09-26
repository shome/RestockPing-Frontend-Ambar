import { SmsService } from './smsService';

describe('SmsService', () => {
  describe('isValidPhoneNumber', () => {
    test('validates correct international phone numbers', () => {
      expect(SmsService.isValidPhoneNumber('+14155551234')).toBe(true);
      expect(SmsService.isValidPhoneNumber('+33123456789')).toBe(true);
      expect(SmsService.isValidPhoneNumber('+447911123456')).toBe(true);
    });

    test('rejects invalid phone numbers', () => {
      expect(SmsService.isValidPhoneNumber('4155551234')).toBe(false); // No country code
      expect(SmsService.isValidPhoneNumber('+1')).toBe(false); // Too short
      expect(SmsService.isValidPhoneNumber('+123456789012345678')).toBe(false); // Too long
      expect(SmsService.isValidPhoneNumber('')).toBe(false); // Empty
      expect(SmsService.isValidPhoneNumber('invalid')).toBe(false); // Non-numeric
    });

    test('handles edge cases', () => {
      expect(SmsService.isValidPhoneNumber('+1234567890')).toBe(true); // Minimum valid length
      expect(SmsService.isValidPhoneNumber('+123456789012345')).toBe(true); // Maximum valid length
      expect(SmsService.isValidPhoneNumber('+0123456789')).toBe(false); // Starts with 0 after +
    });
  });

  describe('sendSms', () => {
    beforeEach(() => {
      // Mock environment variables
      process.env.TWILIO_ACCOUNT_SID = 'test_sid';
      process.env.TWILIO_AUTH_TOKEN = 'test_token';
      process.env.TWILIO_PHONE_NUMBER = '+1234567890';
    });

    afterEach(() => {
      // Clean up environment variables
      delete process.env.TWILIO_ACCOUNT_SID;
      delete process.env.TWILIO_AUTH_TOKEN;
      delete process.env.TWILIO_PHONE_NUMBER;
    });

    test('rejects invalid phone numbers', async () => {
      const result = await SmsService.sendSms({
        to: 'invalid-phone',
        message: 'Test message',
        logToDatabase: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid phone number format');
    });

    test('rejects when Twilio is not configured', async () => {
      delete process.env.TWILIO_ACCOUNT_SID;

      const result = await SmsService.sendSms({
        to: '+14155551234',
        message: 'Test message',
        logToDatabase: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Twilio SMS service not configured');
    });
  });

  describe('sendBulkSms', () => {
    test('handles empty recipient list', async () => {
      const result = await SmsService.sendBulkSms([], 'Test message');

      expect(result.success).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(0);
    });

    test('processes multiple recipients', async () => {
      const recipients = ['+14155551234', 'invalid-phone', '+14155551235'];
      
      const result = await SmsService.sendBulkSms(recipients, 'Test message');

      expect(result.results).toHaveLength(3);
      expect(result.success + result.failed).toBe(3);
    });
  });
});
