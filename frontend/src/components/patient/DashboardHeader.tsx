"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Shield, Settings, LogOut } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface DashboardHeaderProps {
  user: User;
  onSignOut: () => Promise<void>;
  onTestConnection: () => Promise<void>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onSignOut,
  onTestConnection,
}) => {
  const router = useRouter();

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                BlockCare
              </h1>
              <p className="text-xs text-muted-foreground">Patient Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground mr-2">
              Welcome, {user.email}
            </div>
            <button
              onClick={onTestConnection}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-xs"
              title="Test Supabase Connection"
            >
              🔧 Test
            </button>
            <button
              onClick={() => router.push("/patient/settings")}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Settings"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </button>
            <button
              onClick={onSignOut}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
