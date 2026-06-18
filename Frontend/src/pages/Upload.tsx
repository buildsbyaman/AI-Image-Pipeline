import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileImage, AlertTriangle, CloudUpload, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { useCreateJob } from '@/hooks/useJobs';
import { presignUpload, confirmUpload } from '@/api/files';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { mutateAsync: createJob, isPending: isCreatingJob } = useCreateJob();
  const navigate = useNavigate();

  const handleUpload = async (fileToUpload: File) => {
    setFile(fileToUpload);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Presign URL
      const { key, uploadUrl } = await presignUpload({
        fileName: fileToUpload.name,
        mimeType: fileToUpload.type,
        fileSize: fileToUpload.size,
      });

      // 2. Direct Upload to R2
      await axios.put(uploadUrl, fileToUpload, {
        headers: {
          'Content-Type': fileToUpload.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 95) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      // 3. Confirm Upload
      await confirmUpload({
        key,
        originalName: fileToUpload.name,
        mimeType: fileToUpload.type,
        size: fileToUpload.size,
      });

      // 4. Create Job
      setUploadProgress(100);
      const response = await createJob(key);

      toast.success('Image uploaded successfully');
      // Delay navigation slightly to let the user see the 100% completed status
      setTimeout(() => {
        navigate(`/jobs/${response.jobId}`);
      }, 300);
    } catch (error: any) {
      toast.error('Failed to upload image. Please check your connection and try again.');
      setFile(null);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleUpload(acceptedFiles[0]);
      }
    },
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        toast.error('File is larger than 5MB limit');
      } else if (error?.code === 'file-invalid-type') {
        toast.error('Only JPG, PNG and WebP formats are supported');
      } else {
        toast.error('Invalid file');
      }
    }
  });

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              Upload Image 
              <Sparkles className="text-zinc-400 w-5 h-5 animate-pulse" />
            </h1>
            <p className="text-zinc-400 mt-1">Start a new AI processing pipeline</p>
          </div>
        </div>

        <div className="bg-[#111113]/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden h-[330px] flex flex-col justify-center">
          <div className="relative h-[280px] w-full">
            <AnimatePresence>
              {isUploading || isCreatingJob ? (
                <motion.div 
                  key="uploading-state"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center w-full"
                >
                  <div className="relative mb-6">
                    {/* Outer glowing pulsing ring */}
                    <motion.div 
                      className="absolute -inset-4 bg-white/5 rounded-full blur-xl"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    {/* Rotating border ring */}
                    <div className="relative w-24 h-24 rounded-full border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle 
                          cx="48" 
                          cy="48" 
                          r="44" 
                          className="stroke-zinc-900" 
                          strokeWidth="4" 
                          fill="transparent"
                        />
                        <circle 
                          cx="48" 
                          cy="48" 
                          r="44" 
                          className="stroke-zinc-100 transition-[stroke-dashoffset] duration-150 ease-out" 
                          strokeWidth="4" 
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 44}
                          strokeDashoffset={(2 * Math.PI * 44) * (1 - uploadProgress / 100)}
                        />
                      </svg>
                      
                      {/* Animated Cloud Icon */}
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <CloudUpload className="text-zinc-300 w-10 h-10" />
                      </motion.div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                    {uploadProgress === 100 ? 'Finalizing...' : 'Uploading Image...'}
                  </h3>
                  <p className="text-sm text-zinc-400 max-w-sm mb-6">
                    Sending {file?.name} to the pipeline server.
                  </p>

                  <div className="w-64">
                    <div className="flex justify-between items-center text-xs text-zinc-500 mb-2 font-mono">
                      <span>PROGRESS</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                      <div 
                        className="bg-[#FAFAFA] h-full rounded-full transition-[width] duration-150 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div 
                  {...getRootProps()} 
                  className={`absolute inset-0 border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center w-full
                    ${isDragActive ? 'border-zinc-500 bg-zinc-800/30 shadow-[0_0_20px_rgba(255,255,255,0.03)]' : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/10'}
                    ${isDragReject ? 'border-red-500/80 bg-red-950/10' : ''}
                  `}
                >
                  <input {...getInputProps()} />
                  <motion.div 
                    key="dropzone-state"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="flex flex-col items-center justify-center w-full"
                  >
                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 hover:scale-105 transition-transform duration-200">
                      <UploadIcon className="text-zinc-400" size={28} />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-200 mb-2">Drag & drop an image here</h3>
                    <p className="text-sm text-zinc-500 mb-6">or click to browse from your computer</p>
                    
                    <div className="flex items-center justify-center gap-6 text-xs text-zinc-600">
                      <div className="flex items-center gap-1.5">
                        <FileImage size={14} />
                        <span>JPG, PNG, WebP</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle size={14} />
                        <span>Up to 5MB</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
