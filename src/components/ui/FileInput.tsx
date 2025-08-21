
import React, { useState, useRef } from 'react';
import { PaperClipIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  error?: string;
  containerClassName?: string;
  onFileChange: (file: File | null) => void;
  fileName?: string; // To display if a file is already "uploaded" (simulated)
}

const FileInput: React.FC<FileInputProps> = ({ 
  label, 
  id, 
  error, 
  containerClassName = 'mb-4', 
  className, 
  onFileChange,
  fileName: initialFileName,
  ...props 
}) => {
  const [fileNameState, setFileNameState] = useState<string | null>(initialFileName || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileNameState(file.name);
      onFileChange(file);
    } else {
      setFileNameState(null);
      onFileChange(null);
    }
  };

  const handleRemoveFile = () => {
    setFileNameState(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the input
    }
  };

  return (
    <div className={containerClassName}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="mt-1 flex items-center">
        <label
          htmlFor={id}
          className={`relative cursor-pointer bg-white rounded-md font-medium text-bioren-blue hover:text-bioren-blue-light focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-bioren-blue-light border border-gray-300 px-3 py-2 text-sm ${className}`}
        >
          <span>{fileNameState ? 'Cambiar archivo' : 'Subir un archivo'}</span>
          <input
            id={id}
            name={id}
            type="file"
            ref={fileInputRef}
            className="sr-only"
            onChange={handleFileChange}
            {...props}
          />
        </label>
        {fileNameState && (
          <div className="ml-3 flex items-center text-sm text-gray-600">
            <PaperClipIcon className="w-5 h-5 text-gray-400 mr-1" aria-hidden="true" />
            <span>{fileNameState}</span>
            <button 
              type="button" 
              onClick={handleRemoveFile} 
              className="ml-2 text-red-500 hover:text-red-700"
              aria-label="Eliminar archivo"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      <p className="mt-1 text-xs text-gray-500">PDF, PNG, JPG hasta 2MB (simulado).</p>
    </div>
  );
};

export default FileInput;