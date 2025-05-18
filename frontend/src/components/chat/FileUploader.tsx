import React, { useRef, useState } from 'react';
import { fileApi } from '../../lib/api/files';
import { PaperclipIcon } from 'lucide-react';

interface FileUploaderProps {
  doctorId: number;
  patientId: number;
  onUploadSuccess: () => void;
  onUploadError: (error: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  doctorId,
  patientId,
  onUploadSuccess,
  onUploadError
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      onUploadError('File size must be less than 5MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError('Only images, PDFs, and Word documents are allowed');
      return;
    }

    try {
      setIsUploading(true);
      await fileApi.uploadFile(file, doctorId, patientId);
      onUploadSuccess();
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      onUploadError('Failed to upload file. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleFileSelect}
        disabled={isUploading}
        className={`p-2 rounded-full focus:outline-none ${
          isUploading ? 'text-gray-400' : 'text-gray-500 hover:text-blue-500'
        }`}
        aria-label="Attach file"
      >
        {isUploading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        ) : (
          <PaperclipIcon className="h-5 w-5" />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
      />
    </>
  );
};

export default FileUploader; 