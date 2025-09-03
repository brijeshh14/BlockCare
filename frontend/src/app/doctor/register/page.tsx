"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Stethoscope,
  UserCheck,
  Mail,
  Key,
  ArrowLeft,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { Footer } from "@/components/ui/footer";
import { doctorService } from "@/lib/supabase/database";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const DoctorRegisterPage: React.FC = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [hospital, setHospital] = useState("");
  const [experience, setExperience] = useState("");
  const [verificationKey, setVerificationKey] = useState("");
  const [showVerificationKey, setShowVerificationKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isFormValid = () => {
    return (
      name.trim().length >= 2 &&
      isValidEmail(email) &&
      specialty.trim().length >= 2 &&
      hospital.trim().length >= 2 &&
      experience.trim().length >= 1 &&
      verificationKey.length >= 12
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 2) {
      setError("Doctor name must be at least 2 characters");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!specialty.trim() || specialty.trim().length < 2) {
      setError("Specialty must be at least 2 characters");
      return;
    }

    if (!hospital.trim() || hospital.trim().length < 2) {
      setError("Hospital name must be at least 2 characters");
      return;
    }

    if (!experience.trim()) {
      setError("Experience is required");
      return;
    }

    if (verificationKey.length < 12) {
      setError("Verification key must be at least 12 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const doctorData = {
        name,
        email,
        specialty,
        hospital,
        experience,
        verification_key: verificationKey,
      };

      await doctorService.createDoctor(doctorData);
      setSuccess(true);

      setTimeout(() => {
        router.push("/doctor/login?registered=true");
      }, 2000);
    } catch (err: any) {
      console.error("Doctor registration error:", err);
      if (err.message?.includes("duplicate key")) {
        setError(
          "A doctor with this email already exists. Please use a different email."
        );
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Registration Successful!</h1>
          <p className="text-muted-foreground mb-4">
            Your doctor account has been created successfully.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back Button */}
      <div className="p-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      {/* Registration Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card">
              <Stethoscope className="h-4 w-4 text-primary" />
              <span className="text-xs tracking-widest text-foreground/70">
                DOCTOR REGISTRATION
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-foreground">
              Create Doctor Account
            </h1>
            <p className="text-muted-foreground mt-1">
              Create your medical professional account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
          >
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  placeholder="Dr. John Smith"
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="doctor@hospital.com"
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Medical Specialty
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => {
                    setSpecialty(e.target.value);
                    setError(null);
                  }}
                  placeholder="Cardiology, Pediatrics, etc."
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            {/* Hospital */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Hospital/Clinic
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => {
                    setHospital(e.target.value);
                    setError(null);
                  }}
                  placeholder="City General Hospital"
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Years of Experience
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => {
                    setExperience(e.target.value);
                    setError(null);
                  }}
                  placeholder="5 years"
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            {/* Verification Key */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Verification Key
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <input
                  type={showVerificationKey ? "text" : "password"}
                  value={verificationKey}
                  onChange={(e) => {
                    setVerificationKey(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your medical license verification key"
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowVerificationKey(!showVerificationKey)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  {showVerificationKey ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your unique medical license verification key (minimum 12
                characters)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "Creating Account..." : "Create Doctor Account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/doctor/login"
                className="text-primary hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorRegisterPage;
