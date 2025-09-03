import Time "mo:base/Time";
import Array "mo:base/Array";

persistent actor MedicalRecords {

  type PatientMetadata = {
    patientId: Text;
    ipfsCid: Text;
    timestamp: Time.Time;
    recordHash: Text;
    accessControl: [Text];
  };

  stable var records: [PatientMetadata] = [];

  public shared func storeRecord(patientId: Text, ipfsCid: Text, recordHash: Text, accessControl: [Text]) : async () {
    let timestamp = Time.now();
    let metadata: PatientMetadata = {
      patientId = patientId;
      ipfsCid = ipfsCid;
      timestamp = timestamp;
      recordHash = recordHash;
      accessControl = accessControl;
    };
    records := Array.append(records, [metadata]);
  };

  public query func getRecords(patientId: Text) : async [PatientMetadata] {
    Array.filter<PatientMetadata>(
      records,
      func(r: PatientMetadata) : Bool {
        r.patientId == patientId
      }
    )
  };
};
