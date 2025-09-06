import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface MathCaptchaProps {
  onVerify: (isValid: boolean) => void;
  onAttempt?: () => void; // New callback for every attempt
  className?: string;
}

export function MathCaptcha({ onVerify, onAttempt, className = '' }: MathCaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const generateNewQuestion = () => {
    const newNum1 = Math.floor(Math.random() * 10) + 1;
    const newNum2 = Math.floor(Math.random() * 10) + 1;
    setNum1(newNum1);
    setNum2(newNum2);
    setUserAnswer('');
    setIsVerified(false);
    setIsInvalid(false);
    onVerify(false);
  };

  useEffect(() => {
    generateNewQuestion();
  }, []);

  const handleSubmit = () => {
    const correctAnswer = num1 + num2;
    const userNum = parseInt(userAnswer);
    
    // Call onAttempt for every attempt (for throttling purposes)
    if (onAttempt) {
      onAttempt();
    }
    
    if (userNum === correctAnswer) {
      setIsVerified(true);
      setIsInvalid(false);
      onVerify(true);
    } else {
      setIsInvalid(true);
      setIsVerified(false);
      onVerify(false);
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

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-medium text-foreground">
        Security Check: What is {num1} + {num2}?
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
          disabled={isVerified}
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
            disabled={!userAnswer.trim()}
          >
            Check
          </Button>
        )}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateNewQuestion}
          disabled={isVerified}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {isInvalid && (
        <p className="text-sm text-red-500">
          Incorrect answer. Please try again.
        </p>
      )}
      
      {isVerified && (
        <p className="text-sm text-green-600">
          ✓ Verified! You can proceed.
        </p>
      )}
    </div>
  );
}
