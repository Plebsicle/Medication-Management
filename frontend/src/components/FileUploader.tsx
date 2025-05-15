import React, { useState, useRef } from 'react';
// import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  acceptedFileTypes = "image/jpeg, image/png, application/pdf,image/jpg",
  maxFileSizeMB = 5
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    setErrorMessage(null);

    // Validate file type
    if (acceptedFileTypes !== "*") {
      const fileTypes = acceptedFileTypes.split(",");
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      
      if (!fileTypes.some(type => 
        type.trim() === fileExtension || 
        type.trim() === file.type
      )) {
        setErrorMessage(`File type not supported. Accepted types: ${acceptedFileTypes}`);
        return false;
      }
    }

    // Validate file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxFileSizeMB) {
      setErrorMessage(`File is too large. Maximum size allowed is ${maxFileSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (validateFile(file)) {
        onFileSelect(file);
      } else {
        onFileSelect(null);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (validateFile(file)) {
        onFileSelect(file);
      } else {
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onFileSelect(null);
      }
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
        className={`
          flex flex-col items-center justify-center
          border-2 border-dashed rounded-md
          p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
          }
        `}
        onClick={handleButtonClick}
      >
        <UploadIcon 
          className={`h-10 w-10 mb-3 ${isDragging ? 'text-primary' : 'text-gray-400'}`} 
        />
        <p className="text-sm mb-2">
          Drag & drop a file here, or <span className="text-primary font-medium">browse</span>
        </p>
        <p className="text-xs text-gray-500">
          Accepted formats: {acceptedFileTypes === "*" ? "All file types" : acceptedFileTypes.replace(/\./g, '')}
        </p>
        <p className="text-xs text-gray-500">
          Maximum size: {maxFileSizeMB}MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedFileTypes}
          onChange={handleFileSelect}
        />
      </div>
      
      {errorMessage && (
        <div className="mt-2 text-sm text-red-500">
          {errorMessage}
        </div>
      )}
    </div>
  );
}; 