"use client";

import React, { useState } from "react";
import UploadComponent from "./Upload";

const UploadExample: React.FC = () => {
  const [uploadResults, setUploadResults] = useState<{
    supabaseUploads: any[];
    ipfsUploads: Array<{ hash: string; url: string; timestamp: Date }>;
  }>({
    supabaseUploads: [],
    ipfsUploads: [],
  });

  const handleSupabaseUploadComplete = (document: any) => {
    console.log("Supabase upload completed:", document);
    setUploadResults((prev) => ({
      ...prev,
      supabaseUploads: [...prev.supabaseUploads, document],
    }));

    // You can add additional logic here, such as:
    // - Showing a success notification
    // - Refreshing a documents list
    // - Redirecting to another page
  };

  const handleIPFSUploadComplete = (ipfsHash: string, ipfsUrl: string) => {
    console.log("IPFS upload completed:", { ipfsHash, ipfsUrl });
    setUploadResults((prev) => ({
      ...prev,
      ipfsUploads: [
        ...prev.ipfsUploads,
        {
          hash: ipfsHash,
          url: ipfsUrl,
          timestamp: new Date(),
        },
      ],
    }));

    // You can add additional logic here, such as:
    // - Storing the hash in blockchain
    // - Updating smart contract
    // - Showing blockchain transaction UI
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            File Upload Demo
          </h1>
          <p className="text-muted-foreground">
            Upload files to either Supabase (database) or IPFS (decentralized
            storage)
          </p>
        </div>

        <UploadComponent
          patientId="example-patient-id" // Replace with actual patient ID
          onUploadComplete={handleSupabaseUploadComplete}
          onIPFSUploadComplete={handleIPFSUploadComplete}
          acceptedTypes={[".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]}
          maxSize={50} // 50MB
          showCamera={true}
          showDragDrop={true}
          showIPFSUpload={true}
          showSupabaseUpload={true}
          className="w-full"
        />

        {/* Results Display */}
        {(uploadResults.supabaseUploads.length > 0 ||
          uploadResults.ipfsUploads.length > 0) && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Upload Results</h2>

            {/* Supabase Results */}
            {uploadResults.supabaseUploads.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-3">
                  Supabase Uploads ({uploadResults.supabaseUploads.length})
                </h3>
                <div className="space-y-2">
                  {uploadResults.supabaseUploads.map((doc, index) => (
                    <div
                      key={index}
                      className="text-sm text-green-700 dark:text-green-300"
                    >
                      • {doc.name} ({doc.size} bytes)
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IPFS Results */}
            {uploadResults.ipfsUploads.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-3">
                  IPFS Uploads ({uploadResults.ipfsUploads.length})
                </h3>
                <div className="space-y-3">
                  {uploadResults.ipfsUploads.map((upload, index) => (
                    <div key={index} className="space-y-1">
                      <div className="text-sm font-mono text-blue-700 dark:text-blue-300">
                        Hash: {upload.hash}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Uploaded: {upload.timestamp.toLocaleString()}
                      </div>
                      <a
                        href={upload.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View File →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadExample;
