import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Save } from "lucide-react";

interface RewardFormData {
  title: string;
  description: string;
  cost: number;
  isActive: boolean;
  actionType: string;
  actionConfig: Record<string, any>;
}

interface AdminRewardFormProps {
  onSubmit: (reward: RewardFormData) => void;
  initialData?: Partial<RewardFormData>;
  isEditing?: boolean;
}

export default function AdminRewardForm({ 
  onSubmit, 
  initialData = {}, 
  isEditing = false 
}: AdminRewardFormProps) {
  const [formData, setFormData] = useState<RewardFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    cost: initialData.cost || 100,
    isActive: initialData.isActive ?? true,
    actionType: initialData.actionType || 'chat_message',
    actionConfig: initialData.actionConfig || {}
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const actionTypes = [
    { value: 'chat_message', label: 'Chat Message' },
    { value: 'sound_effect', label: 'Sound Effect' },
    { value: 'screen_effect', label: 'Screen Effect' },
    { value: 'custom', label: 'Custom Action' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log('Submitting reward form:', formData);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    onSubmit(formData);
    
    setIsSubmitting(false);
    
    if (!isEditing) {
      // Reset form after successful creation
      setFormData({
        title: '',
        description: '',
        cost: 100,
        isActive: true,
        actionType: 'chat_message',
        actionConfig: {}
      });
    }
  };

  const handleInputChange = (field: keyof RewardFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card data-testid="card-admin-reward-form">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isEditing ? 'Edit Reward' : 'Create New Reward'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Reward Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter reward title"
                required
                data-testid="input-reward-title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cost">Point Cost</Label>
              <Input
                id="cost"
                type="number"
                min="1"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', parseInt(e.target.value) || 0)}
                placeholder="100"
                required
                data-testid="input-reward-cost"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this reward does..."
              required
              data-testid="textarea-reward-description"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="actionType">Action Type</Label>
              <Select
                value={formData.actionType}
                onValueChange={(value) => handleInputChange('actionType', value)}
              >
                <SelectTrigger data-testid="select-action-type">
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 pt-7">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                data-testid="switch-reward-active"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.description}
              data-testid="button-submit-reward"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Reward' : 'Create Reward'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}