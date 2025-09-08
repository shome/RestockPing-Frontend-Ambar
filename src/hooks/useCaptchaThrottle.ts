import React, { useState, useCallback, useEffect } from 'react';
import { requestThrottler } from '@/lib/throttle';

interface UseCaptchaThrottleReturn {
  isCaptchaVerified: boolean;
  isThrottled: boolean;
  remainingRequests: number;
  timeUntilReset: number;
  verifyCaptcha: (isValid: boolean) => void;
  checkThrottle: (identifier: string) => boolean;
  resetCaptcha: () => void;
}

/**
 * Hook to manage captcha verification and request throttling
 * @param identifier - Unique identifier for throttling (usually IP or user ID)
 * @returns Object with captcha and throttling state and methods
 */
interface ThrottleState {
  isThrottled: boolean;
  remainingRequests: number;
  timeUntilReset: number;
}

export function useCaptchaThrottle(identifier: string): UseCaptchaThrottleReturn {
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [throttleState, setThrottleState] = useState<ThrottleState>({
    isThrottled: false,
    remainingRequests: 6,
    timeUntilReset: 0
  });

  const verifyCaptcha = useCallback((isValid: boolean) => {
    setIsCaptchaVerified(isValid);
  }, []);

  const resetCaptcha = useCallback(() => {
    setIsCaptchaVerified(false);
  }, []);

  const checkThrottle = useCallback((id: string): boolean => {
    const allowed = requestThrottler.isAllowed(id);
    const remaining = requestThrottler.getRemainingRequests(id);
    const timeUntilReset = requestThrottler.getTimeUntilReset(id);

    // Update state as a single object to ensure proper re-render
    setThrottleState({
      isThrottled: !allowed,
      remainingRequests: remaining,
      timeUntilReset: timeUntilReset
    });

    return allowed;
  }, []);

  // Check throttle status for the identifier
  const checkCurrentThrottle = useCallback(() => {
    return checkThrottle(identifier);
  }, [identifier, checkThrottle]);

  // Initialize throttle check
  React.useEffect(() => {
    checkCurrentThrottle();
  }, [checkCurrentThrottle]);

  // Live countdown timer that updates every second
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (throttleState.timeUntilReset > 0) {
      interval = setInterval(() => {
        const newTimeUntilReset = requestThrottler.getTimeUntilReset(identifier);
        
        if (newTimeUntilReset <= 0) {
          // Time is up, reset the throttle state
          setThrottleState({
            isThrottled: false,
            remainingRequests: 6,
            timeUntilReset: 0
          });
        } else {
          // Update the countdown
          setThrottleState(prev => ({
            ...prev,
            timeUntilReset: newTimeUntilReset
          }));
        }
      }, 1000); // Update every second
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [throttleState.timeUntilReset, identifier]);

  return {
    isCaptchaVerified,
    isThrottled: throttleState.isThrottled,
    remainingRequests: throttleState.remainingRequests,
    timeUntilReset: throttleState.timeUntilReset,
    verifyCaptcha,
    checkThrottle: checkCurrentThrottle,
    resetCaptcha,
  };
}
