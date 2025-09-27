import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Masks a phone number for privacy protection
 * @param phone - The phone number to mask (e.g., "+14155551234")
 * @returns Masked phone number (e.g., "+141*****34")
 */
export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return phone;
  }

  // Remove any whitespace
  const cleanPhone = phone.trim();
  
  // Handle empty or very short strings
  if (cleanPhone.length <= 4) {
    return cleanPhone;
  }

  // For international numbers starting with +
  if (cleanPhone.startsWith('+')) {
    if (cleanPhone.length <= 6) {
      return cleanPhone;
    }
    
    // Show country code + first digit, mask middle, show last 2 digits
    // Example: +14155551234 -> +141*****34
    const countryAndFirst = cleanPhone.substring(0, 4); // +141
    const lastTwo = cleanPhone.substring(cleanPhone.length - 2); // 34
    const middleLength = cleanPhone.length - 6; // Length of middle part to mask
    const masked = '*'.repeat(Math.max(middleLength, 3)); // At least 3 asterisks
    
    return `${countryAndFirst}${masked}${lastTwo}`;
  }
  
  // For domestic numbers (no country code)
  if (cleanPhone.length >= 10) {
    // Show first 3 digits, mask middle, show last 2 digits
    // Example: 4155551234 -> 415*****34
    const first = cleanPhone.substring(0, 3);
    const last = cleanPhone.substring(cleanPhone.length - 2);
    const middleLength = cleanPhone.length - 5;
    const masked = '*'.repeat(Math.max(middleLength, 3));
    
    return `${first}${masked}${last}`;
  }
  
  // For shorter numbers, mask all but first and last character
  if (cleanPhone.length >= 4) {
    const first = cleanPhone.substring(0, 1);
    const last = cleanPhone.substring(cleanPhone.length - 1);
    const masked = '*'.repeat(cleanPhone.length - 2);
    
    return `${first}${masked}${last}`;
  }
  
  // For very short numbers, return as is
  return cleanPhone;
}

/**
 * Formats a date string to a human-readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

/**
 * Truncates text to a specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}
