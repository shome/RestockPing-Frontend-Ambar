import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApiService, AdminPinEntry } from '@/lib/adminApi';
import { toInputDateTimeLocal, fromInputDateTimeLocal } from '@/utils/frontendDateUtils';

type Props = {
  pin: AdminPinEntry | null;
  open: boolean;
  onClose: () => void;
  onSaved?: (updated: any) => void;
};

// Date utility functions moved to utils/frontendDateUtils.ts

export const EditPinModal: React.FC<Props> = ({ pin, open, onClose, onSaved }) => {
  const [newPin, setNewPin] = useState('');
  const [expireLocal, setExpireLocal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pin) {
      setNewPin(''); // don't prefill new PIN, for security
      setExpireLocal(toInputDateTimeLocal(pin.expire_at ?? null));
      setError(null);
    } else {
      setNewPin('');
      setExpireLocal('');
    }
    
    // Auto-focus PIN input when modal opens
    if (open && pinInputRef.current) {
      setTimeout(() => pinInputRef.current?.focus(), 100);
    }
  }, [pin, open]);

  const validatePin = (p: string) => /^\d{4}$/.test(p);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSave = async () => {
    setError(null);
    if (!pin) return setError('No PIN selected');
    if (!validatePin(newPin)) return setError('PIN must be 4 digits');
    setLoading(true);
    
    try {
      // Prepare payload with safe date conversion
      const payload: any = { newPin };
      
      if (expireLocal) {
        const isoDate = fromInputDateTimeLocal(expireLocal);
        if (isoDate) {
          payload.expireAt = isoDate;
        } else {
          setError('Invalid expiry date format');
          setLoading(false);
          return;
        }
      } else {
        // Explicitly set to null if no expiry date
        payload.expireAt = null;
      }

      const resp = await adminApiService.updateTeamPin(pin.id, payload);

      // success
      toast({
        title: "PIN updated successfully",
        description: `PIN for ${pin.location_name} has been updated`,
      });
      
      if (onSaved) onSaved(resp);
      onClose();
    } catch (e: any) {
      console.error('Edit PIN error', e);
      const errorMessage = e?.response?.data?.error || e?.response?.data?.message || e.message || 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error updating PIN",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearExpiry = () => {
    setExpireLocal('');
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Edit Team PIN</DialogTitle>
          <DialogDescription>
            Update the PIN details for {pin?.location_name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              {pin?.location_name}
            </div>
          </div>
          <div>
            <Label htmlFor="newPin">New PIN (4 digits)</Label>
            <Input
              ref={pinInputRef}
              id="newPin"
              type="text"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="e.g. 5678"
              className="text-center text-lg tracking-widest"
              disabled={loading}
            />
            {newPin && newPin.length < 4 && (
              <p className="text-xs text-muted-foreground mt-1">
                PIN must be exactly 4 digits ({newPin.length}/4)
              </p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="expireAt">Expire at (optional)</Label>
              {expireLocal && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearExpiry}
                  className="h-auto p-1 text-xs"
                  disabled={loading}
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <Input
              id="expireAt"
              type="datetime-local"
              value={expireLocal}
              onChange={(e) => setExpireLocal(e.target.value)}
              disabled={loading}
            />
            {expireLocal && (
              <p className="text-xs text-muted-foreground mt-1">
                PIN will expire on {(() => {
                  try {
                    return new Date(expireLocal).toLocaleString();
                  } catch {
                    return 'Invalid date';
                  }
                })()}
              </p>
            )}
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading || !validatePin(newPin)}
              className={validatePin(newPin) ? '' : 'opacity-50'}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating PIN...
                </>
              ) : (
                'Update PIN'
              )}
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>💡 Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to save or <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Escape</kbd> to cancel</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
