import { Actor, HttpAgent } from '@dfinity/agent';

interface MedicalRecordsActor {
  storeRecord: (
    patientId: string,
    ipfsCid: string,
    recordHash: string,
    accessControl: string[]
  ) => Promise<void>;
  getRecords: (patientId: string) => Promise<PatientMetadata[]>;
}
export interface PatientMetadata {
  patientId: string;
  ipfsCid: string;
  timestamp: bigint;
  recordHash: string;
  accessControl: string[];
}

export interface SerializedPatientMetadata {
  patientId: string;
  ipfsCid: string;
  timestamp: number;
  recordHash: string;
  accessControl: string[];
}

export interface StoreRecordParams {
  patientId: string;
  ipfsCid: string;
  recordHash: string;
  accessControl: string[];
}

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

export async function storeMedicalRecord(params: StoreRecordParams): Promise<void> {
  const { patientId, ipfsCid, recordHash, accessControl } = params;

  if (!patientId || !ipfsCid || !recordHash || !Array.isArray(accessControl)) {
    throw new Error('Missing required fields: patientId, ipfsCid, recordHash, accessControl');
  }

  try {
    const actor = await createActor();
    await actor.storeRecord(patientId, ipfsCid, recordHash, accessControl);
  } catch (error) {
    console.error('Error storing medical record:', error);
    throw new Error('Failed to store medical record');
  }
}

export async function getMedicalRecords(patientId: string): Promise<SerializedPatientMetadata[]> {
  if (!patientId) {
    throw new Error('patientId is required');
  }

  try {
    const actor = await createActor();
    const records = await actor.getRecords(patientId);

    if (!records || records.length === 0) {
      throw new Error('No medical records found for this patient');
    }

    // Convert BigInt timestamps to number for serialization
    const serializedRecords = records.map((record) => ({
      ...record,
      timestamp: Number(record.timestamp),
    }));

    return serializedRecords;
  } catch (error) {
    console.error('Error retrieving medical records:', error);
    if (error instanceof Error && error.message === 'No medical records found for this patient') {
      throw error;
    }
    throw new Error('Failed to retrieve medical records');
  }
}

export function validateRecordParams(params: Partial<StoreRecordParams>): params is StoreRecordParams {
  return !!(
    params.patientId &&
    params.ipfsCid &&
    params.recordHash &&
    Array.isArray(params.accessControl)
  );
}

export async function hasPatientRecords(patientId: string): Promise<boolean> {
  try {
    await getMedicalRecords(patientId);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message === 'No medical records found for this patient') {
      return false;
    }
    throw error; // Re-throw other errors
  }
}
