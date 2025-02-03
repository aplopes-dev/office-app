'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });

      // Trigger a page refresh to update the file list
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileUpload}
        disabled={isUploading}
      />
      <label htmlFor="file-upload">
        <div className="flex flex-col items-center cursor-pointer">
          <Upload className="w-12 h-12 mb-4 text-gray-400" />
            {isUploading ? 'Uploading...' : 'Upload File'}
        </div>
      </label>
    </div>
  );
}