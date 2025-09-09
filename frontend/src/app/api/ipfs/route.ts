import { NextRequest, NextResponse } from 'next/server';
import { storeMedicalRecord, validateRecordParams, StoreRecordParams } from '@/lib/medical-records';
import { createHash } from 'crypto';

interface UploadResponse {
  success: boolean;
  ipfsHash?: string;
  fileName?: string;
  size?: number;
  ipfsUrl?: string;
  recordStored?: boolean;
  canisterRecordId?: string;
  error?: string;
  details?: string;
}

const IPFS_API_URL = process.env.IPFS_GATEWAY_URL;
const IPFS_GATEWAY_URL = process.env.IPFS_GATEWAY_URL;

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

async function generateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hash = createHash('sha256');
  hash.update(new Uint8Array(arrayBuffer));
  return hash.digest('hex');
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as unknown as File;
    let patientId = formData.get('patientId') as string;
    const accessControl = formData.get('accessControl') as string;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file uploaded'
      }, { status: 400 });
    }

    if (!patientId) {
      // trust me
      patientId = "2342234234234234"
    }
    console.log(patientId)

    if (!file.arrayBuffer || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({
        success: false,
        error: 'Invalid file format'
      }, { status: 400 });
    }

    let accessControlArray: string[] = [];
    if (accessControl) {
      try {
        accessControlArray = JSON.parse(accessControl);
      } catch {
        accessControlArray = accessControl.split(',').map(item => item.trim()).filter(Boolean);
      }
    } else {
      accessControlArray = [patientId];
    }

    const { hash: ipfsHash, size } = await uploadToIPFS(file);

    const recordHash = await generateFileHash(file);

    const recordParams: StoreRecordParams = {
      patientId,
      ipfsCid: ipfsHash,
      recordHash,
      accessControl: accessControlArray
    };

    if (!validateRecordParams(recordParams)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid record parameters'
      }, { status: 400 });
    }

    let recordStored = false;
    let canisterError: string | undefined;

    try {
      await storeMedicalRecord(recordParams);
      recordStored = true;
    } catch (error) {
      console.error('Failed to store record on ICP canister:', error);
      canisterError = error instanceof Error ? error.message : 'Unknown canister error';
    }

    const response: UploadResponse = {
      success: true,
      ipfsHash: ipfsHash,
      fileName: file.name,
      size: size,
      ipfsUrl: `${IPFS_GATEWAY_URL}/${ipfsHash}`,
      recordStored,
      canisterRecordId: recordStored ? `${patientId}-${ipfsHash}` : undefined,
      ...(canisterError && { details: `IPFS upload successful, but canister storage failed: ${canisterError}` })
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Upload error:', error);
    const errorResponse: UploadResponse = {
      success: false,
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({
        success: false,
        error: 'Patient ID is required'
      }, { status: 400 });
    }

    const { getMedicalRecords } = await import('@/lib/medical-records');
    const records = await getMedicalRecords(patientId);

    const enhancedRecords = records.map(record => ({
      ...record,
      ipfsUrl: `${IPFS_GATEWAY_URL}/${record.ipfsCid}`
    }));

    return NextResponse.json({
      success: true,
      records: enhancedRecords,
      count: enhancedRecords.length
    });

  } catch (error) {
    console.error('Error retrieving records:', error);

    if (error instanceof Error && error.message === 'No medical records found for this patient') {
      return NextResponse.json({
        success: true,
        records: [],
        count: 0,
        message: 'No records found for this patient'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve medical records',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed'
  }, { status: 405 });
}
