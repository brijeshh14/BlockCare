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
  UserPlus,
} from "lucide-react";
import { Footer } from "@/components/ui/footer";
import { useDoctorAuth } from "@/hooks/supabase/useDoctorAuth";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const DoctorLoginPage: React.FC = () => {
  const router = useRouter();
  const { login } = useDoctorAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [verificationKey, setVerificationKey] = useState("");
  const [showVerificationKey, setShowVerificationKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = () => {
    return (
      name.trim().length >= 2 &&
      isValidEmail(email) &&
      verificationKey.length >= 8
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

    if (verificationKey.length < 8) {
      setError("Verification key must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await login(name, email, verificationKey);

      if (success) {
        router.push("/doctor/dashboard");
      } else {
        setError(
          "Invalid credentials. Please check your name, email, and verification key."
        );
      }
    } catch (err: any) {
      console.error("Doctor login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back Button */}
      <div className="p-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Main Login
        </Link>
      </div>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card">
              <Stethoscope className="h-4 w-4 text-primary" />
              <span className="text-xs tracking-widest text-foreground/70">
                MEDICAL PROFESSIONAL LOGIN
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-foreground">
              Welcome Back, Doctor
            </h1>
            <p className="text-muted-foreground mt-1">
              Enter your credentials to access the medical dashboard
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Doctor Name
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
            <div className="mb-4">
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

            {/* Verification Key */}
            <div className="mb-6">
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
                  placeholder="Enter your verification key"
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
                Your unique medical license verification key
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className="w-full mb-4 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "Verifying..." : "Login to Dashboard"}
            </button>

            {/* Support Link */}
            <div className="text-center">
              <Link
                href="/contact"
                className="text-sm text-primary hover:underline"
              >
                Need help with access? Contact Support
              </Link>
            </div>
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need to create an account?{" "}
              <Link
                href="/doctor/register"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                Register as Doctor
              </Link>
            </p>
          </div>

          {/* Patient Portal Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Patient login?{" "}
              <Link
                href="/patient/login"
                className="text-primary hover:underline"
              >
                Switch to Patient Portal
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

export default DoctorLoginPage;
