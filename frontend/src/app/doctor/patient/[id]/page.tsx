"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDoctorAuth } from "@/hooks/supabase/useDoctorAuth";
import { patientService, documentService } from "@/lib/supabase/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Eye,
  AlertTriangle,
  Stethoscope,
  UserCircle,
  Activity,
  Loader2,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  phone?: string;
  address?: string;
  bloodtype?: string;
  emergencycontact?: string;
  allergies?: string[];
  condition?: string;
  created_at?: string;
  updated_at?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  created_at: string;
}

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { doctor, isAuthenticated, loading: authLoading } = useDoctorAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingDocumentId, setLoadingDocumentId] = useState<string | null>(
    null
  );

  const patientId = params.id as string;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/doctor/login");
      return;
    }

    if (doctor && patientId) {
      loadPatientDetails();
    }
  }, [authLoading, isAuthenticated, doctor, patientId, router]);

  const loadPatientDetails = async () => {
    try {
      setLoading(true);

      const patientData = await patientService.getPatientById(patientId);
      setPatient(patientData);

      const documentsData = await documentService.getPatientDocuments(
        patientId
      );
      setDocuments(documentsData || []);
    } catch (err: any) {
      console.error("Error loading patient details:", err);
      setError(
        "Failed to load patient details. You may not have access to this patient."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (document: Document) => {
    try {
      console.log("Viewing document:", document.name);
      setLoadingDocumentId(document.id);

      if (!document.path) {
        throw new Error("Document path is missing");
      }

      // Get the document URL from the storage service
      const { storageService } = await import("@/lib/supabase/storage");
      const fileUrl = await storageService.getFileUrl(document.path);

      if (!fileUrl) {
        throw new Error("Could not retrieve document URL");
      }

      // Open the document in a new tab/window
      const newWindow = window.open(fileUrl, "_blank", "noopener,noreferrer");

      if (!newWindow) {
        throw new Error(
          "Could not open document. Please check if pop-ups are blocked in your browser."
        );
      }
    } catch (error: any) {
      console.error("Error viewing document:", error);
      alert(
        `Error opening document: ${document.name}. ${
          error.message || "Please try again later."
        }`
      );
    } finally {
      setLoadingDocumentId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-muted border-t-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-2xl p-8 text-center max-w-md w-full">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-foreground">
            Access Error
          </h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button
            onClick={() => router.push("/doctor/dashboard")}
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-2xl p-8 text-center max-w-md w-full">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-foreground">
            Patient Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The requested patient could not be found.
          </p>
          <Button
            onClick={() => router.push("/doctor/dashboard")}
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/doctor/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>

            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Patient Details
                </h1>
                <p className="text-sm text-muted-foreground">
                  Comprehensive medical profile
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Patient Profile Header */}
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6 mb-8">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center shadow-lg">
                    <UserCircle className="h-12 w-12 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-4xl font-bold text-foreground mb-3">
                      {patient.name}
                    </h2>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {patient.gender}
                      </Badge>
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        Age {patient.age}
                      </Badge>
                      {patient.bloodtype && (
                        <Badge
                          variant="destructive"
                          className="text-sm px-3 py-1"
                        >
                          Blood Type {patient.bloodtype}
                        </Badge>
                      )}
                      {patient.condition && (
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          {patient.condition}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Contact Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-primary" />
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      {patient.email && (
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Email
                            </p>
                            <p className="font-medium text-foreground">
                              {patient.email}
                            </p>
                          </div>
                        </div>
                      )}
                      {patient.phone && (
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Phone className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Phone
                            </p>
                            <p className="font-medium text-foreground">
                              {patient.phone}
                            </p>
                          </div>
                        </div>
                      )}
                      {patient.address && (
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Address
                            </p>
                            <p className="font-medium text-foreground">
                              {patient.address}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-primary" />
                      Medical Information
                    </h3>
                    <div className="space-y-4">
                      {patient.emergencycontact && (
                        <div className="p-4 rounded-lg bg-accent/50">
                          <p className="text-sm text-muted-foreground mb-1">
                            Emergency Contact
                          </p>
                          <p className="font-semibold text-foreground text-lg">
                            {patient.emergencycontact}
                          </p>
                        </div>
                      )}
                      <div className="p-4 rounded-lg bg-accent/50">
                        <p className="text-sm text-muted-foreground mb-1">
                          Patient ID
                        </p>
                        <p className="font-mono text-foreground">
                          {patient.id.slice(0, 8)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-accent/50">
                        <p className="text-sm text-muted-foreground mb-1">
                          Registration Date
                        </p>
                        <p className="font-medium text-foreground">
                          {patient.created_at
                            ? new Date(patient.created_at).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allergies Alert */}
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="mt-8 p-6 bg-destructive/10 rounded-lg">
                    <div className="flex items-center space-x-2 text-destructive mb-4">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold text-lg">
                        Known Allergies
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy, index) => (
                        <Badge
                          key={index}
                          variant="destructive"
                          className="text-sm"
                        >
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical Documents */}
            <Card className="shadow-xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <span>Medical Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium text-foreground mb-2">
                      No Documents Available
                    </h3>
                    <p className="text-muted-foreground">
                      Medical documents will appear here once uploaded
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((document) => (
                      <div
                        key={document.id}
                        className="flex items-center justify-between p-6 bg-accent/20 rounded-lg hover:bg-accent/40 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-7 w-7 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground text-lg mb-1">
                              {document.name}
                            </h4>
                            <div className="flex items-center space-x-3 text-muted-foreground">
                              <span className="text-sm">{document.type}</span>
                              <span className="text-sm">•</span>
                              <span className="text-sm">
                                {(document.size / 1024).toFixed(1)} KB
                              </span>
                              <span className="text-sm">•</span>
                              <span className="text-sm">
                                {new Date(
                                  document.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleViewDocument(document)}
                          disabled={loadingDocumentId === document.id}
                          className="shadow-md hover:shadow-lg transition-all"
                        >
                          {loadingDocumentId === document.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4 mr-2" />
                          )}
                          {loadingDocumentId === document.id
                            ? "Opening..."
                            : "View"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full h-12 text-base" size="lg">
                  <FileText className="h-5 w-5 mr-2" />
                  Add Medical Note
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  <UserCircle className="h-5 w-5 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Record Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {documents.length}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                    Medical Documents
                  </div>
                </div>
                <div className="text-center p-6 bg-accent/50 rounded-lg">
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {patient.created_at
                      ? Math.floor(
                          (new Date().getTime() -
                            new Date(patient.created_at).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                    Days in System
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Patient Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center space-x-3 p-4 bg-accent/50 rounded-lg">
                  <div className="h-4 w-4 rounded-full bg-green-500"></div>
                  <span className="font-medium text-foreground">
                    Active Patient
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
