/**
 * Utility functions for phone number handling and masking
 */

/**
 * Masks a phone number showing only the last 2-3 digits
 * Example: +1234567890 -> +1*****90
 * Example: +14155552345 -> +141*****45
 */
export const maskPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return phoneNumber;
  }

  // Remove any whitespace
  const cleanNumber = phoneNumber.trim();
  
  // If the number is too short, return as is
  if (cleanNumber.length < 4) {
    return cleanNumber;
  }

  // Extract country code (if starts with +)
  const hasCountryCode = cleanNumber.startsWith('+');
  
  if (hasCountryCode) {
    // For international numbers like +1234567890
    if (cleanNumber.length <= 6) {
      // Short international numbers - mask middle part
      const start = cleanNumber.substring(0, 3);
      const end = cleanNumber.substring(cleanNumber.length - 2);
      const maskLength = cleanNumber.length - 5;
      return `${start}${'*'.repeat(maskLength)}${end}`;
    } else {
      // Longer international numbers - show country code + first digit, mask middle, show last 2-3 digits
      const countryAndFirst = cleanNumber.substring(0, 4); // +123
      const lastDigits = cleanNumber.substring(cleanNumber.length - 2); // last 2 digits
      const maskLength = cleanNumber.length - 6;
      return `${countryAndFirst}${'*'.repeat(maskLength)}${lastDigits}`;
    }
  } else {
    // For domestic numbers without country code
    if (cleanNumber.length <= 6) {
      // Short numbers - show first 2, mask middle, show last 2
      const start = cleanNumber.substring(0, 2);
      const end = cleanNumber.substring(cleanNumber.length - 2);
      const maskLength = cleanNumber.length - 4;
      return `${start}${'*'.repeat(maskLength)}${end}`;
    } else {
      // Longer numbers - show first 3, mask middle, show last 2
      const start = cleanNumber.substring(0, 3);
      const end = cleanNumber.substring(cleanNumber.length - 2);
      const maskLength = cleanNumber.length - 5;
      return `${start}${'*'.repeat(maskLength)}${end}`;
    }
  }
};

/**
 * Validates if a phone number looks valid
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }

  const cleanNumber = phoneNumber.trim();
  
  // Basic validation - should have at least 7 digits and optionally start with +
  const phoneRegex = /^(\+\d{1,3})?[\d\s\-\(\)]{7,15}$/;
  return phoneRegex.test(cleanNumber);
};

/**
 * Formats a phone number for display (without masking)
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return phoneNumber;
  }

  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  if (cleanNumber.length === 10) {
    // US format: (123) 456-7890
    return `(${cleanNumber.substring(0, 3)}) ${cleanNumber.substring(3, 6)}-${cleanNumber.substring(6)}`;
  } else if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
    // US format with country code: +1 (123) 456-7890
    return `+1 (${cleanNumber.substring(1, 4)}) ${cleanNumber.substring(4, 7)}-${cleanNumber.substring(7)}`;
  }
  
  // For other formats, return as is with + if it looks international
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  } else if (cleanNumber.length > 10) {
    return `+${cleanNumber}`;
  }
  
  return phoneNumber;
};

/**
 * Extracts phone numbers from text
 */
export const extractPhoneNumbers = (text: string): string[] => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Regex to match phone numbers in various formats
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const matches = text.match(phoneRegex);
  
  return matches ? matches.map(match => match.trim()) : [];
};

/**
 * Checks if a phone number is likely a test/fake number
 */
export const isFakePhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }

  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Common fake number patterns
  const fakePatterns = [
    /^123+$/,           // All 123s
    /^555+$/,           // All 555s  
    /^000+$/,           // All 000s
    /^111+$/,           // All 111s
    /^999+$/,           // All 999s
    /^(123){2,}$/,      // Repeating 123
    /^(\d)\1{6,}$/,     // Same digit repeated 7+ times
  ];

  return fakePatterns.some(pattern => pattern.test(cleanNumber));
};
