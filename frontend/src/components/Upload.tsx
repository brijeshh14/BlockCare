"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Camera,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  FileIcon,
  CheckCircle,
  Cloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/supabase";

interface UploadComponentProps {
  patientId?: string;
  onUploadComplete?: (document: any) => void;
  onIPFSUploadComplete?: (ipfsHash: string, ipfsUrl: string) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  showCamera?: boolean;
  showDragDrop?: boolean;
  showIPFSUpload?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface UploadedFile extends File {
  preview?: string;
}

interface IPFSUploadResult {
  success: boolean;
  ipfsHash?: string;
  fileName?: string;
  size?: number;
  ipfsUrl?: string;
  error?: string;
  details?: string;
}

const UploadComponent: React.FC<UploadComponentProps> = ({
  patientId,
  onUploadComplete,
  onIPFSUploadComplete,
  acceptedTypes = [".pdf", ".jpg", ".jpeg", ".png"],
  maxSize = 10,
  showCamera = true,
  showDragDrop = true,
  showIPFSUpload = false,
  className,
  children,
}) => {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [isIPFSUploading, setIsIPFSUploading] = useState(false);
  const [ipfsResult, setIpfsResult] = useState<IPFSUploadResult | null>(null);

  const { uploadFile, isUploading, progress, error } = useFileUpload();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // File validation
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(
        ", "
      )}`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      const validation = validateFile(file);
      if (validation) {
        setUploadError(validation);
        return;
      }

      setUploadError("");
      const fileWithPreview = Object.assign(file, {
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      });

      setSelectedFile(fileWithPreview);
    },
    [acceptedTypes, maxSize]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1920, height: 1080 },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
      setUploadError("");
    } catch (err) {
      setUploadError("Unable to access camera. Please check permissions.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const file = new File([blob], `camera-capture-${timestamp}.jpg`, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            handleFileSelect(file);
            stopCamera();
          }
        },
        "image/jpeg",
        0.9
      );
    }
  };

  // Handle upload to Supabase
  const handleUpload = async () => {
    if (!selectedFile || !patientId) return;

    try {
      // Upload to Supabase
      const result = await uploadFile(patientId, selectedFile, {
        description: "Uploaded via web interface",
        uploadedAt: new Date().toISOString(),
      });

      if (result.success) {
        // If we have an onUploadComplete callback, call it
        if (onUploadComplete) {
          onUploadComplete(result.document);
        }

        // Clear the selected file after successful upload
        removeFile();
      } else {
        setUploadError(
          result.error?.message || "Upload failed. Please try again."
        );
      }
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
    }
  };

  // Handle upload to IPFS
  const handleIPFSUpload = async () => {
    if (!selectedFile) return;

    setIsIPFSUploading(true);
    setUploadError("");
    setIpfsResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/ipfs", {
        method: "POST",
        body: formData,
      });

      const result: IPFSUploadResult = await response.json();

      if (result.success && result.ipfsHash) {
        setIpfsResult(result);

        // Call callback function with IPFS hash for blockchain interaction
        if (onIPFSUploadComplete && result.ipfsHash && result.ipfsUrl) {
          onIPFSUploadComplete(result.ipfsHash, result.ipfsUrl);
        }

        // Clear the selected file after successful upload
        removeFile();
      } else {
        setUploadError(result.error || "IPFS upload failed. Please try again.");
      }
    } catch (err: any) {
      setUploadError(`IPFS upload error: ${err.message || "Unknown error"}`);
    } finally {
      setIsIPFSUploading(false);
    }
  };

  // Remove selected file
  const removeFile = () => {
    if (selectedFile?.preview) {
      URL.revokeObjectURL(selectedFile.preview);
    }
    setSelectedFile(null);
    setIpfsResult(null); // Clear IPFS result too
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get file icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return ImageIcon;
    if (fileType.includes("pdf")) return FileText;
    return FileIcon;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card
      className={cn(
        "border-border shadow-lg bg-card/50 backdrop-blur-sm",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Camera Modal */}
          {isCameraOpen && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Take a Photo</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={stopCamera}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="flex justify-center space-x-4 mt-4">
                    <Button
                      onClick={capturePhoto}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Error Display */}
          {(uploadError || error) && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{uploadError || error}</p>
            </div>
          )}

          {/* Upload Progress */}
          {(isUploading || isIPFSUploading) && (
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">
                  {isIPFSUploading ? "Uploading to IPFS..." : "Uploading..."}
                </span>
                <span className="text-sm font-medium">
                  {isIPFSUploading ? "Processing..." : `${progress}%`}
                </span>
              </div>
              <div className="w-full bg-accent h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{
                    width: isIPFSUploading ? "50%" : `${progress}%`,
                    ...(isIPFSUploading && {
                      animation:
                        "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    }),
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* IPFS Upload Result */}
          {ipfsResult && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">
                    IPFS Upload Successful!
                  </h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      IPFS Hash:
                    </span>
                    <code className="block mt-1 p-2 bg-white dark:bg-gray-800 rounded text-xs break-all">
                      {ipfsResult.ipfsHash}
                    </code>
                  </div>
                  <p className="text-blue-600 dark:text-blue-400">
                    <span className="font-medium">File:</span>{" "}
                    {ipfsResult.fileName}
                  </p>
                  <p className="text-blue-600 dark:text-blue-400">
                    <span className="font-medium">Size:</span>{" "}
                    {ipfsResult.size?.toLocaleString()} bytes
                  </p>
                  {ipfsResult.ipfsUrl && (
                    <a
                      href={ipfsResult.ipfsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-blue-600 hover:underline"
                    >
                      View on IPFS Gateway →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Selected File Display */}
          {selectedFile && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {selectedFile.preview ? (
                      <img
                        src={selectedFile.preview}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {React.createElement(getFileIcon(selectedFile.type), {
                          className: "h-6 w-6 text-primary",
                        })}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {formatFileSize(selectedFile.size)} • Ready to upload
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Upload Area */}
          {!selectedFile && !isUploading && (
            <div
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/60 hover:bg-accent/20",
                showDragDrop ? "cursor-pointer" : ""
              )}
              onDragOver={showDragDrop ? handleDragOver : undefined}
              onDragLeave={showDragDrop ? handleDragLeave : undefined}
              onDrop={showDragDrop ? handleDrop : undefined}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes.join(",")}
                onChange={handleInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    {showDragDrop
                      ? "Drop your file here or click to browse"
                      : "Click to browse files"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports {acceptedTypes.join(", ")} files up to {maxSize}MB
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>

                  {showCamera && (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        startCamera();
                      }}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upload Buttons */}
          {selectedFile && (
            <div className="flex flex-col space-y-3">
              {/* Supabase Upload Button (only if patientId is provided) */}
              {patientId && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading || isIPFSUploading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8"
                    size="lg"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload to Database
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* IPFS Upload Button (if enabled) */}
              {showIPFSUpload && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleIPFSUpload}
                    disabled={isUploading || isIPFSUploading}
                    variant="outline"
                    className="font-semibold px-8 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20"
                    size="lg"
                  >
                    {isIPFSUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-700 border-t-transparent mr-2" />
                        Uploading to IPFS...
                      </>
                    ) : (
                      <>
                        <Cloud className="h-4 w-4 mr-2" />
                        Upload to IPFS
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Divider if both buttons are shown */}
              {patientId && showIPFSUpload && (
                <div className="flex items-center">
                  <div className="flex-1 border-t border-border"></div>
                  <span className="px-3 text-sm text-muted-foreground">or</span>
                  <div className="flex-1 border-t border-border"></div>
                </div>
              )}
            </div>
          )}

          {/* Custom children content */}
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadComponent;
