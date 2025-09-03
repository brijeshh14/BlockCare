"use client";

import React from "react";
import { Upload, Plus, AlertCircle } from "lucide-react";

interface DocumentUploadProps {
  error: string | null;
  uploading: boolean;
  onFileUpload: (file: File) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  error,
  uploading,
  onFileUpload,
}) => {
  return (
    <div className="mb-6 p-6 rounded-lg border border-dashed border-border bg-muted/50">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <div className="text-center">
        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium text-foreground mb-1">
          Upload Medical Document
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Supported: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
        </p>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileUpload(file);
          }}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition-colors ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
              Uploading...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Choose File
            </>
          )}
        </label>
      </div>
    </div>
  );
};
