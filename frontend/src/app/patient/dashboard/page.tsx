"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Droplets,
  Shield,
  Upload,
  FileText,
  Eye,
  LogOut,
  Settings,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Footer } from "@/components/ui/footer";
import { useAuth } from "@/hooks/supabase/useAuth";
import { patientService, documentService } from "@/lib/supabase/database";
import { storageService } from "@/lib/supabase/storage";
import {
  testSupabaseConnection,
  testStorageOperations,
} from "@/lib/supabase/test";
import { Patient, Document } from "@/types/medical";

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
      setError(null); // Clear any previous errors
      const url = await storageService.getFileUrl(document.path);
      window.open(url, "_blank");
    } catch (err: any) {
      console.error("Error viewing document:", err);
      setError(`Failed to view document "${document.name}". Please try again.`);
    }
  };

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
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
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
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  BlockCare
                </h1>
                <p className="text-xs text-muted-foreground">
                  Patient Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground mr-2">
                Welcome, {user.email}
              </div>
              <button
                onClick={runConnectionTest}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-xs"
                title="Test Supabase Connection"
              >
                🔧 Test
              </button>
              <button
                onClick={() => router.push("/patient/settings")}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5 text-muted-foreground" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            Welcome back, {patient.name}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your medical records and health information securely.
          </p>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {successMessage}
                </p>
              </div>
            </div>
          )}

          {/* Profile Incomplete Banner */}
          {patient.id.startsWith("temp-") && (
            <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    To get the most out of BlockCare, please complete your
                    medical profile with accurate information.
                  </p>
                  <button
                    onClick={() => router.push("/patient/register")}
                    className="mt-2 text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:underline"
                  >
                    Complete Profile →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Information */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Your Profile
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-mono text-sm font-medium text-foreground break-all">
                      {user.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium text-foreground">
                      {patient.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">
                      {patient.email || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">
                      {patient.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium text-foreground">
                      {patient.age ? `${patient.age} years` : "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium text-foreground">
                      {patient.gender || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Type</p>
                    <p className="font-medium text-foreground">
                      {patient.bloodtype || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Emergency Contact
                    </p>
                    <p className="font-medium text-foreground">
                      {patient.emergencycontact || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium text-foreground">
                      {patient.address || "Not provided"}
                    </p>
                  </div>
                </div>

                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Allergies</p>
                      <p className="font-medium text-foreground">
                        {formatAllergies(patient.allergies)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="lg:col-span-2">
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
                  onClick={() => {
                    setShowUpload(!showUpload);
                    setError(null); // Clear any errors when toggling upload
                    setSuccessMessage(null); // Clear success message
                  }}
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

              {/* Upload Component */}
              {showUpload && (
                <div className="mb-6 p-6 rounded-lg border border-dashed border-border bg-muted/50">
                  {/* Error Display */}
                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {error}
                        </p>
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
                        if (file) handleFileUpload(file);
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
              )}

              {/* Documents List */}
              {documents.length === 0 ? (
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
              ) : (
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
                          <p className="font-medium text-foreground">
                            {document.name}
                          </p>
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
                          onClick={() => handleViewDocument(document)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="View Document"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PatientDashboard;
