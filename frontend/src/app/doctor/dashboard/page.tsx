"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDoctorAuth } from "@/hooks/supabase/useDoctorAuth";
import { doctorService, patientService } from "@/lib/supabase/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Search,
  Users,
  Clock,
  Stethoscope,
  User,
  LogOut,
  AlertCircle,
  ChevronRight,
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

  const handleProfileClick = () => {
    router.push("/doctor/profile");
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
      <header className="bg-card shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-card-foreground tracking-tight">
                  Patient Dashboard
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Welcome back, Dr. {doctor.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileClick}
                className="h-12 w-12 rounded-full p-0 hover:bg-accent"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </Button>
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
        <div className="space-y-8">
          {/* Patient Search Section */}
          <div>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
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
                    <div className="flex items-start space-x-3 text-sm text-destructive-foreground bg-destructive/10 p-4 rounded-lg shadow-md">
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  <div className="bg-muted/30 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-card-foreground">
                        How to search:
                      </strong>{" "}
                      You can search using either the patient's unique ID or
                      their registered email address. All patient data is
                      encrypted and access is logged for security.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Recent Patients */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <span>Patient List</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPatients.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    No patients found
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Patient records will appear here after you access them.
                    Start by searching for a patient using their ID or email
                    address above.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPatients.map((recentPatient) => (
                    <div
                      key={recentPatient.patient_id}
                      onClick={() => handlePatientSelect(recentPatient)}
                      className="group flex items-center justify-between p-6 bg-card shadow-sm rounded-xl hover:bg-accent/30 hover:shadow-lg cursor-pointer transition-all duration-200"
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
        </div>
      </main>
    </div>
  );
}
