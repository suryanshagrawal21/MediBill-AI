// Client-side PDF generation utilities using the browser's print API
// These create real downloadable content without needing a backend

import type { AnalysisResult } from "./mockData"

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`
}

export function downloadHtmlAsPdf(htmlContent: string, filename: string) {
  const printWindow = window.open("", "_blank")
  if (!printWindow) return
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
    // printWindow.close() // don't auto-close so user can save 
  }, 500)
}

export function generateReportHTML(data: AnalysisResult): string {
  const rows = data.items.map(item => `
    <tr style="${item.overcharge > 0 ? "background:#fff5f5;" : ""}">
      <td style="padding:10px 14px; border-bottom:1px solid #e5e7eb;">${item.item}</td>
      <td style="padding:10px 14px; border-bottom:1px solid #e5e7eb; text-align:right;">${formatCurrency(item.charged)}</td>
      <td style="padding:10px 14px; border-bottom:1px solid #e5e7eb; text-align:right; color:#15803d;">${formatCurrency(item.benchmark)}</td>
      <td style="padding:10px 14px; border-bottom:1px solid #e5e7eb; text-align:right;">
        ${item.overcharge > 0 ? `<span style="background:#fee2e2;color:#b91c1c;padding:2px 8px;border-radius:99px;font-size:12px;font-weight:600;">+${formatCurrency(item.overcharge)}</span>` : "—"}
      </td>
    </tr>
  `).join("")

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>MediBill AI – Overcharge Report</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px; color: #111827; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 3px solid #0d9488; }
  .logo { font-size: 24px; font-weight: 800; color: #0d9488; }
  .logo span { color: #0d9488; }
  .badge { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
  .info-item label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
  .info-item p { font-size: 15px; font-weight: 600; margin: 2px 0 0 0; }
  .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 28px; }
  .summary-card { padding: 16px; border-radius: 10px; border: 1px solid #e2e8f0; }
  .summary-card.red { background: #fef2f2; border-color: #fecaca; }
  .summary-card.green { background: #f0fdf4; border-color: #bbf7d0; }
  .summary-card label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; display: block; margin-bottom: 4px; }
  .summary-card .value { font-size: 22px; font-weight: 800; }
  .summary-card.red .value { color: #dc2626; }
  .summary-card.green .value { color: #16a34a; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  thead { background: #f1f5f9; }
  thead th { padding: 12px 14px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
  .footer { margin-top: 40px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">MediBill <span>AI</span></div>
      <div style="font-size:13px;color:#64748b;margin-top:4px;">Medical Bill Overcharge Detection Report</div>
    </div>
    <div>
      <span class="badge"> ${data.overcharge_percentage}% Overcharged</span>
      <div style="font-size:12px;color:#9ca3af;text-align:right;margin-top:6px;">Generated: ${new Date().toLocaleDateString("en-IN")}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-item"><label>Patient Name</label><p>${data.patient.patient_name}</p></div>
    <div class="info-item"><label>Hospital</label><p>${data.patient.hospital_name}</p></div>
    <div class="info-item"><label>Bill Number</label><p>${data.patient.bill_number}</p></div>
    <div class="info-item"><label>Date</label><p>${data.patient.date}</p></div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <label>Total Billed</label>
      <div class="value">${formatCurrency(data.total_charged)}</div>
    </div>
    <div class="summary-card green">
      <label>Fair Market Price</label>
      <div class="value">${formatCurrency(data.total_benchmark)}</div>
    </div>
    <div class="summary-card red">
      <label>Total Overcharge</label>
      <div class="value">${formatCurrency(data.total_overcharge)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item / Description</th>
        <th style="text-align:right;">Charged</th>
        <th style="text-align:right;">Benchmark</th>
        <th style="text-align:right;">Overcharge</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">
    <p>MediBill AI | Benchmarks based on CGHS / NPPA standards | This report is auto-generated and intended for patient use only.</p>
  </div>
</body>
</html>`
}

export function generateLetterHTML(data: AnalysisResult): string {
  const itemsList = data.items
    .filter(i => i.overcharge > 0)
    .map(item => `<li><strong>${item.item}:</strong> Charged at ${formatCurrency(item.charged)} against a government benchmark of ${formatCurrency(item.benchmark)} — excess of ${formatCurrency(item.overcharge)}.</li>`)
    .join("")

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Legal Complaint Letter – ${data.patient.hospital_name}</title>
<style>
  body { font-family: 'Times New Roman', Times, serif; max-width: 780px; margin: 0 auto; padding: 60px 60px; font-size: 15px; line-height: 1.8; color: #1a1a1a; }
  .header-line { border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; margin-bottom: 30px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #555; font-family: Arial, sans-serif; }
  .subject { border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 10px 0; margin: 24px 0; text-align: center; font-weight: bold; text-transform: uppercase; letter-spacing: 0.06em; font-size: 13px; font-family: Arial, sans-serif; }
  ul { padding-left: 20px; margin: 10px 0; }
  li { margin-bottom: 6px; }
  .signature-block { margin-top: 60px; }
  .signature-line { border-bottom: 1px solid #333; width: 200px; margin-top: 40px; margin-bottom: 5px; }
  @media print { body { padding: 40px; } }
</style>
</head>
<body>
  <div class="header-line">Formal Legal Complaint Notice · Ref: OVC-${new Date().getFullYear()}-${data.patient.bill_number.slice(-5)}</div>

  <p>To,</p>
  <p>The Medical Superintendent,<br>
  <strong>${data.patient.hospital_name}</strong></p>

  <p style="text-align:right;">Date: ${data.patient.date}</p>

  <div class="subject">Subject: Formal Complaint Regarding Inflated Medical Bill – Bill No. ${data.patient.bill_number}</div>

  <p>Dear Sir/Madam,</p>

  <p>I, <strong>${data.patient.patient_name}</strong>, am writing to formally raise a serious concern regarding my medical bill (Bill No: <strong>${data.patient.bill_number}</strong>) generated by <strong>${data.patient.hospital_name}</strong> dated <strong>${data.patient.date}</strong>.</p>

  <p>Upon careful review and comparative AI analysis of the final billing summary, I have found that the following items have been charged at rates grossly exceeding the government-mandated CGHS/NPPA benchmark rates:</p>

  <ul>${itemsList}</ul>

  <p>The total overcharge amounts to <strong>${formatCurrency(data.total_overcharge)}</strong>, representing a <strong>${data.overcharge_percentage}%</strong> excess over the fair market benchmark price of ${formatCurrency(data.total_benchmark)}.</p>

  <p>These inflated charges are in direct violation of the pricing guidelines established under the Central Government Health Scheme (CGHS) and the National Pharmaceutical Pricing Authority (NPPA).</p>

  <p>I hereby formally request:</p>
  <ol>
    <li>A thorough review of the billing discrepancies identified herein.</li>
    <li>An immediate refund or credit note for the excess amount of <strong>${formatCurrency(data.total_overcharge)}</strong>.</li>
    <li>A written acknowledgment of this complaint within 7 working days.</li>
  </ol>

  <p>Please be advised that if satisfactory corrective action is not taken within the stipulated period, I shall be compelled to escalate this matter to the State Health Department, the National Consumer Helpline (1800-11-4000), and initiate proceedings before the Consumer Disputes Redressal Forum.</p>

  <div class="signature-block">
    <p>Yours sincerely,</p>
    <div class="signature-line"></div>
    <p><strong>${data.patient.patient_name}</strong><br>
    <span style="font-size:13px;color:#555;">Patient / Authorized Signatory</span></p>
  </div>
</body>
</html>`
}

export function generateMailtoLink(data: AnalysisResult): string {
  const subject = encodeURIComponent(`Formal Complaint – Inflated Bill: ${data.patient.bill_number}`)
  const body = encodeURIComponent(
    `Dear Sir/Madam,\n\nI, ${data.patient.patient_name}, am formally complaining about an overcharge of ₹${data.total_overcharge.toLocaleString("en-IN")} (${data.overcharge_percentage}%) in my bill (${data.patient.bill_number}) at ${data.patient.hospital_name} dated ${data.patient.date}.\n\nKindly review this at the earliest.\n\nRequest details are available upon inquiry.\n\nSincerely,\n${data.patient.patient_name}`
  )
  return `mailto:?subject=${subject}&body=${body}`
}
