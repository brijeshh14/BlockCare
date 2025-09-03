"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FileText, Eye, User } from "lucide-react";
import { Document, Patient } from "@/types/medical";

interface DocumentsListProps {
  documents: Document[];
  patient: Patient;
  onViewDocument: (document: Document) => void;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({
  documents,
  patient,
  onViewDocument,
}) => {
  const router = useRouter();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-foreground mb-2">
          No Documents Yet
        </h4>
        <p className="text-muted-foreground mb-4">
          {patient.id.startsWith("temp-")
            ? "Complete your profile to start uploading medical documents."
            : "Upload your first medical document to get started."}
        </p>
        {patient.id.startsWith("temp-") && (
          <button
            onClick={() => router.push("/patient/register")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <User className="h-4 w-4" />
            Complete Profile
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{document.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{document.type}</span>
                <span>•</span>
                <span>{formatFileSize(document.size)}</span>
                <span>•</span>
                <span>{formatDate(document.created_at!)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDocument(document)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="View Document"
            >
              <Eye className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
