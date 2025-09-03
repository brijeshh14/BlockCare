"use client";

import React from "react";
import UploadComponent from "@/components/Upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TestIPFSPage: React.FC = () => {
  const handleIPFSUploadSuccess = (ipfsHash: string, ipfsUrl: string) => {
    console.log("File uploaded to IPFS successfully!");
    console.log("IPFS Hash:", ipfsHash);
    console.log("IPFS URL:", ipfsUrl);
    
    // You can add blockchain interaction here
    // For example: uploadToBlockchain(ipfsHash);
    alert(`IPFS Upload Successful!\n\nHash: ${ipfsHash}\n\nCheck console for details.`);
  };

  const handleUploadError = (error: string) => {
    console.error("Upload failed:", error);
    alert(`Upload failed: ${error}`);
  };

  const handleSupabaseUpload = (document: any) => {
    console.log("File uploaded to Supabase successfully!");
    console.log("Document:", document);
    alert("Supabase upload successful! Check console for details.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            IPFS Upload Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Test the IPFS upload functionality with the enhanced Upload component
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* IPFS Upload Test */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🌐</span>
                <span>IPFS Upload Test</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UploadComponent
                showIPFSUpload={true}
                showCamera={true}
                showDragDrop={true}
                onIPFSUploadComplete={handleIPFSUploadSuccess}
                acceptedTypes={[".pdf", ".jpg", ".jpeg", ".png", ".txt", ".doc", ".docx"]}
                maxSize={50}
                className="border-0 shadow-none bg-transparent"
              />
            </CardContent>
          </Card>

          {/* Combined Upload Test (with patient ID) */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🏥</span>
                <span>Combined Upload Test</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This shows both Supabase and IPFS upload options when a patient ID is provided.
              </p>
              <UploadComponent
                patientId="test-patient-123"
                showIPFSUpload={true}
                showCamera={true}
                showDragDrop={true}
                onUploadComplete={handleSupabaseUpload}
                onIPFSUploadComplete={handleIPFSUploadSuccess}
                acceptedTypes={[".pdf", ".jpg", ".jpeg", ".png", ".txt"]}
                maxSize={25}
                className="border-0 shadow-none bg-transparent"
              />
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📋</span>
              <span>Instructions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-lg mb-2">IPFS Upload Only</h3>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Upload files directly to IPFS network</li>
                  <li>• Get IPFS hash for blockchain storage</li>
                  <li>• Files are decentralized and persistent</li>
                  <li>• No patient ID required</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Combined Upload</h3>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Choose between Supabase or IPFS</li>
                  <li>• Supabase for traditional database storage</li>
                  <li>• IPFS for decentralized storage</li>
                  <li>• Patient ID enables Supabase option</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                🚨 Requirements for IPFS Upload:
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• IPFS node running locally on port 5001</li>
                <li>• IPFS gateway accessible on port 8080</li>
                <li>• Start IPFS daemon with: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">ipfs daemon</code></li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestIPFSPage;
