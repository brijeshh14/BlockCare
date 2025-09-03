"use client";

import React from "react";
import { FileText, Plus } from "lucide-react";
import { Document, Patient } from "@/types/medical";
import UploadComponent from "../Upload";
import { DocumentsList } from "./DocumentsList";

interface DocumentsSectionProps {
  documents: Document[];
  patient: Patient;
  showUpload: boolean;
  error: string | null;
  uploading: boolean;
  onToggleUpload: () => void;
  onFileUpload: (file: File) => void;
  onViewDocument: (document: Document) => void;
  onUploadComplete?: (document: any) => void;
  onIPFSUploadComplete?: (ipfsHash: string, ipfsUrl: string) => void;
}
export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents,
  patient,
  showUpload,
  error,
  uploading,
  onToggleUpload,
  onFileUpload,
  onViewDocument,
  onUploadComplete,
  onIPFSUploadComplete,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Medical Documents
          </h3>
        </div>
        <button
          onClick={onToggleUpload}
          disabled={patient.id.startsWith("temp-")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
          title={
            patient.id.startsWith("temp-")
              ? "Complete your profile to upload documents"
              : "Upload a new document"
          }
        >
          <Plus className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {showUpload && (
        <div className="mb-6">
          <UploadComponent
            patientId={!patient.id.startsWith("temp-") ? patient.id : undefined}
            onUploadComplete={onUploadComplete}
            onIPFSUploadComplete={onIPFSUploadComplete}
            acceptedTypes={[".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]}
            maxSize={10}
            showCamera={true}
            showDragDrop={true}
            showIPFSUpload={true}
            showSupabaseUpload={true}
            className="bg-muted/50"
          />
        </div>
      )}
      <DocumentsList
        documents={documents}
        patient={patient}
        onViewDocument={onViewDocument}
      />
    </div>
  );
};
