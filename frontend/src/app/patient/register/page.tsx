"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Droplets,
  UserPlus,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Footer } from "@/components/ui/footer";
import { useAuth } from "@/hooks/supabase/useAuth";
import { patientService } from "@/lib/supabase/database";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (value: string) => /^\d{10}$/.test(value);

const PatientRegisterPage: React.FC = () => {
  const router = useRouter();
  const { signUp, signIn } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    bloodType: "",
    emergencyContact: "",
    allergies: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [digilockerLoading, setDigilockerLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validation
  const isFormValid = () => {
    return (
      formData.name.trim().length > 1 &&
      isValidEmail(formData.email) &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      parseInt(formData.age) > 0 &&
      formData.gender &&
      isValidPhone(formData.phone) &&
      formData.address.trim().length > 5 &&
      formData.bloodType &&
      isValidPhone(formData.emergencyContact)
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError("Please fill all required fields correctly");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Register user with Supabase Auth
      const authResult = await signUp(formData.email, formData.password);

      if (!authResult.success) {
        const errorMessage =
          authResult.error instanceof Error
            ? authResult.error.message
            : typeof authResult.error === "string"
            ? authResult.error
            : "Failed to create account";
        throw new Error(errorMessage);
      }

      // Create patient record in database
      const patientData = {
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age),
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address,
        bloodtype: formData.bloodType,
        emergencycontact: formData.emergencyContact,
        allergies: formData.allergies
          ? formData.allergies
              .split(",")
              .map((a) => a.trim())
              .filter((a) => a)
          : null,
        condition: "General", // Default condition
      };

      await patientService.createPatient(patientData);

      // Note: If email confirmation is enabled in Supabase, the user won't be able to login
      // immediately after registration. They need to confirm their email first.

      // Check if the user registration requires email confirmation
      if (!authResult.user?.email_confirmed_at) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/patient/login?registered=true");
        }, 3000);
        return;
      }

      // Automatically sign in the user after registration

      // Wait a moment for Supabase to fully process the registration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const loginResult = await signIn(formData.email, formData.password);

      if (!loginResult.success) {
        console.error("Auto-login failed:", loginResult.error);
        // Even if auto-login fails, registration was successful
        // Show success message and redirect to login
        setSuccess(true);
        setTimeout(() => {
          router.push("/patient/login?registered=true");
        }, 2000);
        return;
      }

      // Redirect directly to dashboard after successful auto-login
      router.push("/patient/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDigiLockerRegister = async () => {
    setDigilockerLoading(true);
    setError(null);

    try {
      // Simulate DigiLocker authentication and auto-populate form
      await new Promise((r) => setTimeout(r, 2000));

      // In real implementation, this would fetch data from DigiLocker
      // and create the account automatically
      router.push("/patient/dashboard");
    } catch (err: any) {
      setError("DigiLocker registration failed. Please try again.");
    } finally {
      setDigilockerLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Registration Successful!
          </h1>
          <p className="text-muted-foreground mb-4">
            Your account has been created. Please check your email to confirm
            your account, then try logging in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back Button */}
      <div className="p-4">
        <Link
          href="/patient/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>
      </div>

      {/* Registration Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs tracking-widest text-foreground/70">
                BLOCKCARE REGISTRATION
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-foreground">
              Create Patient Account
            </h1>
            <p className="text-muted-foreground mt-1">
              Register to access your secure medical records
            </p>
          </div>

          {/* Manual Registration Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name *
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      handleInputChange(
                        "phone",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password *
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Minimum 6 characters"
                    className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password *
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm your password"
                    className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Age *
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                    className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Gender *
                </label>
                {/* Match other inputs: include icon + padded flex wrapper so styling is consistent */}
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 relative z-50">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    aria-label="Gender"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Blood Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Blood Type *
                </label>
                {/* Match other inputs: icon + padded flex wrapper */}
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 relative z-50">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={formData.bloodType}
                    onChange={(e) =>
                      handleInputChange("bloodType", e.target.value)
                    }
                    className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    aria-label="Blood Type"
                    required
                  >
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Emergency Contact *
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) =>
                      handleInputChange(
                        "emergencyContact",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    placeholder="Emergency contact number"
                    maxLength={10}
                    className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Address *
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Enter your full address"
                    rows={2}
                    className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground resize-none"
                    required
                  />
                </div>
              </div>

              {/* Allergies (Optional) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Known Allergies (Optional)
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) =>
                      handleInputChange("allergies", e.target.value)
                    }
                    placeholder="List any known allergies (comma-separated)"
                    className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid() || loading}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Register"}
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/patient/login"
                className="text-primary hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </form>

          {/* OR Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                OR
              </span>
            </div>
          </div>

          {/* DigiLocker Registration Option */}
          {/* <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="text-center mb-4">
              <div className="mx-auto w-16 h-16 mb-3 relative">
                <Image
                  src="/icons/digilocker.svg"
                  alt="DigiLocker"
                  width={64}
                  height={64}
                  className="mx-auto"
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Register with DigiLocker
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically create your account using verified DigiLocker
                credentials
              </p>
            </div> */}
          {/* 
            <button
              onClick={handleDigiLockerRegister}
              disabled={digilockerLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {digilockerLoading ? (
                "Connecting..."
              ) : (
                <>
                  Continue with DigiLocker
                  <ExternalLink className="h-4 w-4" />
                </>
              )}
            </button> */}
          {/* 
            <p className="mt-3 text-xs text-center text-muted-foreground">
              Your personal information will be securely fetched from DigiLocker
            </p> */}
          {/* </div> */}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PatientRegisterPage;
