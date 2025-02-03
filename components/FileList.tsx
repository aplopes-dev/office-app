'use client';

import { useEffect, useState } from 'react';
import { FileIcon, Download, Eye, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import OnlyofficeUpload from './OnlyofficeUpload';

interface File {
  id: string;
  filename: string;
  key: string;
  size: number;
  createdAt: string;
  mimetype: string;
}

export default function FileList() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getFileType = (mimetype: string) => {
    const types: { [key: string]: string } = {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/pdf': 'pdf',
    };
    return types[mimetype] || 'docx';
  };

  const getDocumentType = (mimetype: string) => {
    const types: { [key: string]: string } = {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'cell',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'slide',
      'application/pdf': 'word',
    };
    return types[mimetype] || 'word';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
          <div className="space-y-4">
            {files.length === 0 ? (
              <p className="text-center text-gray-500">No files uploaded yet</p>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <FileIcon className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="font-medium">{file.filename}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} •{' '}
                        {formatDistanceToNow(new Date(file.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(file)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/api/files/${file.key}`)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogTitle>{selectedFile?.filename}</DialogTitle>
        <DialogDescription> </DialogDescription>
        <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh]">
          {selectedFile && (
            <OnlyofficeUpload
              fileType={getFileType(selectedFile.mimetype)}
              documentType={getDocumentType(selectedFile.mimetype)}
              key={selectedFile.key}
              title={selectedFile.filename}
              url={`${process.env.NEXT_PUBLIC_APP_URL}/api/files/${selectedFile.key}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}