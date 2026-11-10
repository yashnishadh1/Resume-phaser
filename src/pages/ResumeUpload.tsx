import { useState, useCallback, useRef } from "react";
import { isAxiosError } from "axios";
import { UploadCloud, File as FileIcon, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import apiClient from "@/api/client";
import { usePageMetadata } from "@/lib/seo";
import { useToast } from "@/components/ToastProvider";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  status: 'uploading' | 'success' | 'error';
  errorMsg?: string;
}

export default function ResumeUpload() {
  usePageMetadata({ title: "Upload resumes | HireLens", description: "Upload PDF or DOCX resumes for analysis in your private HireLens workspace.", path: "/dashboard/upload", noIndex: true });
  const toast = useToast();
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

  const uploadFile = useCallback(async (file: File) => {
    const id = crypto.randomUUID();
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
      toast(`${file.name} uploaded successfully. Resume analysis has been queued.`, "success");
    } catch (error: unknown) {
      const detail = isAxiosError(error) ? (error.response?.data as { detail?: unknown } | undefined)?.detail : undefined;
      const errorMessage = typeof detail === "string" ? detail : isAxiosError(error) && !error.response ? "Unable to connect to the server. Check your connection and try again." : "Upload failed. Please try again.";
      setFiles(prev => prev.map(f => f.id === id ? { 
        ...f, 
        status: 'error',
        errorMsg: errorMessage
      } : f));
      toast(`Failed to upload ${file.name}. ${errorMessage}`, "error");
    }
  }, [toast]);

  const handleFiles = useCallback((newFiles: FileList | File[] | null) => {
    if (!newFiles) return;
    const selected = Array.from(newFiles);
    if (selected.length > 50) {
      toast("Select no more than 50 files at once.", "error");
      return;
    }
    selected.forEach(file => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "docx"].includes(extension || "")) {
        toast(`${file.name} was skipped. Choose a PDF or DOCX file.`, "error");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast(`${file.name} was skipped because it exceeds the 10 MB limit.`, "error");
        return;
      }
      void uploadFile(file);
    });
  }, [toast, uploadFile]);

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
  }, [handleFiles]);

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status === 'uploading'));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-100 mb-2 tracking-tight">Upload Resumes</h1>
        <p className="text-slate-400">Drag and drop resumes to parse and add them to your database.</p>
      </div>

      <input 
        type="file" 
        multiple 
        accept=".pdf,.docx"
        className="hidden" 
        ref={fileInputRef}
        onChange={(e) => { handleFiles(e.target.files); e.currentTarget.value = ""; }}
      />

      <Card className={`bg-slate-900 border-2 border-dashed transition-all duration-200 shadow-sm ${isDragging ? 'border-[#4F46E5] bg-[#4F46E5]/5' : 'border-slate-700 hover:border-[#4F46E5]/50'}`}>
        <CardContent 
          className="flex flex-col items-center justify-center py-16 px-4 text-center cursor-pointer"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-800 flex items-center justify-center mb-4 text-[#4F46E5] shadow-sm">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-xl font-display font-bold text-slate-100 mb-2">Choose files or drag them here to upload</h3>
          <p className="text-slate-400 text-sm max-w-sm mb-6">
            Supported formats: PDF, DOCX. Maximum file size: 10MB per file. You can upload up to 50 files at once.
          </p>
          <Button 
            className="bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:opacity-90 text-white font-medium px-8 shadow-md"
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
            <h3 className="font-display font-semibold text-slate-100">Upload Progress</h3>
            <Button variant="ghost" onClick={clearCompleted} className="text-slate-400 hover:text-slate-100 text-sm hover:bg-slate-800" size="sm">
              Clear Completed
            </Button>
          </div>

          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center p-4 rounded-lg bg-slate-900 border border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <FileIcon size={20} />
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-100 truncate pr-4">{file.name}</p>
                    <p className="text-xs text-slate-400 shrink-0">{file.size}</p>
                  </div>
                  {file.status === 'uploading' && (
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#4F46E5] to-[#2563EB] rounded-full w-2/3 animate-pulse" />
                    </div>
                  )}
                  {file.status === 'error' && (
                    <p className="text-xs text-red-500 font-medium">{file.errorMsg || 'Upload failed. File might be corrupted.'}</p>
                  )}
                  {file.status === 'success' && (
                    <p className="text-xs text-[#4F46E5] font-medium">Uploaded successfully. Analysis queued.</p>
                  )}
                </div>
                <div className="ml-4 flex items-center gap-3 shrink-0">
                  {file.status === 'uploading' && <div role="status" aria-label={`Uploading ${file.name}`} className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />}
                  {file.status === 'success' && <CheckCircle2 className="text-[#4F46E5]" size={18} />}
                  {file.status === 'error' && <AlertCircle className="text-red-500" size={18} />}
                  <button type="button" disabled={file.status === 'uploading'} aria-label={`Remove ${file.name} from upload list`} onClick={() => removeFile(file.id)} className="min-h-11 min-w-11 rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40">
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
