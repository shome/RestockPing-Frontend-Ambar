import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  X,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService, Label, LabelCreatePayload, LabelUpdatePayload } from '@/lib/api';
import { mockDelay } from '@/lib/mockLabelsData';

interface LabelsTableProps {
  labels: Label[];
  onRefresh: () => void;
  isLoading?: boolean;
}

interface EditLabelData {
  id: string;
  code: string;
  name: string;
  synonyms: string;
  active: boolean;
}

const LabelsTable: React.FC<LabelsTableProps> = ({ labels, onRefresh, isLoading = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLabel, setEditingLabel] = useState<EditLabelData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState<Label | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Filter labels based on search query
  const filteredLabels = labels.filter(label => 
    label.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    label.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    label.synonyms.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (label: Label) => {
    setEditingLabel({
      id: label.id,
      code: label.code,
      name: label.name,
      synonyms: label.synonyms,
      active: label.active
    });
    setIsEditDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingLabel({
      id: '',
      code: '',
      name: '',
      synonyms: '',
      active: true
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (label: Label) => {
    setLabelToDelete(label);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingLabel) return;

    // Validate required fields
    if (!editingLabel.code.trim() || !editingLabel.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Code and name are required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // MOCK DATA - Comment out when API is ready
      await mockDelay(1000); // Simulate API delay
      
      if (editingLabel.id) {
        // Update existing label - Mock success
        toast({
          title: "Label updated",
          description: "The label has been updated successfully.",
        });
      } else {
        // Create new label - Mock success
        toast({
          title: "Label created",
          description: "The new label has been created successfully.",
        });
      }

      onRefresh();
      setIsEditDialogOpen(false);
      setIsCreateDialogOpen(false);
      setEditingLabel(null);
      
      // ACTUAL API CODE - Uncomment when API is ready
      // if (editingLabel.id) {
      //   // Update existing label
      //   const updatePayload: LabelUpdatePayload = {
      //     id: editingLabel.id,
      //     code: editingLabel.code.trim(),
      //     name: editingLabel.name.trim(),
      //     synonyms: editingLabel.synonyms.trim(),
      //     active: editingLabel.active
      //   };
      // 
      //   await apiService.updateLabel(updatePayload);
      //   
      //   toast({
      //     title: "Label updated",
      //     description: "The label has been updated successfully.",
      //   });
      // } else {
      //   // Create new label
      //   const createPayload: LabelCreatePayload = {
      //     code: editingLabel.code.trim(),
      //     name: editingLabel.name.trim(),
      //     synonyms: editingLabel.synonyms.trim(),
      //     active: editingLabel.active
      //   };
      // 
      //   await apiService.createLabel(createPayload);
      //   
      //   toast({
      //     title: "Label created",
      //     description: "The new label has been created successfully.",
      //   });
      // }
      // 
      // onRefresh();
      // setIsEditDialogOpen(false);
      // setIsCreateDialogOpen(false);
      // setEditingLabel(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to save label.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!labelToDelete) return;

    setIsSubmitting(true);

    try {
      // MOCK DATA - Comment out when API is ready
      await mockDelay(800); // Simulate API delay
      
      toast({
        title: "Label deleted",
        description: "The label has been deleted successfully.",
      });

      onRefresh();
      setIsDeleteDialogOpen(false);
      setLabelToDelete(null);
      
      // ACTUAL API CODE - Uncomment when API is ready
      // await apiService.deleteLabel({ id: labelToDelete.id });
      // 
      // toast({
      //   title: "Label deleted",
      //   description: "The label has been deleted successfully.",
      // });
      // 
      // onRefresh();
      // setIsDeleteDialogOpen(false);
      // setLabelToDelete(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete label.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditingLabel(null);
    setIsEditDialogOpen(false);
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search labels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Label
        </Button>
      </div>

      {/* Labels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Labels ({filteredLabels.length})</CardTitle>
          <CardDescription>
            Manage your product labels. Active labels appear in customer search.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading labels...
            </div>
          ) : filteredLabels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No labels found matching your search.' : 'No labels found. Upload a CSV or create a new label.'}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Synonyms</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLabels.map((label) => (
                    <TableRow key={label.id}>
                      <TableCell className="font-mono text-sm">{label.code}</TableCell>
                      <TableCell className="font-medium">{label.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {label.synonyms || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={label.active ? "default" : "secondary"}>
                          {label.active ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(label)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(label)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isEditDialogOpen || isCreateDialogOpen} onOpenChange={handleCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLabel?.id ? 'Edit Label' : 'Create New Label'}
            </DialogTitle>
            <DialogDescription>
              {editingLabel?.id 
                ? 'Update the label information below.' 
                : 'Fill in the details for the new label.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {editingLabel && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Code *</label>
                <Input
                  value={editingLabel.code}
                  onChange={(e) => setEditingLabel({...editingLabel, code: e.target.value})}
                  placeholder="e.g., IPH15"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={editingLabel.name}
                  onChange={(e) => setEditingLabel({...editingLabel, name: e.target.value})}
                  placeholder="e.g., iPhone 15 Pro"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Synonyms</label>
                <Input
                  value={editingLabel.synonyms}
                  onChange={(e) => setEditingLabel({...editingLabel, synonyms: e.target.value})}
                  placeholder="e.g., smartphone, phone, mobile"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple synonyms with commas
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={editingLabel.active}
                  onCheckedChange={(checked) => setEditingLabel({...editingLabel, active: checked})}
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Active (appears in customer search)
                </label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {editingLabel?.id ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Label</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the label "{labelToDelete?.name}"? 
              This action cannot be undone and will remove the label from all customer searches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LabelsTable;
