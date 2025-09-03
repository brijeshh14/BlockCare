"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, User } from "lucide-react";
import { Patient } from "@/types/medical";

interface WelcomeSectionProps {
  patient: Patient;
  successMessage: string | null;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  patient,
  successMessage,
}) => {
  const router = useRouter();

  return (
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
                To get the most out of BlockCare, please complete your medical
                profile with accurate information.
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
  );
};
