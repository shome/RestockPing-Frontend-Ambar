/**
 * Frontend date utilities for safe date handling and display
 */

/**
 * Safely formats a date string for display
 * @param dateString - The date string to format
 * @returns Formatted date string or "Invalid Date" if invalid
 */
export const formatDateDisplay = (dateString: string | null | undefined): string => {
  // Handle null, undefined, empty string, or 'null' string
  if (!dateString || dateString === 'null' || dateString.trim() === '') {
    return "No expiry";
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string received:', dateString);
      return "Invalid Date";
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return "Invalid Date";
  }
};

/**
 * Safely checks if a date is expired
 * @param expireAt - The expiry date string
 * @returns true if expired, false otherwise
 */
export const isExpired = (expireAt: string | null | undefined): boolean => {
  if (!expireAt) return false;
  
  try {
    const date = new Date(expireAt);
    if (isNaN(date.getTime())) {
      return false; // Invalid dates are not considered expired
    }
    return date < new Date();
  } catch (error) {
    console.warn('Error checking expiry:', expireAt, error);
    return false;
  }
};

/**
 * Gets the expiry status with color and badge information
 * @param expireAt - The expiry date string
 * @param status - Optional status override
 * @returns Object with status, color, and badge variant
 */
export const getExpiryStatus = (expireAt: string | null | undefined, status?: string) => {
  if (status === 'disabled') {
    return { status: 'disabled', color: 'text-gray-600', badge: 'secondary' as const };
  }
  
  // Handle null, undefined, empty string, or 'null' string
  if (!expireAt || expireAt === 'null' || expireAt.trim() === '') {
    return { status: 'no expiry', color: 'text-blue-600', badge: 'default' as const };
  }
  
  try {
    const now = new Date();
    const expiry = new Date(expireAt);
    
    if (isNaN(expiry.getTime())) {
      return { status: 'invalid', color: 'text-orange-600', badge: 'secondary' as const };
    }
    
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600', badge: 'destructive' as const };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'expiring', color: 'text-yellow-600', badge: 'secondary' as const };
    } else {
      return { status: 'active', color: 'text-green-600', badge: 'default' as const };
    }
  } catch (error) {
    console.warn('Error getting expiry status:', expireAt, error);
    return { status: 'invalid', color: 'text-orange-600', badge: 'secondary' as const };
  }
};

/**
 * Safely converts a date string to datetime-local input format
 * @param dateString - The date string to convert
 * @returns Formatted string for datetime-local input or empty string if invalid
 */
export const toInputDateTimeLocal = (dateString: string | null | undefined): string => {
  // Handle null, undefined, empty string, or 'null' string
  if (!dateString || dateString === 'null' || dateString.trim() === '') {
    return '';
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date for input conversion:', dateString);
      return '';
    }
    
    // Format for datetime-local input: yyyy-MM-ddTHH:mm
    const iso = date.toISOString();
    return iso.slice(0, 16);
  } catch (error) {
    console.warn('Error converting to input format:', dateString, error);
    return '';
  }
};

/**
 * Safely converts datetime-local input value to ISO string
 * @param inputValue - The datetime-local input value
 * @returns ISO string or null if invalid
 */
export const fromInputDateTimeLocal = (inputValue: string): string | null => {
  if (!inputValue) return null;
  
  try {
    const date = new Date(inputValue);
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date.toISOString();
  } catch (error) {
    console.warn('Error converting from input format:', inputValue, error);
    return null;
  }
};
