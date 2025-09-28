/**
 * Phone number utility functions for privacy and formatting
 */

/**
 * Masks a phone number for privacy by showing only the last 2-3 digits
 * Examples:
 * +14151234567 -> +141*****67
 * +201234567890 -> +201*****90
 * 1234567890 -> 123*****90
 * 
 * @param phoneNumber - The phone number to mask
 * @returns Masked phone number string
 */
export function maskPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return '***';
  }

  // Remove any whitespace and special characters except +
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  if (cleanNumber.length === 0) {
    return '***';
  }

  // Handle different phone number formats
  if (cleanNumber.startsWith('+')) {
    // International format: +14151234567
    if (cleanNumber.length < 6) {
      return cleanNumber; // Too short to mask meaningfully
    }
    
    // Show country code + first digit, mask middle, show last 2-3 digits
    const countryAndFirst = cleanNumber.substring(0, 4); // +141
    const lastDigits = cleanNumber.substring(cleanNumber.length - 2); // 67
    const maskedLength = cleanNumber.length - 6; // Length of masked part
    const asterisks = '*'.repeat(Math.max(maskedLength, 3));
    
    return `${countryAndFirst}${asterisks}${lastDigits}`;
  } else {
    // Local format: 1234567890
    if (cleanNumber.length < 6) {
      return cleanNumber; // Too short to mask meaningfully
    }
    
    // Show first 3 digits, mask middle, show last 2 digits
    const firstDigits = cleanNumber.substring(0, 3); // 123
    const lastDigits = cleanNumber.substring(cleanNumber.length - 2); // 90
    const maskedLength = cleanNumber.length - 5; // Length of masked part
    const asterisks = '*'.repeat(Math.max(maskedLength, 3));
    
    return `${firstDigits}${asterisks}${lastDigits}`;
  }
}

/**
 * Validates if a phone number looks valid (basic validation)
 * @param phoneNumber - The phone number to validate
 * @returns boolean indicating if the phone number appears valid
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }

  // Remove any whitespace and special characters except +
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  // Basic validation: should have at least 7 digits and at most 15
  const digitCount = cleanNumber.replace(/[^\d]/g, '').length;
  return digitCount >= 7 && digitCount <= 15;
}

/**
 * Formats a phone number for display (without masking)
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return '';
  }

  // Remove any whitespace and special characters except +
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  if (cleanNumber.startsWith('+')) {
    // International format - keep as is
    return cleanNumber;
  } else if (cleanNumber.length === 10) {
    // US format: 1234567890 -> (123) 456-7890
    return `(${cleanNumber.substring(0, 3)}) ${cleanNumber.substring(3, 6)}-${cleanNumber.substring(6)}`;
  } else {
    // Other formats - keep as is
    return cleanNumber;
  }
}
