import { jsPDF } from "jspdf";
import type { SoilResult, DiseaseResult } from "@/lib/api";

type Lang = "en" | "ta";

const PDF_STRINGS = {
  en: {
    soilReport: "SOIL ANALYSIS REPORT",
    plantReport: "PLANT DISEASE DETECTION REPORT",
    confidence: "Confidence",
    certainty: "Certainty",
    soilParameters: "SOIL PARAMETERS",
    nitrogen: "Nitrogen (N)",
    phosphorus: "Phosphorus (P)",
    potassium: "Potassium (K)",
    ph: "pH Level",
    environment: "ENVIRONMENT CONDITIONS",
    temperature: "Temperature",
    humidity: "Humidity",
    moisture: "Moisture",
    rainfall: "Rainfall",
    soilProperties: "SOIL PROPERTIES",
    drainage: "Drainage",
    fertility: "Fertility",
    waterRetention: "Water Retention",
    texture: "Texture",
    phRange: "pH Range",
    bestCrops: "RECOMMENDED CROPS",
    fertilizer: "FERTILIZER RECOMMENDATION",
    irrigation: "IRRIGATION ADVICE",
    improvementTips: "SOIL IMPROVEMENT TIPS",
    npkChart: "NPK Nutrient Levels (kg/ha)",
    envChart: "Environment Conditions",
    soilType: "Soil Type",
    disease: "Detected Disease",
    description: "Description",
    symptoms: "SYMPTOMS",
    organicTreatment: "ORGANIC TREATMENT",
    chemicalTreatment: "CHEMICAL TREATMENT",
    prevention: "PREVENTION TIPS",
    confidenceChart: "Detection Confidence",
    treatmentChart: "Treatment Overview",
    poweredBy: "Powered by TechTrack AI",
    page: "Page",
  },
  ta: {
    soilReport: "மண் பகுப்பாய்வு அறிக்கை",
    plantReport: "தாவர நோய் கண்டறிதல் அறிக்கை",
    confidence: "நம்பகத்தன்மை",
    certainty: "நிச்சயத்தன்மை",
    soilParameters: "மண் அளவுருக்கள்",
    nitrogen: "நைட்ரஜன் (N)",
    phosphorus: "பாஸ்பரஸ் (P)",
    potassium: "பொட்டாசியம் (K)",
    ph: "pH அளவு",
    environment: "சுற்றுச்சூழல் நிலைமைகள்",
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    moisture: "நீர்ச்சத்து",
    rainfall: "மழைப்பொழிவு",
    soilProperties: "மண் பண்புகள்",
    drainage: "வடிகால்",
    fertility: "வளம்",
    waterRetention: "நீர் தேக்கம்",
    texture: "அமைப்பு",
    phRange: "pH வரம்பு",
    bestCrops: "பரிந்துரைக்கப்பட்ட பயிர்கள்",
    fertilizer: "உர பரிந்துரை",
    irrigation: "நீர்ப்பாசன ஆலோசனை",
    improvementTips: "மண் மேம்பாட்டு குறிப்புகள்",
    npkChart: "NPK ஊட்டச்சத்து அளவுகள் (kg/ha)",
    envChart: "சுற்றுச்சூழல் நிலைமைகள்",
    soilType: "மண் வகை",
    disease: "கண்டறியப்பட்ட நோய்",
    description: "விளக்கம்",
    symptoms: "அறிகுறிகள்",
    organicTreatment: "இயற்கை சிகிச்சை",
    chemicalTreatment: "இரசாயன சிகிச்சை",
    prevention: "தடுப்பு குறிப்புகள்",
    confidenceChart: "கண்டறிதல் நம்பகத்தன்மை",
    treatmentChart: "சிகிச்சை கண்ணோட்டம்",
    poweredBy: "TechTrack AI ஆல் இயக்கப்படுகிறது",
    page: "பக்கம்",
  },
};

const C = {
  primary:   [34, 139, 34]   as [number, number, number],
  accent:    [255, 140, 0]   as [number, number, number],
  info:      [30, 144, 255]  as [number, number, number],
  danger:    [220, 53, 69]   as [number, number, number],
  light:     [245, 245, 245] as [number, number, number],
  white:     [255, 255, 255] as [number, number, number],
  dark:      [30, 30, 30]    as [number, number, number],
  muted:     [120, 120, 120] as [number, number, number],
  headerBg:  [22, 101, 52]   as [number, number, number],
  sectionBg: [240, 253, 244] as [number, number, number],
};


// ─── Drawing helpers ──────────────────────────────────────────────────────────
function drawRoundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, color: [number, number, number]) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, w, h, r, r, "F");
}

function sectionHeader(doc: jsPDF, text: string, y: number, pageW: number): number {
  drawRoundedRect(doc, 14, y, pageW - 28, 8, 2, C.primary);
  doc.setTextColor(...C.white);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(text, 18, y + 5.5);
  doc.setTextColor(...C.dark);
  return y + 12;
}

function kv(doc: jsPDF, label: string, value: string, x: number, y: number, labelW = 55) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.muted);
  doc.text(label, x, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.dark);
  doc.text(value, x + labelW, y);
}

function addFooter(doc: jsPDF, pageW: number, pageH: number, s: typeof PDF_STRINGS["en"]) {
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.3);
  doc.line(14, pageH - 12, pageW - 14, pageH - 12);
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.setFont("helvetica", "italic");
  doc.text(s.poweredBy, 14, pageH - 7);
  doc.text(`${s.page} ${doc.getCurrentPageInfo().pageNumber}`, pageW - 14, pageH - 7, { align: "right" });
}

function drawHeader(doc: jsPDF, title: string, subtitle: string, pageW: number) {
  doc.setFillColor(...C.headerBg);
  doc.rect(0, 0, pageW, 38, "F");
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(title, 14, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(subtitle, 14, 24);
  doc.setFontSize(7.5);
  doc.setTextColor(200, 240, 200);
  const now = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  doc.text(now, 14, 32);
}

// ─── Bar chart ────────────────────────────────────────────────────────────────
interface BarData { label: string; value: number; max: number; color: [number, number, number] }

function drawBarChart(
  doc: jsPDF, title: string, bars: BarData[],
  x: number, y: number, chartW: number, barH = 10, gap = 5,
): number {
  const totalH = bars.length * (barH + gap) + 20;
  drawRoundedRect(doc, x, y, chartW, totalH, 3, C.light);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.dark);
  doc.text(title, x + chartW / 2, y + 7, { align: "center" });

  let cy = y + 13;
  const labelW = 40;
  const barAreaX = x + labelW + 2;
  const barAreaW = chartW - labelW - 18;

  for (const bar of bars) {
    const pct = Math.min(bar.value / bar.max, 1);
    const filledW = Math.max(pct * barAreaW, 1);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    doc.text(bar.label, x + 2, cy + barH / 2 + 2.5, { maxWidth: labelW - 2 });

    // track
    drawRoundedRect(doc, barAreaX, cy, barAreaW, barH, 2, [220, 220, 220]);
    // fill
    drawRoundedRect(doc, barAreaX, cy, filledW, barH, 2, bar.color);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    if (filledW > 12) {
      doc.setTextColor(...C.white);
      doc.text(`${bar.value}`, barAreaX + filledW - 3, cy + barH / 2 + 2.5, { align: "right" });
    } else {
      doc.setTextColor(...C.dark);
      doc.text(`${bar.value}`, barAreaX + filledW + 2, cy + barH / 2 + 2.5);
    }
    cy += barH + gap;
  }
  return y + totalH + 4;
}

function drawConfidenceGauge(doc: jsPDF, label: string, pct: number, x: number, y: number, w: number): number {
  const color: [number, number, number] = pct >= 80 ? C.primary : pct >= 60 ? C.accent : C.danger;
  drawRoundedRect(doc, x, y, w, 8, 2, [220, 220, 220]);
  drawRoundedRect(doc, x, y, Math.max((pct / 100) * w, 2), 8, 2, color);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.dark);
  doc.text(`${label}: ${pct}%`, x, y - 2);
  return y + 12;
}


// ═══════════════════════════════════════════════════════════════════════════════
// SOIL REPORT
// ═══════════════════════════════════════════════════════════════════════════════
export async function downloadSoilReport(result: SoilResult, imageDataUrl?: string, lang: Lang = "en") {
  const s = PDF_STRINGS[lang];
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  drawHeader(doc, s.soilReport, `${s.soilType}: ${result.soil_type}`, pageW);
  let y = 44;

  // Soil image
  if (imageDataUrl) {
    try {
      doc.addImage(imageDataUrl, "JPEG", pageW - 64, y, 50, 40);
      doc.setDrawColor(...C.primary);
      doc.setLineWidth(0.5);
      doc.rect(pageW - 64, y, 50, 40, "S");
    } catch { /* skip */ }
  }

  // Confidence gauge
  const pct = Math.round(result.confidence * 100);
  y = drawConfidenceGauge(doc, s.confidence, pct, 14, y, pageW - 82);
  y += 2;

  // Soil type badge
  drawRoundedRect(doc, 14, y, 80, 10, 3, C.sectionBg);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.primary);
  doc.text(`${s.soilType}: ${result.soil_type}`, 18, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(`${s.certainty}: ${result.certainty}`, 18, y + 14);
  y += 20;

  // NPK bar chart
  if (result.soil_parameters) {
    const { nitrogen, phosphorus, potassium, ph } = result.soil_parameters;
    const npkBars: BarData[] = [
      { label: s.nitrogen,   value: nitrogen,   max: 140, color: C.primary },
      { label: s.phosphorus, value: phosphorus, max: 145, color: C.accent },
      { label: s.potassium,  value: potassium,  max: 205, color: C.info },
      { label: s.ph,         value: ph,         max: 14,  color: C.danger },
    ];
    y = drawBarChart(doc, s.npkChart, npkBars, 14, y, pageW - 28);
  }

  // Environment bar chart
  if (result.environment) {
    const { temperature, humidity, moisture, rainfall } = result.environment;
    const envBars: BarData[] = [
      { label: s.temperature, value: temperature, max: 50,  color: C.danger },
      { label: s.humidity,    value: humidity,    max: 100, color: C.info },
      { label: s.moisture,    value: moisture,    max: 100, color: C.primary },
      { label: s.rainfall,    value: rainfall,    max: 300, color: C.accent },
    ];
    y = drawBarChart(doc, s.envChart, envBars, 14, y, pageW - 28);
  }

  // Soil properties table
  y = sectionHeader(doc, s.soilProperties, y, pageW);
  const props: [string, string][] = [
    [s.drainage,       result.properties.drainage],
    [s.fertility,      result.properties.fertility],
    [s.waterRetention, result.properties.water_retention],
    [s.texture,        result.properties.texture],
    [s.phRange,        result.properties.ph_range],
  ];
  for (let i = 0; i < props.length; i++) {
    const rowY = y + i * 8;
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 248);
      doc.rect(14, rowY - 3, pageW - 28, 8, "F");
    }
    kv(doc, props[i][0], props[i][1], 16, rowY + 2);
  }
  y += props.length * 8 + 4;

  // Best crops
  y = sectionHeader(doc, s.bestCrops, y, pageW);
  let cx = 16;
  for (const crop of result.recommendations.crops) {
    const tw = doc.getTextWidth(crop) + 8;
    if (cx + tw > pageW - 14) { cx = 16; y += 10; }
    drawRoundedRect(doc, cx, y - 4, tw, 8, 2, C.sectionBg);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.primary);
    doc.text(crop, cx + 4, y + 1.5);
    cx += tw + 4;
  }
  y += 14;

  // Page 2 — recommendations
  doc.addPage();
  doc.setFillColor(...C.headerBg);
  doc.rect(0, 0, pageW, 12, "F");
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(s.soilReport, 14, 8);
  y = 18;

  y = sectionHeader(doc, s.fertilizer, y, pageW);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.dark);
  const fertLines = doc.splitTextToSize(result.recommendations.fertilizer, pageW - 30);
  doc.text(fertLines, 16, y);
  y += fertLines.length * 5 + 6;

  y = sectionHeader(doc, s.irrigation, y, pageW);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.dark);
  const irrLines = doc.splitTextToSize(result.recommendations.irrigation, pageW - 30);
  doc.text(irrLines, 16, y);
  y += irrLines.length * 5 + 6;

  if (result.recommendations.improvement_tips.length > 0) {
    y = sectionHeader(doc, s.improvementTips, y, pageW);
    for (const tip of result.recommendations.improvement_tips) {
      const tipLines = doc.splitTextToSize(`• ${tip}`, pageW - 32);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.dark);
      doc.text(tipLines, 16, y);
      y += tipLines.length * 5 + 3;
    }
  }

  // Footers on both pages
  addFooter(doc, pageW, pageH, s);
  doc.setPage(1);
  addFooter(doc, pageW, pageH, s);

  doc.save(`soil-report-${result.soil_type.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISEASE / PLANT REPORT
// ═══════════════════════════════════════════════════════════════════════════════
export async function downloadDiseaseReport(result: DiseaseResult, imageDataUrl?: string, lang: Lang = "en") {
  const s = PDF_STRINGS[lang];
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const isHealthy = result.disease.toLowerCase().includes("healthy");
  const badgeColor: [number, number, number] = isHealthy ? C.primary : C.accent;

  drawHeader(doc, s.plantReport, result.disease, pageW);
  let y = 44;

  // Plant image
  if (imageDataUrl) {
    try {
      doc.addImage(imageDataUrl, "JPEG", pageW - 64, y, 50, 40);
      doc.setDrawColor(...badgeColor);
      doc.setLineWidth(0.5);
      doc.rect(pageW - 64, y, 50, 40, "S");
    } catch { /* skip */ }
  }

  // Confidence gauge
  const pct = Math.round(result.confidence * 100);
  y = drawConfidenceGauge(doc, s.confidence, pct, 14, y, pageW - 82);
  y += 2;

  // Disease badge
  drawRoundedRect(doc, 14, y, pageW - 80, 10, 3, isHealthy ? C.sectionBg : [255, 248, 235]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...badgeColor);
  doc.text(result.disease, 18, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(`${s.certainty}: ${result.certainty}`, 18, y + 14);
  y += 22;

  // Confidence bar chart
  const confBars: BarData[] = [
    { label: s.confidence, value: pct, max: 100, color: pct >= 80 ? C.primary : pct >= 60 ? C.accent : C.danger },
  ];
  y = drawBarChart(doc, s.confidenceChart, confBars, 14, y, pageW - 28, 12);

  // Description
  y = sectionHeader(doc, s.description, y, pageW);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.dark);
  const descLines = doc.splitTextToSize(result.description, pageW - 30);
  doc.text(descLines, 16, y);
  y += descLines.length * 5 + 6;

  // Symptoms
  if (!isHealthy && result.symptoms.length > 0) {
    y = sectionHeader(doc, s.symptoms, y, pageW);
    for (const sym of result.symptoms) {
      const lines = doc.splitTextToSize(`• ${sym}`, pageW - 32);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.dark);
      doc.text(lines, 16, y);
      y += lines.length * 5 + 2;
    }
    y += 4;
  }

  // Treatment bar chart (organic vs chemical count)
  if (!isHealthy) {
    const organicCount = result.treatment.organic.length;
    const chemCount = result.treatment.chemical.length;
    if (organicCount + chemCount > 0) {
      const maxVal = Math.max(organicCount, chemCount, 1);
      const treatBars: BarData[] = [];
      if (organicCount > 0) treatBars.push({ label: s.organicTreatment,  value: organicCount, max: maxVal, color: C.primary });
      if (chemCount > 0)    treatBars.push({ label: s.chemicalTreatment, value: chemCount,    max: maxVal, color: C.accent });
      y = drawBarChart(doc, s.treatmentChart, treatBars, 14, y, pageW - 28, 10);
    }
  }

  // Organic treatment
  if (!isHealthy && result.treatment.organic.length > 0) {
    y = sectionHeader(doc, s.organicTreatment, y, pageW);
    for (let i = 0; i < result.treatment.organic.length; i++) {
      const lines = doc.splitTextToSize(`${i + 1}. ${result.treatment.organic[i]}`, pageW - 32);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.dark);
      doc.text(lines, 16, y);
      y += lines.length * 5 + 2;
    }
    y += 4;
  }

  // Chemical treatment
  if (!isHealthy && result.treatment.chemical.length > 0) {
    y = sectionHeader(doc, s.chemicalTreatment, y, pageW);
    for (const chem of result.treatment.chemical) {
      const lines = doc.splitTextToSize(`• ${chem}`, pageW - 32);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.dark);
      doc.text(lines, 16, y);
      y += lines.length * 5 + 2;
    }
    y += 4;
  }

  // Prevention
  if (result.prevention.length > 0) {
    y = sectionHeader(doc, s.prevention, y, pageW);
    for (const tip of result.prevention) {
      const lines = doc.splitTextToSize(`• ${tip}`, pageW - 32);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.dark);
      doc.text(lines, 16, y);
      y += lines.length * 5 + 2;
    }
  }

  addFooter(doc, pageW, pageH, s);
  doc.save(`plant-report-${result.disease.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
