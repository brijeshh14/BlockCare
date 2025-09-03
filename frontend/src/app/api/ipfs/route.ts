

import { NextRequest, NextResponse } from 'next/server';

interface UploadResponse {
  success: boolean;
  ipfsHash?: string;
  fileName?: string;
  size?: number;
  ipfsUrl?: string;
  error?: string;
  details?: string;
}

const IPFS_API_URL = 'http://localhost:5001/api/v0';
const IPFS_GATEWAY_URL = 'http://localhost:8080/ipfs';

async function uploadToIPFS(file: File): Promise<{ hash: string; size: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${IPFS_API_URL}/add?pin=true`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`IPFS upload failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.text();
  const lines = result.trim().split('\n');
  const lastLine = lines[lines.length - 1];
  const data = JSON.parse(lastLine);
  
  return {
    hash: data.Hash,
    size: data.Size || file.size
  };
}


export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as unknown as File;
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file uploaded' 
      }, { status: 400 });
    }

    // Type guard to ensure we have a proper File object
    if (!file.arrayBuffer || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({
        success: false,
        error: 'Invalid file format'
      }, { status: 400 });
    }

    // Upload to IPFS using HTTP API
    const { hash: ipfsHash, size } = await uploadToIPFS(file);

    const response: UploadResponse = {
      success: true,
      ipfsHash: ipfsHash,
      fileName: file.name,
      size: size,
      ipfsUrl: `${IPFS_GATEWAY_URL}/${ipfsHash}`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('IPFS upload error:', error);
    const errorResponse: UploadResponse = {
      success: false,
      error: 'Failed to upload to IPFS',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ 
    success: false, 
    error: 'Method not allowed' 
  }, { status: 405 });
}