import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Download,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService, CSVUploadResponse } from '@/lib/api';
import { createMockCSVUploadResponse, mockDelay } from '@/lib/mockLabelsData';

interface CSVUploadProps {
  onUploadComplete?: (response: CSVUploadResponse) => void;
  onRefresh?: () => void;
}

interface CSVValidationError {
  row: number;
  field: string;
  message: string;
  value: string;
}

const CSVUpload: React.FC<CSVUploadProps> = ({ onUploadComplete, onRefresh }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<CSVUploadResponse | null>(null);
  const [validationErrors, setValidationErrors] = useState<CSVValidationError[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);
    setValidationErrors([]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // MOCK DATA - Comment out when API is ready
      await mockDelay(2000); // Simulate API delay
      const response = createMockCSVUploadResponse(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(response);

      if (response.success) {
        toast({
          title: "Upload successful!",
          description: `Processed ${response.processed} rows. Created: ${response.created}, Updated: ${response.updated}`,
        });
        
        if (onUploadComplete) {
          onUploadComplete(response);
        }
        
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast({
          title: "Upload completed with errors",
          description: response.message,
          variant: "destructive",
        });
      }

      // Parse validation errors if any
      if (response.errors && response.errors.length > 0) {
        const errors: CSVValidationError[] = response.errors.map((error, index) => ({
          row: index + 1,
          field: 'unknown',
          message: error,
          value: ''
        }));
        setValidationErrors(errors);
      }

      // ACTUAL API CODE - Uncomment when API is ready
      // const response = await apiService.uploadLabelsCSV(file);
      // 
      // clearInterval(progressInterval);
      // setUploadProgress(100);
      // setUploadResult(response);
      // 
      // if (response.success) {
      //   toast({
      //     title: "Upload successful!",
      //     description: `Processed ${response.processed} rows. Created: ${response.created}, Updated: ${response.updated}`,
      //   });
      //   
      //   if (onUploadComplete) {
      //     onUploadComplete(response);
      //   }
      //   
      //   if (onRefresh) {
      //     onRefresh();
      //   }
      // } else {
      //   toast({
      //     title: "Upload completed with errors",
      //     description: response.message,
      //     variant: "destructive",
      //   });
      // }
      // 
      // // Parse validation errors if any
      // if (response.errors && response.errors.length > 0) {
      //   const errors: CSVValidationError[] = response.errors.map((error, index) => ({
      //     row: index + 1,
      //     field: 'unknown',
      //     message: error,
      //     value: ''
      //   }));
      //   setValidationErrors(errors);
      // }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const downloadTemplate = async () => {
    try {
      // MOCK DATA - Comment out when API is ready
      await mockDelay(500); // Simulate API delay
      const templateData = 'code,name,synonyms,active\nIPH15,"iPhone 15 Pro","smartphone,phone,mobile",true\nSGS24,"Samsung Galaxy S24","android,galaxy",true\nMBPM3,"MacBook Pro M3","laptop,computer",false';
      const blob = new Blob([templateData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'labels_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Template downloaded",
        description: "CSV template has been downloaded successfully.",
      });
      
      // ACTUAL API CODE - Uncomment when API is ready
      // const blob = await apiService.downloadLabelsCSV();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'labels_template.csv';
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
      // document.body.removeChild(a);
      // 
      // toast({
      //   title: "Template downloaded",
      //   description: "CSV template has been downloaded successfully.",
      // });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to download template.";
      toast({
        title: "Download failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const resetUpload = () => {
    setUploadResult(null);
    setValidationErrors([]);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Labels CSV
          </CardTitle>
          <CardDescription>
            Upload a CSV file with label data. The file should contain columns: code, name, synonyms, active.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              
              <div>
                <p className="text-lg font-medium">
                  {isUploading ? 'Uploading...' : 'Drop your CSV file here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  variant="outline"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Select File
                </Button>
                
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  disabled={isUploading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Result */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Upload Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{uploadResult.processed}</p>
                  <p className="text-sm text-muted-foreground">Total Processed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{uploadResult.created}</p>
                  <p className="text-sm text-muted-foreground">Created</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{uploadResult.updated}</p>
                  <p className="text-sm text-muted-foreground">Updated</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{uploadResult.errors.length}</p>
                  <p className="text-sm text-muted-foreground">Errors</p>
                </div>
              </div>

              {uploadResult.message && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{uploadResult.message}</AlertDescription>
                </Alert>
              )}

              {validationErrors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Validation Errors:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {validationErrors.map((error, index) => (
                      <div key={index} className="text-xs p-2 bg-red-50 rounded border-l-2 border-red-200">
                        <span className="font-medium">Row {error.row}:</span> {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={resetUpload} variant="outline" size="sm">
                  Upload Another File
                </Button>
                {onRefresh && (
                  <Button onClick={onRefresh} size="sm">
                    Refresh Labels
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSV Format Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Format Requirements</CardTitle>
          <CardDescription>
            Your CSV file must follow this exact format for successful upload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Required Columns:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Badge variant="outline">code (string, unique)</Badge>
                <Badge variant="outline">name (string, required)</Badge>
                <Badge variant="outline">synonyms (string, optional)</Badge>
                <Badge variant="outline">active (boolean: true/false)</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Example CSV:</h4>
              <div className="bg-muted p-3 rounded text-xs font-mono">
                <div>code,name,synonyms,active</div>
                <div>IPH15,iPhone 15 Pro,"smartphone,phone,mobile",true</div>
                <div>SGS24,Samsung Galaxy S24,"android,galaxy",true</div>
                <div>MBPM3,MacBook Pro M3,"laptop,computer",false</div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p><strong>Note:</strong> The system will validate each row and show any errors. 
              Existing labels with the same code will be updated, new ones will be created.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSVUpload;
