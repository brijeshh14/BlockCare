"use client";

import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Droplets,
  AlertCircle,
} from "lucide-react";
import { Patient } from "@/types/medical";

interface PatientProfileProps {
  patient: Patient;
  userId: string;
}

export const PatientProfile: React.FC<PatientProfileProps> = ({
  patient,
  userId,
}) => {
  const formatAllergies = (allergies: string[] | null) => {
    if (!allergies || allergies.length === 0) return "None known";
    return allergies.join(", ");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <User className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Your Profile</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">User ID</p>
            <p className="font-mono text-sm font-medium text-foreground break-all">
              {userId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="font-medium text-foreground">{patient.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">
              {patient.email || "Not provided"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium text-foreground">
              {patient.phone || "Not provided"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Age</p>
            <p className="font-medium text-foreground">
              {patient.age ? `${patient.age} years` : "Not provided"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="font-medium text-foreground">
              {patient.gender || "Not specified"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Droplets className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Blood Type</p>
            <p className="font-medium text-foreground">
              {patient.bloodtype || "Not specified"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Emergency Contact</p>
            <p className="font-medium text-foreground">
              {patient.emergencycontact || "Not provided"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-medium text-foreground">
              {patient.address || "Not provided"}
            </p>
          </div>
        </div>

        {patient.allergies && patient.allergies.length > 0 && (
          <div className="flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Allergies</p>
              <p className="font-medium text-foreground">
                {formatAllergies(patient.allergies)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
