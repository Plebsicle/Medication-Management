import React, { useEffect, useState } from 'react';
import { fileApi } from '../../lib/api/files';
import { FileIcon, FileTextIcon, ImageIcon, Trash2Icon, ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface SharedFile {
  id: number;
  fileName: string;
  fileKey: string;
  createdAt: string;
  viewUrl: string;
  canDelete: boolean;
  uploader: {
    id: number;
    name: string;
    profile_photo_path: string | null;
  };
}

interface SharedFilesListProps {
  doctorId: number;
  patientId: number;
  refreshTrigger?: number;
}

const SharedFilesList: React.FC<SharedFilesListProps> = ({ doctorId, patientId, refreshTrigger = 0 }) => {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        setLoading(true);
        const sharedFiles = await fileApi.getSharedFiles(doctorId, patientId);
        setFiles(sharedFiles);
      } catch (error) {
        console.error('Error loading shared files:', error);
        toast.error('Failed to load shared files');
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [doctorId, patientId, refreshTrigger]);

  const handleView = (file: SharedFile) => {
    window.open(file.viewUrl, '_blank');
  };

  const handleDelete = async (fileId: number) => {
    try {
      await fileApi.deleteFile(fileId);
      setFiles(files.filter(file => file.id !== fileId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return null;
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    } else if (['pdf'].includes(extension || '')) {
      return <FileTextIcon className="h-5 w-5 text-red-500" />;
    } else if (['doc', 'docx'].includes(extension || '')) {
      return <FileTextIcon className="h-5 w-5 text-blue-700" />;
    } else {
      return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="mt-4 mb-2">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Shared Files</h3>
      <div className="space-y-2">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
            <div className="flex items-center space-x-2">
              {getFileIcon(file.fileName)}
              <div>
                <p className="text-sm font-medium truncate max-w-[150px]">{file.fileName}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })} by {file.uploader.name}
                </p>
              </div>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => handleView(file)}
                className="p-1 text-gray-500 hover:text-blue-500"
                aria-label="View file"
              >
                <ExternalLinkIcon className="h-4 w-4" />
              </button>
              {file.canDelete && (
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-1 text-gray-500 hover:text-red-500"
                  aria-label="Delete file"
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedFilesList; 