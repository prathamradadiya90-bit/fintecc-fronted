import React, { useRef, useState } from 'react';
import { UploadCloud, File as FileIcon, X, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function FileUploader({ onFileSelect, isLoading = false }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB.');
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 rounded-full bg-[#00C2B3] text-white flex items-center justify-center font-semibold text-xs">
          2
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Upload PDF File</h2>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all text-center
          ${dragActive ? 'border-[#00C2B3] bg-[#00C2B3]/5' : 'border-slate-300 hover:border-[#00C2B3]/50 hover:bg-slate-50'}
          ${selectedFile ? 'border-[#00C2B3]/30 bg-[#00C2B3]/5' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept="application/pdf"
          onChange={handleChange}
          className="hidden"
          id="pdf-upload"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <Loader2 className="w-10 h-10 text-[#00C2B3] animate-spin" />
            <p className="text-slate-600 font-medium">Processing your document...</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <div className="w-14 h-14 bg-[#00C2B3]/10 text-[#00C2B3] rounded-full flex items-center justify-center mb-2">
              <FileIcon className="w-7 h-7" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-slate-800 text-[15px] truncate max-w-[300px]" title={selectedFile.name}>
                {selectedFile.name}
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="mt-2 text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <X className="w-4 h-4" /> Remove File
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-4">
              <UploadCloud className="w-7 h-7" />
            </div>
            <label htmlFor="pdf-upload" className="cursor-pointer">
              <h3 className="text-[15px] font-semibold text-slate-800 mb-1">
                Drag & drop your PDF here or <span className="text-[#00C2B3] hover:text-[#00a89b]">browse files</span>
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                PDF only &middot; Max 20MB
              </p>
            </label>
          </>
        )}

        {error && (
          <div className="absolute bottom-4 text-red-500 text-sm font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
