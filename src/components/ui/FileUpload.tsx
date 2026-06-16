import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, X, File, Image as ImageIcon, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import axios from "axios";
import { authApi } from "@/lib/auth"; // using our custom axios instance for the initial requests

interface FileUploadProps {
  onUploadSuccess?: (fileData: any) => void;
  maxSizeMB?: number;
  acceptedMimeTypes?: string[];
}

export function FileUpload({
  onUploadSuccess,
  maxSizeMB = 20,
  acceptedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ],
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (selectedFile: File) => {
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      toast(`File exceeds ${maxSizeMB}MB limit`, "error");
      return false;
    }
    if (!acceptedMimeTypes.includes(selectedFile.type)) {
      toast("Invalid file type", "error");
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        processFileSelection(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        processFileSelection(selectedFile);
      }
    }
  };

  const processFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    setIsSuccess(false);
    setUploadProgress(0);

    // Create preview if it's an image
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get Presigned URL
      const presignRes = await authApi.post("/files/presign", {
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });

      const { key, uploadUrl } = presignRes.data.data;

      // 2. Upload to Cloudflare R2 directly
      // Note: We use a regular axios instance here because authApi has interceptors
      // that might inject auth headers which R2/AWS presigned URLs will reject.
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      // 3. Confirm with Backend
      const confirmRes = await authApi.post("/files/confirm", {
        key,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      });

      setIsSuccess(true);
      toast("File uploaded successfully", "success");
      
      if (onUploadSuccess) {
        onUploadSuccess(confirmRes.data.data);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast(error.response?.data?.message || "Failed to upload file", "error");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!file ? (
        <motion.div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          animate={{
            scale: isDragging ? 1.02 : 1,
            borderColor: isDragging ? "#71717A" : "#27272A",
            backgroundColor: isDragging ? "rgba(39, 39, 42, 0.5)" : "rgba(24, 24, 27, 0.3)",
          }}
          className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept={acceptedMimeTypes.join(",")}
          />
          <div className="p-3 bg-zinc-900 rounded-full mb-4">
            <UploadCloud className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-200 mb-1">
            Click or drag and drop
          </p>
          <p className="text-xs text-zinc-500">
            SVG, PNG, JPG or PDF (max. {maxSizeMB}MB)
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : file.type.includes("image") ? (
                <ImageIcon className="w-5 h-5 text-zinc-400" />
              ) : (
                <File className="w-5 h-5 text-zinc-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                {!isUploading && !isSuccess && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="p-1 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white focus:outline-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isUploading && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-zinc-400">Uploading...</span>
                    <span className="text-zinc-300 font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ ease: "linear" }}
                    />
                  </div>
                </div>
              )}

              {!isUploading && !isSuccess && (
                <button
                  type="button"
                  onClick={uploadFile}
                  className="mt-3 w-full py-2 px-4 bg-zinc-100 text-zinc-900 hover:bg-white text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  Confirm Upload
                </button>
              )}

              {isSuccess && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Upload Complete
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
