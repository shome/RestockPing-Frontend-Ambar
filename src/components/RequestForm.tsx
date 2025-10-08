import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';

interface RequestFormProps {
  onRequestCreated?: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ onRequestCreated }) => {
  const [formData, setFormData] = useState({
    locationId: '',
    phone: '',
    labelId: '',
    labelName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.locationId || !formData.phone || (!formData.labelId && !formData.labelName)) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.createRequest({
        locationId: formData.locationId,
        phone: formData.phone,
        labelId: formData.labelId || undefined,
        labelName: formData.labelName || undefined,
      });

      if (response.success) {
        toast({
          title: "Request Created",
          description: "Request created successfully. Label counters updated automatically.",
        });

        // Reset form
        setFormData({
          locationId: '',
          phone: '',
          labelId: '',
          labelName: ''
        });

        // Trigger refresh of labels table
        if (onRequestCreated) {
          onRequestCreated();
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Location ID *</label>
            <Input
              value={formData.locationId}
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              placeholder="Enter location ID"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone *</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1234567890"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Label ID</label>
            <Input
              value={formData.labelId}
              onChange={(e) => setFormData({ ...formData, labelId: e.target.value })}
              placeholder="Enter existing label ID"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Label Name</label>
            <Input
              value={formData.labelName}
              onChange={(e) => setFormData({ ...formData, labelName: e.target.value })}
              placeholder="Or enter new label name"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating...' : 'Create Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RequestForm;
