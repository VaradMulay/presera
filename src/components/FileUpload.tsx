import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthContext';
import { uploadResume, validateResumeFile, type ResumeRecord } from '@/lib/resumeStorage';

interface FileUploadProps {
  label?: string;
  hint?: string;
  accept?: string;
  onUploaded?: (resume: ResumeRecord | null) => void;
  className?: string;
}

export function FileUpload({
  label = 'Resume',
  hint = 'PDF, DOC, or DOCX up to 5MB',
  accept = '.pdf,.doc,.docx',
  onUploaded,
  className,
}: FileUploadProps) {
  const { fullUser } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<ResumeRecord | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFile = async (f: File | undefined) => {
    if (!f) return;
    if (!fullUser?.id) {
      setError('You must be signed in to upload a resume.');
      return;
    }

    const validationError = validateResumeFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setUploading(true);
    setProgress(0);

    const { data, error: uploadError } = await uploadResume(fullUser.id, f, (pct) => {
      setProgress(pct);
    });

    setUploading(false);

    if (uploadError || !data) {
      setError(uploadError ?? 'Upload failed. Please try again.');
      return;
    }

    setUploaded(data);
    onUploaded?.(data);
  };

  const handleRemove = () => {
    setUploaded(null);
    setProgress(0);
    setError('');
    onUploaded?.(null);
  };

  return (
    <div className={cn('w-full', className)}>
      {label && <p className="mb-1.5 text-sm font-semibold text-slate-200">{label}</p>}

      {error && (
        <div className="mb-2 flex items-start gap-2 rounded-lg border border-error-400/20 bg-error-500/10 px-3 py-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-400" />
          <p className="text-sm text-error-300">{error}</p>
        </div>
      )}

      {!uploaded && !uploading && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition backdrop-blur-sm',
            dragging ? 'border-brand-400 bg-brand-500/10' : 'border-white/15 bg-white/5 hover:border-brand-400/50 hover:bg-white/10',
          )}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 border border-white/15">
            <Upload className="h-5 w-5 text-brand-400" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-300">
            <span className="text-brand-400">Click to upload</span> or drag and drop
          </p>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {uploading && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-brand-400/20 bg-brand-500/10 backdrop-blur-sm px-6 py-8 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-400/20 border-t-brand-400" />
          <p className="mt-3 text-sm font-medium text-slate-300">Uploading… {progress}%</p>
          <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300 progress-glow text-brand-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {uploaded && !uploading && (
        <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 backdrop-blur-md p-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success-500/15 border border-success-400/20">
            <FileText className="h-5 w-5 text-success-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{uploaded.file_name}</p>
            <p className="text-xs text-slate-500">
              {uploaded.file_size ? `${(uploaded.file_size / 1024).toFixed(1)} KB · ` : ''}Uploaded successfully
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
