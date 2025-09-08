import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Phone } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  dialCode: string;
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
  selectedCountry: Country | null;
  placeholder?: string;
  className?: string;
}

// Phone number validation - exactly 10 digits
const validatePhoneNumber = (phone: string): boolean => {
  // Check if phone number is exactly 10 digits
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

// Format phone number as user types
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  let cleaned = value.replace(/\D/g, '');
  
  // Limit to 10 digits maximum
  if (cleaned.length > 10) {
    cleaned = cleaned.slice(0, 10);
  }
  
  return cleaned;
};

export function PhoneInput({ 
  value, 
  onChange, 
  onValidationChange, 
  selectedCountry,
  placeholder = "Enter phone number",
  className = "" 
}: PhoneInputProps) {
  const [isValid, setIsValid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (selectedCountry && value) {
      const valid = validatePhoneNumber(value);
      setIsValid(valid);
      onValidationChange(valid);
    } else {
      setIsValid(false);
      onValidationChange(false);
    }
  }, [value, selectedCountry, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const getInputStyles = () => {
    if (value && isValid) {
      return 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500';
    } else if (value && !isValid) {
      return 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500';
    }
    return '';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="tel"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`pl-10 ${getInputStyles()}`}
        />
        
        {/* Validation Icon */}
        {value && (
          <div className="absolute right-3 top-3">
            {isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      {isFocused && (
        <div className="text-xs text-muted-foreground">
          <div>Enter phone number (exactly 10 digits)</div>
          {selectedCountry && (
            <div>Full number: {selectedCountry.dialCode}{value || 'XXXXXXXXXX'}</div>
          )}
        </div>
      )}

      {/* Validation Messages */}
      {value && !isValid && selectedCountry && (
        <div className="text-xs text-red-500">
          {value.length < 10 
            ? `Please enter exactly 10 digits (currently ${value.length} digits)`
            : `Phone number must be exactly 10 digits (currently ${value.length} digits)`
          }
        </div>
      )}

      {!selectedCountry && (
        <div className="text-xs text-amber-600">
          Please select a country first
        </div>
      )}

      {value && isValid && selectedCountry && (
        <div className="text-xs text-green-600">
          ✓ Valid phone number (10 digits): {selectedCountry.dialCode}{value}
        </div>
      )}
    </div>
  );
}
