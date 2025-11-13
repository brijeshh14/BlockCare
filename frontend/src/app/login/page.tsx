"use client";
import type React from "react";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/ui/footer";

interface RoleCardProps {
  title: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
  isSelected: boolean;
  onClick: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  title,
  description,
  iconSrc,
  iconAlt,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 border shadow-md transition-all duration-300 transform
        ${
          isSelected
            ? `border-primary shadow-lg ${
                iconAlt === "Patient icon" ? "scale-[1.03]" : "scale-[1.02]"
              }`
            : "border-border bg-[#20202a] hover:shadow-lg hover:scale-[1.02]"
        }
      `}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex justify-center mb-5 sm:mb-8">
        <div
          className={`flex items-center justify-center rounded-2xl  relative
          ${
            iconAlt === "Patient icon"
              ? "h-44 w-44 sm:h-56 sm:w-56"
              : "h-36 w-36 sm:h-48 sm:w-48"
          }`}
        >
          <Image
            src={iconSrc}
            alt={iconAlt}
            fill
            className={`object-contain ${
              iconAlt === "Patient icon" ? "p-2" : "p-3"
            }`}
          />
        </div>
      </div>

      <h3 className="text-3xl sm:text-4xl font-bold text-center mb-3 sm:mb-4 text-white">
        {title}
      </h3>
      <p className="text-base sm:text-lg text-center text-gray-300">
        {description}
      </p>
    </div>
  );
};

const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<
    "patient" | "hospital" | null
  >(null);
  const router = useRouter();

  const roles = [
    {
      key: "patient" as const,
      title: "Patient",
      description: "Access your medical records securely.",
      iconSrc: "/patient.png",
      iconAlt: "Patient icon",
    },
    {
      key: "hospital" as const,
      title: "Medical Professional",
      description: "Quick access to patient records.",
      iconSrc: "/doctor.png",
      iconAlt: "Doctor icon",
    },
  ];

  // Navigation is handled directly when a role card is clicked.
  // Removed the previous `handleContinue` which referenced a missing `setIsLoading` state.

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <header className="p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Back to Home
        </Link>
      </header>

      <main className="px-4 py-6 sm:py-8 md:py-12 flex-grow">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Choose Your Role
            </h1>
            <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
              Access BlockCare's secure healthcare platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-12 max-w-4xl mx-auto">
            {roles.map((role) => (
              <RoleCard
                key={role.key}
                title={role.title}
                description={role.description}
                iconSrc={role.iconSrc}
                iconAlt={role.iconAlt}
                isSelected={selectedRole === role.key}
                onClick={() => {
                  // mark selection (not strictly necessary since we'll navigate)
                  setSelectedRole(role.key);
                  // navigate immediately to the corresponding login page
                  router.push(
                    role.key === "patient" ? "/patient/login" : "/doctor/login"
                  );
                }}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default LoginPage;
