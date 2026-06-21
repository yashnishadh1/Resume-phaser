import { useState, useCallback, useRef } from "react";
import { UploadCloud, File as FileIcon, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import apiClient from "@/api/client";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  status: 'uploading' | 'success' | 'error';
  errorMsg?: string;
}

export default function ResumeUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFile = async (file: File) => {
    const id = Math.random().toString(36).substring(7);
    const newFile: UploadedFile = {
      id,
      name: file.name,
      size: formatSize(file.size),
      status: 'uploading'
    };

    setFiles(prev => [newFile, ...prev]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiClient.post('/resumes/upload', formData);

      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'success' } : f));
    } catch (error: any) {
      setFiles(prev => prev.map(f => f.id === id ? { 
        ...f, 
        status: 'error',
        errorMsg: error.response?.data?.detail || error.message || 'Upload failed'
      } : f));
    }
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    Array.from(newFiles).forEach(file => {
      uploadFile(file);
    });
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status === 'uploading'));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold text-zinc-900 mb-2 tracking-tight">Upload Resumes</h1>
        <p className="text-zinc-500">Drag and drop resumes to parse and add them to your database.</p>
      </div>

      <input 
        type="file" 
        multiple 
        accept=".pdf,.doc,.docx"
        className="hidden" 
        ref={fileInputRef}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <Card className={`bg-white border-2 border-dashed transition-all duration-200 shadow-sm ${isDragging ? 'border-[#10b981] bg-[#10b981]/5' : 'border-zinc-200 hover:border-[#10b981]/50'}`}>
        <CardContent 
          className="flex flex-col items-center justify-center py-16 px-4 text-center cursor-pointer"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4 text-[#10b981] shadow-sm">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-xl font-display font-bold text-zinc-900 mb-2">Click or drag files here to upload</h3>
          <p className="text-zinc-500 text-sm max-w-sm mb-6">
            Supported formats: PDF, DOCX. Maximum file size: 10MB per file. You can upload up to 50 files at once.
          </p>
          <Button 
            className="bg-gradient-to-r from-[#10b981] to-[#3b82f6] hover:opacity-90 text-white font-medium px-8 shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Select Files
          </Button>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-zinc-900">Upload Progress</h3>
            <Button variant="ghost" onClick={clearCompleted} className="text-zinc-500 hover:text-zinc-900 text-sm hover:bg-zinc-100" size="sm">
              Clear Completed
            </Button>
          </div>

          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center p-4 rounded-lg bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                  <FileIcon size={20} />
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-zinc-900 truncate pr-4">{file.name}</p>
                    <p className="text-xs text-zinc-500 shrink-0">{file.size}</p>
                  </div>
                  {file.status === 'uploading' && (
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#10b981] to-[#3b82f6] rounded-full w-2/3 animate-pulse" />
                    </div>
                  )}
                  {file.status === 'error' && (
                    <p className="text-xs text-red-500 font-medium">{file.errorMsg || 'Upload failed. File might be corrupted.'}</p>
                  )}
                  {file.status === 'success' && (
                    <p className="text-xs text-[#10b981] font-medium">Successfully uploaded & parsed.</p>
                  )}
                </div>
                <div className="ml-4 flex items-center gap-3 shrink-0">
                  {file.status === 'uploading' && <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />}
                  {file.status === 'success' && <CheckCircle2 className="text-[#10b981]" size={18} />}
                  {file.status === 'error' && <AlertCircle className="text-red-500" size={18} />}
                  <button onClick={() => removeFile(file.id)} className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-900 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
