import { Actor, HttpAgent } from '@dfinity/agent';
import { NextRequest, NextResponse } from 'next/server';

// Interface for Motoko actor
interface MedicalRecordsActor {
  storeRecord: (
    patientId: string,
    ipfsCid: string,
    recordHash: string,
    accessControl: string[]
  ) => Promise<void>;
  getRecords: (patientId: string) => Promise<PatientMetadata[]>;
}

interface PatientMetadata {
  patientId: string;
  ipfsCid: string;
  timestamp: bigint;
  recordHash: string;
  accessControl: string[];
}

// IDL definition for canister
const idlFactory = ({ IDL }: any) => {
  const PatientMetadata = IDL.Record({
    patientId: IDL.Text,
    ipfsCid: IDL.Text,
    timestamp: IDL.Int,
    recordHash: IDL.Text,
    accessControl: IDL.Vec(IDL.Text),
  });

  return IDL.Service({
    storeRecord: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text, IDL.Vec(IDL.Text)],
      [],
      []
    ),
    getRecords: IDL.Func([IDL.Text], [IDL.Vec(PatientMetadata)], ['query']),
  });
};

const CANISTER_ID = process.env.MEDICAL_RECORDS_CANISTER_ID!;
const IC_HOST = process.env.IC_HOST || 'https://ic0.app';

export async function createActor(): Promise<MedicalRecordsActor> {
  const agent = new HttpAgent({ host: IC_HOST });

  if (process.env.NODE_ENV === 'development') {
    await agent.fetchRootKey();
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId: CANISTER_ID,
  }) as MedicalRecordsActor;
}

// Store a medical record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, ipfsCid, recordHash, accessControl } = body;

    if (!patientId || !ipfsCid || !recordHash || !Array.isArray(accessControl)) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, ipfsCid, recordHash, accessControl' },
        { status: 400 }
      );
    }

    const actor = await createActor();
    await actor.storeRecord(patientId, ipfsCid, recordHash, accessControl);

    return NextResponse.json(
      { message: 'Medical record stored successfully', patientId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error storing medical record:', error);
    return NextResponse.json(
      { error: 'Failed to store medical record' },
      { status: 500 }
    );
  }
}

// Retrieve medical records by patient ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId query parameter is required' },
        { status: 400 }
      );
    }

    const actor = await createActor();
    const records = await actor.getRecords(patientId);

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: 'No medical records found for this patient' },
        { status: 404 }
      );
    }

    // Convert BigInt timestamps to number
    const serializedRecords = records.map((r) => ({
      ...r,
      timestamp: Number(r.timestamp),
    }));

    return NextResponse.json(serializedRecords, { status: 200 });
  } catch (error) {
    console.error('Error retrieving medical records:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve medical records' },
      { status: 500 }
    );
  }
}
