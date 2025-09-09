"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDoctorAuth } from "@/hooks/supabase/useDoctorAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Stethoscope,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Building,
} from "lucide-react";

export default function DoctorProfile() {
  const router = useRouter();
  const { doctor, isAuthenticated, loading } = useDoctorAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/doctor/login");
    }
  }, [loading, isAuthenticated, router]);

  const handleBackToDashboard = () => {
    router.push("/doctor/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">
            Loading profile...
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-card-foreground tracking-tight">
                Doctor Profile
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Profile Header Card */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-200">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-3xl font-bold text-card-foreground mb-2">
                    Dr. {doctor.name}
                  </h2>
                  <Badge
                    variant="secondary"
                    className="text-base px-3 py-1 mb-4"
                  >
                    {doctor.specialty || "Medical Professional"}
                  </Badge>
                  <p className="text-muted-foreground text-lg">
                    {doctor.experience || "Medical Practitioner"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl">
                <Mail className="h-5 w-5 text-primary" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email Address
                    </p>
                    <p className="text-base font-semibold text-card-foreground">
                      {doctor.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Doctor ID
                    </p>
                    <p className="text-base font-semibold text-card-foreground font-mono">
                      {doctor.id}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl">
                <Award className="h-5 w-5 text-primary" />
                <span>Professional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Stethoscope className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Medical Specialty
                    </p>
                    <p className="text-base font-semibold text-card-foreground">
                      {doctor.specialty || "General Medicine"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Years of Experience
                    </p>
                    <p className="text-base font-semibold text-card-foreground">
                      {doctor.experience || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Building className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Hospital/Clinic
                    </p>
                    <p className="text-base font-semibold text-card-foreground">
                      {doctor.hospital || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Member Since
                    </p>
                    <p className="text-base font-semibold text-card-foreground">
                      {doctor.created_at
                        ? new Date(doctor.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Information */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl">
                <Award className="h-5 w-5 text-primary" />
                <span>Account Verification</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3">
                <Award className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Verification Status
                  </p>
                  <Badge variant="default" className="mt-1">
                    Verified Doctor
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleBackToDashboard}
              className="px-8"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
