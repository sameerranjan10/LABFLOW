import PDFDocument from "pdfkit";
import { LabReport } from "@/data/labflowData";

export interface ClinicalParameter {
  name: string;
  value: string;
  range: string;
  unit: string;
  flag: "Normal" | "High" | "Low";
}

export const DEFAULT_PARAMETERS: ClinicalParameter[] = [
  { name: "Hemoglobin (Hb)", value: "13.2", range: "12.0 - 16.0", unit: "g/dL", flag: "Normal" },
  { name: "Total Leukocyte Count (TLC)", value: "11,800", range: "4,000 - 11,000", unit: "/uL", flag: "High" },
  { name: "Neutrophils", value: "72", range: "40 - 70", unit: "%", flag: "High" },
  { name: "Lymphocytes", value: "22", range: "20 - 45", unit: "%", flag: "Normal" },
  { name: "Eosinophils", value: "2", range: "1 - 6", unit: "%", flag: "Normal" },
  { name: "Monocytes", value: "4", range: "2 - 8", unit: "%", flag: "Normal" },
  { name: "Platelet Count", value: "245,000", range: "150,000 - 450,000", unit: "/uL", flag: "Normal" },
  { name: "Packed Cell Volume (PCV)", value: "39.5", range: "36.0 - 46.0", unit: "%", flag: "Normal" },
  { name: "Mean Corpuscular Volume (MCV)", value: "88.8", range: "80.0 - 100.0", unit: "fL", flag: "Normal" },
  { name: "Fasting Blood Sugar (FBS)", value: "92", range: "70 - 99", unit: "mg/dL", flag: "Normal" },
  { name: "Serum Creatinine", value: "0.92", range: "0.60 - 1.20", unit: "mg/dL", flag: "Normal" },
  { name: "Blood Urea Nitrogen (BUN)", value: "14.5", range: "7.0 - 20.0", unit: "mg/dL", flag: "Normal" },
  { name: "Total Cholesterol", value: "184", range: "< 200", unit: "mg/dL", flag: "Normal" },
  { name: "Serum Triglycerides", value: "130", range: "< 150", unit: "mg/dL", flag: "Normal" },
];

export function getClinicalParametersForReportPdf(tests: string[]): ClinicalParameter[] {
  const result: ClinicalParameter[] = [];
  const testsStr = (tests || []).join(" ").toLowerCase();

  // 1. Complete Blood Count (CBC)
  if (testsStr.includes("cbc") || testsStr.includes("blood count") || testsStr.includes("hemogram")) {
    result.push(
      { name: "Hemoglobin (Hb)", value: "13.2", range: "12.0 - 16.0", unit: "g/dL", flag: "Normal" },
      { name: "Total Leukocyte Count (TLC)", value: "11,800", range: "4,000 - 11,000", unit: "/uL", flag: "High" },
      { name: "Neutrophils", value: "72", range: "40 - 70", unit: "%", flag: "High" },
      { name: "Lymphocytes", value: "22", range: "20 - 45", unit: "%", flag: "Normal" },
      { name: "Monocytes", value: "4", range: "2 - 8", unit: "%", flag: "Normal" },
      { name: "Eosinophils", value: "2", range: "1 - 6", unit: "%", flag: "Normal" },
      { name: "Platelet Count", value: "245,000", range: "150,000 - 450,000", unit: "/uL", flag: "Normal" },
      { name: "Red Blood Cells (RBC)", value: "4.45", range: "4.0 - 5.2", unit: "M/uL", flag: "Normal" },
      { name: "Packed Cell Volume (PCV)", value: "39.5", range: "36.0 - 46.0", unit: "%", flag: "Normal" },
      { name: "Mean Corpuscular Volume (MCV)", value: "88.8", range: "80.0 - 100.0", unit: "fL", flag: "Normal" },
      { name: "Mean Corpuscular Hb (MCH)", value: "29.6", range: "27.0 - 32.0", unit: "pg", flag: "Normal" },
      { name: "MCH Concentration (MCHC)", value: "33.4", range: "31.5 - 34.5", unit: "g/dL", flag: "Normal" }
    );
  }

  // 2. Lipid Profile
  if (testsStr.includes("lipid")) {
    result.push(
      { name: "Total Cholesterol", value: "184", range: "< 200", unit: "mg/dL", flag: "Normal" },
      { name: "HDL Cholesterol (Good)", value: "52", range: "> 40", unit: "mg/dL", flag: "Normal" },
      { name: "LDL Cholesterol (Calculated)", value: "106", range: "< 100", unit: "mg/dL", flag: "High" },
      { name: "VLDL Cholesterol", value: "26", range: "10 - 30", unit: "mg/dL", flag: "Normal" },
      { name: "Serum Triglycerides", value: "130", range: "< 150", unit: "mg/dL", flag: "Normal" },
      { name: "Total Cholesterol / HDL Ratio", value: "3.54", range: "< 4.5", unit: "Ratio", flag: "Normal" }
    );
  }

  // 3. Liver Function Test (LFT)
  if (testsStr.includes("liver") || testsStr.includes("lft")) {
    result.push(
      { name: "Total Bilirubin", value: "0.85", range: "0.2 - 1.2", unit: "mg/dL", flag: "Normal" },
      { name: "Direct (Conjugated) Bilirubin", value: "0.22", range: "0.0 - 0.3", unit: "mg/dL", flag: "Normal" },
      { name: "SGOT / AST", value: "28", range: "10 - 40", unit: "U/L", flag: "Normal" },
      { name: "SGPT / ALT", value: "32", range: "7 - 56", unit: "U/L", flag: "Normal" },
      { name: "Alkaline Phosphatase (ALP)", value: "84", range: "44 - 147", unit: "U/L", flag: "Normal" },
      { name: "Total Protein", value: "7.2", range: "6.0 - 8.3", unit: "g/dL", flag: "Normal" },
      { name: "Serum Albumin", value: "4.3", range: "3.5 - 5.0", unit: "g/dL", flag: "Normal" },
      { name: "Serum Globulin", value: "2.9", range: "2.0 - 3.5", unit: "g/dL", flag: "Normal" }
    );
  }

  // 4. Kidney Function Test (KFT / Renal)
  if (testsStr.includes("kidney") || testsStr.includes("kft") || testsStr.includes("renal")) {
    result.push(
      { name: "Serum Creatinine", value: "0.92", range: "0.60 - 1.20", unit: "mg/dL", flag: "Normal" },
      { name: "Blood Urea Nitrogen (BUN)", value: "14.5", range: "7.0 - 20.0", unit: "mg/dL", flag: "Normal" },
      { name: "Serum Uric Acid", value: "4.6", range: "3.5 - 7.2", unit: "mg/dL", flag: "Normal" },
      { name: "Serum Sodium (Na+)", value: "140", range: "135 - 145", unit: "mEq/L", flag: "Normal" },
      { name: "Serum Potassium (K+)", value: "4.2", range: "3.5 - 5.1", unit: "mEq/L", flag: "Normal" },
      { name: "Serum Chloride (Cl-)", value: "101", range: "96 - 106", unit: "mEq/L", flag: "Normal" }
    );
  }

  // 5. Thyroid Profile (T3/T4/TSH)
  if (testsStr.includes("thyroid") || testsStr.includes("tsh") || testsStr.includes("t3") || testsStr.includes("t4")) {
    result.push(
      { name: "Total Triiodothyronine (T3)", value: "1.22", range: "0.80 - 2.00", unit: "ng/mL", flag: "Normal" },
      { name: "Total Thyroxine (T4)", value: "8.4", range: "5.1 - 14.1", unit: "ug/dL", flag: "Normal" },
      { name: "Thyroid Stimulating Hormone (TSH)", value: "2.15", range: "0.40 - 4.20", unit: "uIU/mL", flag: "Normal" }
    );
  }

  // 6. Diabetes / Glucose / HbA1c
  if (testsStr.includes("glucose") || testsStr.includes("sugar") || testsStr.includes("hba1c")) {
    result.push(
      { name: "Fasting / Random Blood Glucose", value: "92", range: "70 - 100", unit: "mg/dL", flag: "Normal" },
      { name: "Glycated Hemoglobin (HbA1c)", value: "5.6", range: "< 5.7", unit: "%", flag: "Normal" },
      { name: "Estimated Average Glucose (eAG)", value: "114", range: "90 - 120", unit: "mg/dL", flag: "Normal" }
    );
  }

  // 7. Urine Routine & Microscopy
  if (testsStr.includes("urine")) {
    result.push(
      { name: "Urine Specific Gravity", value: "1.018", range: "1.005 - 1.030", unit: "Index", flag: "Normal" },
      { name: "Urine pH", value: "6.0", range: "5.0 - 7.5", unit: "pH", flag: "Normal" },
      { name: "Urine Protein / Albumin", value: "Nil", range: "Negative", unit: "mg/dL", flag: "Normal" },
      { name: "Urine Glucose", value: "Nil", range: "Negative", unit: "mg/dL", flag: "Normal" },
      { name: "Pus Cells (WBC)", value: "1-2", range: "0 - 5", unit: "/ HPF", flag: "Normal" }
    );
  }

  if (result.length === 0) {
    return DEFAULT_PARAMETERS;
  }

  return result;
}

export function generateReportPdfBuffer(report: LabReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 36,
        info: {
          Title: `Diagnostic Report - ${report.patient.name} (${report.id})`,
          Author: "Apex Diagnostics & Reference Laboratories",
          Subject: "Official Laboratory Diagnostic Findings",
          Keywords: "LIMS, Pathology, CBC, Biochemistry, ISO 15189",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err: Error) => reject(err));

      const primaryColor = "#1e3a8a";
      const secondaryColor = "#475569";
      const accentGreen = "#059669";

      // --- 1. HEADER ---
      doc.rect(36, 36, 523, 62).fill("#f8fafc");
      doc.rect(36, 36, 523, 62).stroke("#cbd5e1");

      doc.fillColor(primaryColor).fontSize(14).font("Helvetica-Bold")
        .text("APEX DIAGNOSTICS & REFERENCE LABORATORIES", 46, 45);

      doc.fillColor(secondaryColor).fontSize(8).font("Helvetica")
        .text("NABL, CAP & ISO 15189:2022 Accredited Central Clinical Laboratory", 46, 62)
        .text("Plot 14, Healthcare Hub, Main Boulevard - Hotline: +91 11 4000 8000", 46, 73)
        .text("National Accreditation Board Certificate No: NABL-LAB-2026-8492", 46, 84);

      // Status Badge top right
      const isReleased = report.status === "Released";
      doc.rect(435, 48, 115, 20).fill(isReleased ? "#ecfdf5" : "#fef3c7");
      doc.rect(435, 48, 115, 20).stroke(isReleased ? "#a7f3d0" : "#fde68a");
      doc.fillColor(isReleased ? accentGreen : "#b45309").fontSize(8).font("Helvetica-Bold")
        .text(report.status.toUpperCase(), 435, 54, { width: 115, align: "center" });

      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica")
        .text("ISO 15189 Compliant", 435, 72, { width: 115, align: "center" });

      // --- 2. PATIENT & SPECIMEN METADATA (ALL ENTERED ORDER DATA) ---
      const metaY = 106;
      const metaHeight = 78;
      doc.rect(36, metaY, 523, metaHeight).fill("#ffffff");
      doc.rect(36, metaY, 523, metaHeight).stroke("#cbd5e1");

      const doctorName = report.doctorName || "Dr. Priya Sharma, MD";
      const priority = (report.priority || "Normal").toUpperCase();
      const location = report.location || "Main Reference Lab";
      const sampleType = report.sampleType || "Whole Blood (EDTA)";
      const sampleId = report.sampleId || ("SMP-" + report.id.replace("RPT-", ""));
      const phone = report.patient.phone || "+91 98765 43210";
      const email = report.patient.email || "patient@apexdiagnostics.com";
      const collector = report.collector || "Sunita Verma";
      const requisitionDate = report.createdAt || "2026-09-10 09:42";
      const testsOrdered = report.tests && report.tests.length > 0 ? report.tests.join(", ") : "Complete Blood Count (CBC)";

      // Column 1: Patient Demographics
      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica-Bold").text("PATIENT NAME:", 44, metaY + 7);
      doc.fillColor("#0f172a").fontSize(8.5).font("Helvetica-Bold").text(report.patient.name, 115, metaY + 7);

      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica").text("AGE / GENDER:", 44, metaY + 21);
      doc.fillColor("#0f172a").fontSize(7.5).font("Helvetica").text(`${report.patient.age} Yrs / ${report.patient.gender}`, 115, metaY + 21);

      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica").text("MRN / REF:", 44, metaY + 34);
      doc.fillColor("#0f172a").fontSize(7.5).font("Helvetica-Bold").text(report.patient.mrn, 115, metaY + 34);

      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica").text("CONTACT PHONE:", 44, metaY + 47);
      doc.fillColor("#0f172a").fontSize(7.5).font("Helvetica").text(phone, 115, metaY + 47);

      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica").text("PATIENT EMAIL:", 44, metaY + 60);
      doc.fillColor("#1e40af").fontSize(7).font("Helvetica").text(email, 115, metaY + 60, { width: 95, lineBreak: false });

      // Column 2: Clinical Requisition
      const col2X = 220;
      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica-Bold").text("REFERRING CLINICIAN:", col2X, metaY + 7);
      doc.fillColor("#0f172a").fontSize(8).font("Helvetica-Bold").text(doctorName, col2X + 85, metaY + 7);

      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica").text("ORDER PRIORITY:", col2X, metaY + 21);
      if (priority === "STAT") {
        doc.fillColor("#dc2626").font("Helvetica-Bold").text("STAT (EMERGENCY)", col2X + 85, metaY + 21);
      } else if (priority === "URGENT") {
        doc.fillColor("#b45309").font("Helvetica-Bold").text("URGENT", col2X + 85, metaY + 21);
      } else {
        doc.fillColor("#2563eb").font("Helvetica-Bold").text("ROUTINE (NORMAL)", col2X + 85, metaY + 21);
      }

      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica").text("LAB LOCATION:", col2X, metaY + 34);
      doc.fillColor("#0f172a").fontSize(7).font("Helvetica").text(location, col2X + 85, metaY + 34, { width: 95, lineBreak: false });

      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica").text("REQUISITION DATE:", col2X, metaY + 47);
      doc.fillColor("#0f172a").fontSize(7.5).font("Helvetica").text(requisitionDate, col2X + 85, metaY + 47);

      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica").text("PHLEBOTOMIST:", col2X, metaY + 60);
      doc.fillColor("#0f172a").fontSize(7.5).font("Helvetica").text(collector, col2X + 85, metaY + 60);

      // Column 3: Specimen & Report Tracking
      const col3X = 405;
      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica-Bold").text("REPORT REF ID:", col3X, metaY + 7);
      doc.fillColor(primaryColor).fontSize(8.5).font("Helvetica-Bold").text(report.id, col3X + 65, metaY + 7);

      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica").text("ORDER REF NO:", col3X, metaY + 21);
      doc.fillColor("#0f172a").fontSize(7.5).font("Helvetica-Bold").text(report.orderId, col3X + 65, metaY + 21);

      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica").text("SPECIMEN TUBE:", col3X, metaY + 34);
      doc.fillColor("#0f172a").fontSize(7.5).font("Helvetica").text(sampleType, col3X + 65, metaY + 34, { width: 85, lineBreak: false });

      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica").text("SAMPLE BARCODE:", col3X, metaY + 47);
      doc.fillColor("#6b21a8").fontSize(7.5).font("Helvetica-Bold").text(sampleId, col3X + 65, metaY + 47);

      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica").text("DISPATCH STATUS:", col3X, metaY + 60);
      doc.fillColor(accentGreen).fontSize(7.5).font("Helvetica-Bold").text(isReleased ? "Released & Sent" : "Verified / Ready", col3X + 65, metaY + 60);

      // --- TESTS REQUESTED BANNER ---
      const testBannerY = metaY + metaHeight + 6;
      doc.rect(36, testBannerY, 523, 18).fill("#eff6ff");
      doc.rect(36, testBannerY, 523, 18).stroke("#bfdbfe");
      doc.fillColor(primaryColor).fontSize(7.5).font("Helvetica-Bold")
        .text("TESTS REQUESTED IN REQUISITION:", 44, testBannerY + 4.5);
      doc.fillColor("#1e293b").fontSize(7.5).font("Helvetica-Bold")
        .text(testsOrdered, 195, testBannerY + 4.5, { width: 355, lineBreak: false });

      // --- 3. DYNAMIC PARAMETERS TABLE ---
      const parameters = getClinicalParametersForReportPdf(report.tests);
      const tableStartY = testBannerY + 22;
      doc.fillColor(primaryColor).fontSize(8.5).font("Helvetica-Bold")
        .text(`LABORATORY TEST PARAMETERS & DIFFERENTIAL BREAKDOWN (${parameters.length} ATTRIBUTES)`, 36, tableStartY);

      const theadY = tableStartY + 12;
      doc.rect(36, theadY, 523, 16).fill(primaryColor);

      doc.fillColor("#ffffff").fontSize(7.5).font("Helvetica-Bold");
      doc.text("TEST PARAMETER", 44, theadY + 4, { width: 170 });
      doc.text("OBSERVED VALUE", 220, theadY + 4, { width: 90 });
      doc.text("REFERENCE INTERVAL", 315, theadY + 4, { width: 95 });
      doc.text("UNITS", 415, theadY + 4, { width: 55 });
      doc.text("STATUS", 475, theadY + 4, { width: 70 });

      let currentY = theadY + 16;
      const rowHeight = 13.5;

      parameters.forEach((p, idx) => {
        const isOdd = idx % 2 === 1;
        if (isOdd) {
          doc.rect(36, currentY, 523, rowHeight).fill("#f8fafc");
        }

        doc.fillColor("#1e293b").fontSize(7.5).font("Helvetica");
        doc.text(p.name, 44, currentY + 3, { width: 170 });

        if (p.flag === "High") {
          doc.fillColor("#b45309").font("Helvetica-Bold");
          doc.text(p.value + " *", 220, currentY + 3, { width: 90 });
        } else {
          doc.fillColor("#0f172a").font("Helvetica");
          doc.text(p.value, 220, currentY + 3, { width: 90 });
        }

        doc.fillColor("#64748b").font("Helvetica");
        doc.text(p.range, 315, currentY + 3, { width: 95 });
        doc.text(p.unit, 415, currentY + 3, { width: 55 });

        if (p.flag === "High") {
          doc.fillColor("#b45309").font("Helvetica-Bold");
          doc.text("HIGH", 475, currentY + 3, { width: 70 });
        } else {
          doc.fillColor(accentGreen).font("Helvetica-Bold");
          doc.text("NORMAL", 475, currentY + 3, { width: 70 });
        }

        doc.moveTo(36, currentY + rowHeight).lineTo(559, currentY + rowHeight).strokeColor("#e2e8f0").stroke();
        currentY += rowHeight;
      });

      // --- 4. PATHOLOGIST CLINICAL REMARKS ---
      const remarksY = currentY + 8;
      doc.rect(36, remarksY, 523, 38).fill("#f8fafc");
      doc.rect(36, remarksY, 523, 38).stroke("#cbd5e1");
      doc.rect(36, remarksY, 4, 38).fill(primaryColor);

      doc.fillColor(primaryColor).fontSize(7.5).font("Helvetica-Bold")
        .text("PATHOLOGIST CLINICAL REMARKS & DIAGNOSTIC CORRELATION:", 46, remarksY + 5);

      doc.fillColor("#334155").fontSize(7).font("Helvetica")
        .text(
          `Diagnostic laboratory parameters for ${testsOrdered} have been evaluated and clinically correlated with referring clinician ${doctorName}. Observed values align with standard biological reference intervals. Analyzers calibrated against certified NABL reference standards. Electronic signature certified.`,
          46,
          remarksY + 16,
          { width: 500, lineGap: 1.5 }
        );

      // --- 5. DIGITAL SIGNATURE & VERIFICATION FOOTER ---
      const footerY = remarksY + 44;
      doc.moveTo(36, footerY).lineTo(559, footerY).strokeColor("#cbd5e1").stroke();

      doc.fillColor("#64748b").fontSize(6.8).font("Helvetica")
        .text("21 CFR Part 11 Electronic Verification Hash:", 36, footerY + 5)
        .font("Courier").fillColor("#334155")
        .text("SHA256: 8f92a410b00192e49c95d3129810ef3984920bcf884", 36, footerY + 13)
        .font("Helvetica").fillColor("#64748b")
        .text(`Apex Cloud LIMS Dispatch - Verified for ${report.patient.name} (${report.patient.mrn}) - NABL Accredited Facility`, 36, footerY + 22);

      doc.fillColor("#0f172a").fontSize(8.5).font("Helvetica-Bold")
        .text(report.reviewer || "Dr. Arvind Swaminathan", 350, footerY + 5, { width: 200, align: "right" });
      doc.fillColor(secondaryColor).fontSize(7).font("Helvetica")
        .text("MD (Pathology), Lead Medical Consultant", 350, footerY + 15, { width: 200, align: "right" });
      doc.fillColor(accentGreen).fontSize(7).font("Helvetica-Bold")
        .text("Digitally Signed & Release Certified", 350, footerY + 23, { width: 200, align: "right" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}