"use client";
import type React from "react";
import { useState } from "react";
import { User, Building2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/ui/footer";

interface RoleCardProps {
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  title,
  description,
  features,
  icon,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border bg-card shadow-md transition-all duration-300 transform
        ${
          isSelected
            ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg scale-[1.02]"
            : "border-border hover:shadow-lg hover:scale-[1.02]"
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
      <div className="flex justify-center mb-4 sm:mb-6">
        <div className="h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center rounded-xl bg-muted shadow-inner">
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-center mb-2 sm:mb-3 text-foreground">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-center text-muted-foreground mb-3 sm:mb-5 leading-relaxed">
        {description}
      </p>

      <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<
    "patient" | "hospital" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const roles = [
    {
      key: "patient" as const,
      title: "Patient",
      description:
        "Access your medical records and manage your health data securely.",
      features: [
        "View medical history",
        "Manage data permissions",
        "Track consent status",
        "Secure verification",
      ],
      icon: <User className="h-8 w-8 sm:h-10 sm:w-10" />,
    },
    {
      key: "hospital" as const,
      title: "Medical Professional",
      description:
        "Manage patient records with enterprise-grade security and compliance.",
      features: [
        "Update patient records",
        "Access authorized data",
        "Manage staff permissions",
        "Audit trails",
      ],
      icon: <Building2 className="h-8 w-8 sm:h-10 sm:w-10" />,
    },
  ];

  const handleContinue = async () => {
    if (!selectedRole) return;
    setIsLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 1500));
      router.push(
        selectedRole === "patient" ? "/patient/login" : "/doctor/login"
      );
    } catch (error) {
      console.error("Navigation failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col">
      <header className="p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Back to Home
        </Link>
      </header>

      <main className="px-4 py-6 sm:py-8 md:py-12 flex-grow">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-14">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-2 sm:mb-4">
              Choose Your Role
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Access BlockCare's secure healthcare platform designed for both
              patients and healthcare providers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-10 max-w-3xl mx-auto">
            {roles.map((role) => (
              <RoleCard
                key={role.key}
                title={role.title}
                description={role.description}
                features={role.features}
                icon={role.icon}
                isSelected={selectedRole === role.key}
                onClick={() => setSelectedRole(role.key)}
              />
            ))}
          </div>

          {selectedRole && (
            <div className="flex justify-center">
              <button
                onClick={handleContinue}
                disabled={isLoading}
                className="px-5 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl bg-primary text-secondary font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto shadow-md text-sm sm:text-base"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mx-auto" />
                ) : (
                  <span>
                    Continue as{" "}
                    {selectedRole === "patient" ? "Patient" : "Hospital"}
                  </span>
                )}
              </button>
            </div>
          )}
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
