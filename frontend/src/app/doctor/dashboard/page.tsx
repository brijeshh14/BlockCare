"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDoctorAuth } from "@/hooks/supabase/useDoctorAuth";
import { doctorService, patientService } from "@/lib/supabase/database";
import {
  testDatabaseConnection,
  createTestPatient,
  listAllPatients,
} from "@/lib/supabase/test-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Users,
  Clock,
  Stethoscope,
  User,
  Calendar,
  LogOut,
  AlertCircle,
  ChevronRight,
  Database,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  last_visit?: string;
}

interface RecentPatient {
  patient_id: string;
  accessed_at: string;
  patients: Patient;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const { doctor, logout, isAuthenticated, loading } = useDoctorAuth();
  const [patientId, setPatientId] = useState("");
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/doctor/login");
      return;
    }

    if (doctor) {
      loadRecentPatients();
    }
  }, [loading, isAuthenticated, doctor, router]);

  const loadRecentPatients = async () => {
    if (!doctor) return;

    try {
      const patients = await doctorService.getDoctorPatients(doctor.id);
      setRecentPatients(patients || []);
    } catch (error) {
      console.error("Error loading recent patients:", error);
    }
  };

  const handlePatientSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim() || !doctor) return;

    setIsSearching(true);
    setError(null);

    try {
      // Try to find the patient by ID first, then by email
      let patient = null;
      let searchError = null;

      console.log("Searching for patient:", patientId);

      // First try by ID
      try {
        patient = await patientService.getPatientById(patientId);
        console.log("Found patient by ID:", patient);
      } catch (idError: any) {
        console.log(
          "Patient not found by ID, trying email...",
          idError.message
        );
        searchError = idError;

        // If not found by ID, try by email
        try {
          patient = await patientService.getPatientByEmail(patientId);
          console.log("Found patient by email:", patient);
        } catch (emailError: any) {
          console.log("Patient not found by email either:", emailError.message);
          setError("Patient not found. Please check the Patient ID or email.");
          setIsSearching(false);
          return;
        }
      }

      if (!patient) {
        setError("Patient not found. Please check the Patient ID or email.");
        setIsSearching(false);
        return;
      }

      console.log("Adding patient access record...");
      // Add patient access record (don't fail if this doesn't work)
      try {
        await doctorService.addPatientAccess(doctor.id, patient.id);
        console.log("Patient access recorded successfully");
      } catch (accessError: any) {
        console.warn(
          "Failed to record patient access, but continuing:",
          accessError.message
        );
      }

      console.log("Refreshing recent patients...");
      // Refresh recent patients
      await loadRecentPatients();

      console.log("Redirecting to patient details...");
      // Redirect to patient details
      router.push(`/doctor/patient/${patient.id}`);
    } catch (err: any) {
      console.error("Error searching for patient:", err);
      setError(
        `Failed to access patient: ${err.message || "Please try again."}`
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handlePatientSelect = (patient: RecentPatient) => {
    router.push(`/doctor/patient/${patient.patients.id}`);
  };

  const handleSignOut = () => {
    logout();
    router.push("/doctor/login");
  };

  const handleDebugTest = async () => {
    setDebugInfo("Running debug tests...");

    // Test database connection
    const isConnected = await testDatabaseConnection();
    setDebugInfo((prev) => prev + `\nDatabase connected: ${isConnected}`);

    // List all patients
    const patients = await listAllPatients();
    setDebugInfo(
      (prev) => prev + `\nFound ${patients.length} patients in database`
    );

    // Create test patient
    if (patients.length === 0) {
      const testPatient = await createTestPatient();
      setDebugInfo(
        (prev) =>
          prev + `\nCreated test patient: ${testPatient ? "Success" : "Failed"}`
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !doctor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-card-foreground tracking-tight">
                  Medical Dashboard
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Welcome back, Dr. {doctor.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex items-center space-x-3 px-4 py-2 rounded-lg bg-accent/10 border border-border/50">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-card-foreground">
                    {doctor.name}
                  </span>
                  <Badge variant="secondary" className="text-xs w-fit">
                    {doctor.specialty || "Doctor"}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold text-card-foreground mb-2">
              Patient Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Access patient records securely and manage your medical practice
              efficiently.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Patient Search Section */}
          <div className="xl:col-span-3">
            <Card className="shadow-md">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <span>Access Patient Records</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePatientSearch} className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Enter patient ID or email address"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        className="h-14 text-base px-4 border-2 focus:border-primary transition-colors"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSearching || !patientId.trim()}
                      size="lg"
                      className="h-14 px-8 font-semibold min-w-[140px]"
                    >
                      {isSearching ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                          <span>Searching...</span>
                        </div>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Access Records
                        </>
                      )}
                    </Button>
                  </div>

                  {error && (
                    <div className="flex items-start space-x-3 text-sm text-destructive-foreground bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-card-foreground">
                        How to search:
                      </strong>{" "}
                      You can search using either the patient's unique ID or
                      their registered email address. All patient data is
                      encrypted and access is logged for security.
                    </p>
                  </div>

                  {/* Debug Section */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Debug Tools (Development Only)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDebugTest}
                        className="text-xs"
                      >
                        <Database className="h-3 w-3 mr-1" />
                        Test DB
                      </Button>
                    </div>
                    {debugInfo && (
                      <pre className="text-xs text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">
                        {debugInfo}
                      </pre>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Doctor Info Panel */}
          <div className="xl:col-span-1">
            <Card className="shadow-md h-fit sticky top-8">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span>Doctor Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Full Name
                    </label>
                    <p className="text-base font-medium text-card-foreground">
                      {doctor.name}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Specialty
                    </label>
                    <p className="text-base font-medium text-card-foreground">
                      {doctor.specialty || "Medical Professional"}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Experience
                    </label>
                    <p className="text-base font-medium text-card-foreground">
                      {doctor.experience || "Not specified"}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Hospital/Clinic
                    </label>
                    <p className="text-base font-medium text-card-foreground">
                      {doctor.hospital || "Not specified"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Patients */}
        <section className="mt-12">
          <Card className="shadow-md">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <span>Recent Patients</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPatients.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    No recent patients
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Patient records will appear here after you access them.
                    Start by searching for a patient using their ID or email
                    address above.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPatients.map((recentPatient, index) => (
                    <div
                      key={recentPatient.patient_id}
                      onClick={() => handlePatientSelect(recentPatient)}
                      className="group flex items-center justify-between p-6 border border-border rounded-xl hover:bg-accent/30 hover:border-accent cursor-pointer transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <p className="font-semibold text-card-foreground text-lg group-hover:text-primary transition-colors">
                            {recentPatient.patients.name}
                          </p>
                          <p className="text-muted-foreground">
                            <span className="font-medium">
                              {recentPatient.patients.condition}
                            </span>
                            <span className="mx-2">•</span>
                            <span>Age {recentPatient.patients.age}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Last Accessed
                          </p>
                          <p className="text-sm font-semibold text-card-foreground mt-1">
                            {new Date(
                              recentPatient.accessed_at
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
