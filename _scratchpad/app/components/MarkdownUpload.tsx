import { AlertCircle, CheckCircle, Loader2, Upload } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export default function MarkdownUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const validExtensions = ['.md', '.markdown', '.txt'];
    const isValidFile = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isValidFile) {
      setUploadStatus('error');
      setStatusMessage('Please select a markdown file (.md, .markdown) or text file (.txt)');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setStatusMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-markdown', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus('success');
        setStatusMessage(result.message);
      } else {
        setUploadStatus('error');
        setStatusMessage(result.error || 'Upload failed');
      }
    } catch (error) {
      setUploadStatus('error');
      setStatusMessage('Network error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setStatusMessage('');
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">Upload Markdown</div>

      <div className="relative">
        <input
          id="file-input"
          type="file"
          accept=".md,.markdown,.txt"
          onChange={handleFileUpload}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          disabled={isUploading}
        />

        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            {isUploading ? (
              <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-gray-400" />
            ) : uploadStatus === 'success' ? (
              <>
                <CheckCircle className="mx-auto mb-2 h-6 w-6 text-green-600" />
                <div className="mb-2 text-sm text-green-600">Document uploaded successfully</div>
                <Button variant="link" onClick={resetUpload} className="text-xs">
                  Upload another
                </Button>
              </>
            ) : uploadStatus === 'error' ? (
              <>
                <AlertCircle className="mx-auto mb-2 h-6 w-6 text-red-600" />
                <div className="mb-2 text-sm text-red-600">{statusMessage}</div>
                <Button variant="link" onClick={resetUpload} className="text-xs">
                  Try again
                </Button>
              </>
            ) : (
              <>
                <Upload className="mx-auto mb-2 h-6 w-6 text-gray-400" />
                <div className="mb-1 text-sm text-gray-600">
                  Drop markdown file here or click to browse
                </div>
                <div className="text-xs text-gray-500">
                  Markdown (.md, .markdown) or text (.txt), max 10MB, 8000 chars
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
