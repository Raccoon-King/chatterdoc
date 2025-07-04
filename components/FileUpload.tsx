import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileUpload(Array.from(e.dataTransfer.files));
        e.dataTransfer.clearData();
      }
    },
    [onFileUpload]
  );
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(Array.from(e.target.files));
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${
        isDragging ? 'border-brand-yellow bg-brand-mid-blue' : 'border-brand-light-blue hover:border-brand-yellow'
      }`}
    >
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center">
          <UploadIcon className={`w-12 h-12 mb-4 transition-colors duration-300 ${isDragging ? 'text-brand-yellow' : 'text-brand-light-blue'}`}/>
          <p className="font-semibold text-white">
            Drag & drop files here, or <span className="text-brand-yellow">click to browse</span>
          </p>
          <p className="text-sm text-brand-gray mt-1">Supports MS Office, Google, and PDF files</p>
        </div>
      </label>
    </div>
  );
};
