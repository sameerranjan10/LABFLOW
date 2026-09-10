/**
 * FHIR R4 Compliant Interoperability Helpers
 */

export interface GenerateFhirParams {
  patientId: string;
  patientName: string;
  gender: string;
  birthDate?: string;
  mrn: string;
  vitals?: {
    bp?: string;
    hr?: number;
    spo2?: string;
    temp?: string;
  };
  conditions?: Array<{ code: string; display: string }>;
  medications?: Array<{ drug: string; dose: string; instructions: string }>;
}

export function generateFhirBundle(params: GenerateFhirParams): Record<string, unknown> {
  const bundleId = `bundle-${Date.now()}`;
  const now = new Date().toISOString();
  const patientFullUrl = `urn:uuid:${params.patientId}`;

  const entries: Array<{ fullUrl: string; resource: Record<string, unknown> }> = [
    {
      fullUrl: patientFullUrl,
      resource: {
        resourceType: "Patient",
        id: params.patientId,
        identifier: [
          {
            use: "usual",
            type: {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                  code: "MR",
                  display: "Medical Record Number",
                },
              ],
            },
            system: "http://hospital.core/patients",
            value: params.mrn,
          },
        ],
        active: true,
        name: [
          {
            use: "official",
            text: params.patientName,
          },
        ],
        gender: params.gender.toLowerCase(),
        birthDate: params.birthDate || "1975-01-01",
      },
    },
  ];

  // Add Vitals Observations if present
  if (params.vitals?.bp) {
    entries.push({
      fullUrl: `urn:uuid:obs-bp-${Date.now()}`,
      resource: {
        resourceType: "Observation",
        id: `obs-bp-${Date.now()}`,
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
                display: "Vital Signs",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "85354-9",
              display: "Blood pressure panel with all children optional",
            },
          ],
        },
        subject: { reference: patientFullUrl, display: params.patientName },
        effectiveDateTime: now,
        valueString: params.vitals.bp,
      },
    });
  }

  // Add Conditions
  if (params.conditions && params.conditions.length > 0) {
    params.conditions.forEach((cond, idx) => {
      entries.push({
        fullUrl: `urn:uuid:cond-${idx}-${Date.now()}`,
        resource: {
          resourceType: "Condition",
          id: `cond-${idx}-${Date.now()}`,
          clinicalStatus: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                code: "active",
              },
            ],
          },
          verificationStatus: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                code: "confirmed",
              },
            ],
          },
          code: {
            coding: [
              {
                system: "http://hl7.org/fhir/sid/icd-10-cm",
                code: cond.code,
                display: cond.display,
              },
            ],
          },
          subject: { reference: patientFullUrl },
          recordedDate: now,
        },
      });
    });
  }

  // Add MedicationRequests
  if (params.medications && params.medications.length > 0) {
    params.medications.forEach((med, idx) => {
      entries.push({
        fullUrl: `urn:uuid:med-${idx}-${Date.now()}`,
        resource: {
          resourceType: "MedicationRequest",
          id: `med-${idx}-${Date.now()}`,
          status: "active",
          intent: "order",
          medicationCodeableConcept: {
            text: `${med.drug} ${med.dose}`,
          },
          subject: { reference: patientFullUrl },
          dosageInstruction: [
            {
              text: med.instructions,
            },
          ],
          authoredOn: now,
        },
      });
    });
  }

  return {
    resourceType: "Bundle",
    type: "collection",
    id: bundleId,
    timestamp: now,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"],
      tag: [
        {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActReason",
          code: "CDSS-DISHA",
          display: "Clinical Decision Support System Export",
        },
      ],
    },
    entry: entries,
  };
}

/**
 * Client helper to trigger browser file download for FHIR JSON
 */
export function downloadFhirBundle(bundle: Record<string, unknown>, filename = "fhir_bundle.json") {
  const jsonStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
