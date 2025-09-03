"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase/client';
import { storageService } from '@/lib/supabase/storage';

export const SupabaseDebug: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setStatus('Testing connection...');
    
    try {
      // Test basic Supabase connection
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      setStatus(prev => prev + '\n✓ Supabase client initialized');
      
      if (authError) {
        setStatus(prev => prev + '\n⚠ Auth error: ' + authError.message);
      }
      
      // Test storage connection
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        if (bucketsError) {
          setStatus(prev => prev + '\n⚠ Storage error: ' + bucketsError.message);
        } else {
          setStatus(prev => prev + '\n✓ Storage connection working');
          setStatus(prev => prev + `\n📁 Found ${buckets?.length || 0} buckets: ${buckets?.map(b => b.name).join(', ')}`);
        }
      } catch (storageErr: any) {
        setStatus(prev => prev + '\n❌ Storage connection failed: ' + storageErr.message);
      }
      
      // Test bucket initialization
      try {
        await storageService.initializeBuckets();
        setStatus(prev => prev + '\n✓ Bucket initialization completed');
      } catch (bucketErr: any) {
        setStatus(prev => prev + '\n⚠ Bucket initialization issue: ' + bucketErr.message);
      }
      
    } catch (err: any) {
      setStatus(prev => prev + '\n❌ Connection test failed: ' + err.message);
    }
    
    setIsLoading(false);
  };

  const testFileUpload = async () => {
    setIsLoading(true);
    setStatus('Testing file upload...');
    
    try {
      // Create a test file
      const testContent = 'This is a test file for Supabase upload';
      const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
      
      // Test upload
      const result = await storageService.uploadFile('test-patient-123', testFile);
      setStatus(prev => prev + '\n✓ Test file uploaded successfully');
      setStatus(prev => prev + '\n📄 File path: ' + result.path);
      
      // Test getting URL
      const url = await storageService.getFileUrl(result.path);
      setStatus(prev => prev + '\n🔗 File URL: ' + url);
      
      // Clean up - delete test file
      await storageService.deleteFile(result.path);
      setStatus(prev => prev + '\n🧹 Test file cleaned up');
      
    } catch (err: any) {
      setStatus(prev => prev + '\n❌ Upload test failed: ' + err.message);
      console.error('Upload test error:', err);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Supabase Debug Tool</h3>
      
      <div className="flex gap-4 mb-4">
        <Button 
          onClick={testConnection} 
          disabled={isLoading}
          variant="outline"
        >
          Test Connection
        </Button>
        <Button 
          onClick={testFileUpload} 
          disabled={isLoading}
          variant="outline"
        >
          Test File Upload
        </Button>
      </div>
      
      {status && (
        <div className="bg-muted p-4 rounded-md">
          <pre className="text-sm whitespace-pre-wrap font-mono">
            {status}
          </pre>
        </div>
      )}
    </div>
  );
};
