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
    <div
      className="rounded-2xl p-6 shadow-sm"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 rounded-full bg-[#00C2B3] text-white flex items-center justify-center font-semibold text-xs">
          2
        </div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Upload PDF File</h2>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all text-center
          ${dragActive ? 'border-[#00C2B3] bg-[#00C2B3]/5' : ''}
          ${selectedFile ? 'border-[#00C2B3]/30 bg-[#00C2B3]/5' : ''}
        `}
        style={{
          borderColor: (!dragActive && !selectedFile) ? 'var(--color-border)' : undefined,
        }}
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
            <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Processing your document...</p>
          </div>
        ) : selectedFile ? (
          <div
            className="flex items-center justify-between w-full max-w-md p-4 rounded-xl shadow-sm"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#00C2B3]/10 text-[#00C2B3] rounded-full flex items-center justify-center shrink-0">
                <FileIcon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-[15px] truncate max-w-[220px]" style={{ color: 'var(--color-text-primary)' }} title={selectedFile.name}>
                  {selectedFile.name}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 text-red-400 hover:text-red-500 rounded-lg transition-colors"
              title="Remove File"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--color-bg-skeleton)', color: 'var(--color-text-secondary)' }}>
              <UploadCloud className="w-7 h-7" />
            </div>
            <label htmlFor="pdf-upload" className="cursor-pointer">
              <h3 className="text-[15px] font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Drag & drop your PDF here or <span className="text-[#00C2B3] hover:text-[#00a89b]">browse files</span>
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
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
