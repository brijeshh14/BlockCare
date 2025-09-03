"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Footer } from "@/components/ui/footer";
import { useAuth } from "@/hooks/supabase/useAuth";
import { patientService, documentService } from "@/lib/supabase/database";
import { storageService } from "@/lib/supabase/storage";
import {
  testSupabaseConnection,
  testStorageOperations,
} from "@/lib/supabase/test";
import { Patient, Document } from "@/types/medical";
import {
  DashboardHeader,
  WelcomeSection,
  PatientProfile,
  DocumentsSection,
} from "@/components/patient";

const PatientDashboard: React.FC = () => {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/patient/login");
    }
  }, [user, authLoading, router]);

  // Load patient data
  useEffect(() => {
    const loadPatientData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Try to get patient record using email
        try {
          const patientData = await patientService.getPatientByEmail(
            user.email || ""
          );
          setPatient(patientData);

          // Get patient documents
          const documentsData = await documentService.getPatientDocuments(
            patientData.id
          );
          setDocuments(documentsData);
        } catch (patientErr) {
          // If no patient record exists, create a default one

          // Create a temporary patient object with user data
          const defaultPatient: Patient = {
            id: "temp-" + user.id,
            name: user.email?.split("@")[0] || "Patient",
            email: user.email || null,
            age: 25,
            gender: "not specified",
            phone: "Not provided",
            address: "Not provided",
            bloodtype: "Not specified",
            emergencycontact: "Not provided",
            allergies: null,
            condition: "General",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          setPatient(defaultPatient);
          setDocuments([]); // No documents for new users
        }
      } catch (err: any) {
        console.error("Error loading patient data:", err);
        setError("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    if (user && !authLoading) {
      loadPatientData();
    }
  }, [user, authLoading]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/patient/login");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!patient) return;

    // Prevent upload for temporary patients
    if (patient.id.startsWith("temp-")) {
      setError("Please complete your profile before uploading documents.");
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "File type not supported. Please use PDF, JPG, PNG, DOC, or DOCX files."
      );
      return;
    }

    try {
      setUploading(true);
      setError(null); // Clear any previous errors

      console.log("=== Upload Debug Info ===");
      console.log("Patient ID:", patient.id);
      console.log("File:", file.name, file.type, file.size);

      // Step 1: Initialize storage buckets
      console.log("Step 1: Initializing buckets...");
      await storageService.initializeBuckets();
      console.log("Step 1: Buckets initialized successfully");

      // Step 2: Upload file to storage
      console.log("Step 2: Uploading file to storage...");
      const uploadResult = await storageService.uploadFile(patient.id, file);
      console.log("Step 2: File uploaded successfully:", uploadResult);

      // Step 3: Create document record in database
      console.log("Step 3: Creating document record...");
      const documentData = {
        patient_id: patient.id,
        name: file.name,
        type: file.type,
        size: file.size,
        path: uploadResult.path,
        metadata: {
          originalName: file.name,
          uploadDate: new Date().toISOString(),
          contentType: file.type,
        },
      };

      const newDocument = await documentService.createDocument(documentData);
      console.log("Step 3: Document record created:", newDocument);

      setDocuments((prev) => [newDocument, ...prev]);
      setShowUpload(false);

      // Show success message
      setSuccessMessage(`Successfully uploaded "${file.name}"`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error("Upload error:", err);
      console.log("Error details:", {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
        stack: err.stack,
      });

      let errorMessage = "Failed to upload file";
      if (err.message?.includes("Policy")) {
        errorMessage = "Access denied. Please check your authentication.";
      } else if (err.message?.includes("duplicate")) {
        errorMessage = "A file with this name already exists.";
      } else if (err.message?.includes("size")) {
        errorMessage = "File is too large. Please use a smaller file.";
      } else if (err.message) {
        errorMessage = `Upload failed: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = async (document: Document) => {
    try {
      setError(null);
      const url = await storageService.getFileUrl(document.path);
      window.open(url, "_blank");
    } catch (err: any) {
      console.error("Error viewing document:", err);
      setError(`Failed to view document "${document.name}". Please try again.`);
    }
  };

  const formatAllergies = (allergies: string[] | null) => {
    if (!allergies || allergies.length === 0) return "None known";
    return allergies.join(", ");
  };

  // Debug function to test Supabase connection
  const runConnectionTest = async () => {
    console.log("=== Running Supabase Connection Test ===");
    const connectionResult = await testSupabaseConnection();
    const storageResult = await testStorageOperations();

    console.log("Connection Test Results:", connectionResult);
    console.log("Storage Test Results:", storageResult);

    // Show results in UI
    if (
      connectionResult.auth &&
      connectionResult.database &&
      connectionResult.storage
    ) {
      setSuccessMessage("✅ All Supabase services are working correctly!");
    } else {
      setError(
        `❌ Some services failed: ${JSON.stringify(connectionResult.details)}`
      );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if there's an issue
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated (redirect should handle this)
  if (!user) {
    return null;
  }

  // Show message if patient data couldn't be loaded
  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome!</h1>
          <p className="text-muted-foreground mb-4">
            Setting up your profile... Please wait a moment.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader
        user={user}
        onSignOut={handleSignOut}
        onTestConnection={runConnectionTest}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <WelcomeSection patient={patient} successMessage={successMessage} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Information */}
          <div className="lg:col-span-1">
            <PatientProfile patient={patient} userId={user.id} />
          </div>

          {/* Documents Section */}
          <div className="lg:col-span-2">
            <DocumentsSection
              documents={documents}
              patient={patient}
              showUpload={showUpload}
              error={error}
              uploading={uploading}
              onToggleUpload={() => {
                setShowUpload(!showUpload);
                setError(null);
                setSuccessMessage(null);
              }}
              onFileUpload={handleFileUpload}
              onViewDocument={handleViewDocument}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PatientDashboard;
