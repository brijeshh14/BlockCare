"use client";

import UploadExample from "@/components/UploadExample";
import { SupabaseDebug } from "@/components/SupabaseDebug";

export default function UploadTestPage() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-8">
      <SupabaseDebug />
      <UploadExample />
    </div>
  );
}
