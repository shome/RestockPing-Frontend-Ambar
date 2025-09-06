import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiService } from '@/lib/api';

interface MathCaptchaProps {
  onVerify: (isValid: boolean, sessionId?: string, answer?: number) => Promise<void>;
  onAttempt?: () => void; // New callback for every attempt
  className?: string;
}

export function MathCaptcha({ onVerify, onAttempt, className = '' }: MathCaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [question, setQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCaptchaFromBackend = async () => {
    setIsLoading(true);
    setError(null);
    setUserAnswer('');
    setIsVerified(false);
    setIsInvalid(false);
    setIsSubmitting(false);
    onVerify(false);

    try {
      const response = await apiService.fetchCaptcha();
      
      if (response.success) {
        setNum1(response.num1);
        setNum2(response.num2);
        setQuestion(response.question);
        setSessionId(response.sessionId);
        console.log('Captcha fetched from backend:', { 
          sessionId: response.sessionId, 
          question: response.question,
          num1: response.num1, 
          num2: response.num2 
        });
      } else {
        throw new Error(response.message || 'Failed to fetch captcha');
      }
    } catch (err) {
      console.error('Error fetching captcha:', err);
      setError(err instanceof Error ? err.message : 'Failed to load captcha');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptchaFromBackend();
  }, []);

  const handleSubmit = async () => {
    const userNum = parseInt(userAnswer);
    
    if (!userAnswer.trim() || isNaN(userNum)) {
      return;
    }
    
    setIsSubmitting(true);
    setIsInvalid(false);
    
    // Call onAttempt for every attempt (for throttling purposes)
    if (onAttempt) {
      onAttempt();
    }
    
    try {
      // Pass the user's answer to the parent component for verification
      // The parent will handle the API call and return success/failure
      await onVerify(true, sessionId, userNum);
      
      // If we reach here, verification was successful
      setIsVerified(true);
      setIsInvalid(false);
      setIsSubmitting(false);
      
      // Keep the verified state persistent - don't reset it
      
    } catch (error) {
      // Verification failed
      setIsInvalid(true);
      setIsVerified(false);
      setIsSubmitting(false);
      
      // Clear the input after a short delay
      setTimeout(() => {
        setUserAnswer('');
        setIsInvalid(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading security check...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="text-sm font-medium text-foreground">
          Security Check
        </div>
        <div className="text-sm text-red-500">
          {error}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchCaptchaFromBackend}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-medium text-foreground">
        Security Check: {question}
      </div>
      
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Your answer"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`flex-1 ${
            isVerified ? 'border-green-500 bg-green-50' : 
            isInvalid ? 'border-red-500 bg-red-50' : ''
          }`}
          disabled={isVerified || isSubmitting}
          readOnly={isVerified}
        />
        
        {isVerified ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : isInvalid ? (
          <XCircle className="h-5 w-5 text-red-500" />
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={!userAnswer.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Checking...
              </>
            ) : (
              'Check'
            )}
          </Button>
        )}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchCaptchaFromBackend}
          disabled={isVerified || isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>
      
      {isInvalid && (
        <p className="text-sm text-red-500">
          Incorrect answer. Please try again.
        </p>
      )}
    </div>
  );
}
