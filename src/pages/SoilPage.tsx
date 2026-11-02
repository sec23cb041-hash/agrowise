import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, FlaskConical, Upload, Loader2, AlertTriangle, CheckCircle,
  Leaf, Droplets, Sprout, Thermometer, CloudRain, FlaskRound, Beaker, Download,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { predictSoilType, type SoilResult } from "@/lib/api";
import { compressImage } from "@/lib/imageUtils";
import { downloadSoilReport } from "@/lib/reportGenerator";
import { useLang } from "@/i18n/LanguageContext";

function ConfidenceBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-success" : pct >= 60 ? "bg-accent" : "bg-destructive";
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-semibold">{label}</span>
        <span className="font-bold tabular-nums">{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SoilPage() {
  const { t, lang } = useLang();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SoilResult | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Grab GPS coords on mount for weather enrichment
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => { /* GPS denied — weather will be omitted */ },
      { timeout: 8000 }
    );
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setResult(null);
    setError(null);
    setPreview(URL.createObjectURL(selected));
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const compressed = await compressImage(file);
      const data = await predictSoilType(compressed, coords?.lat, coords?.lon);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      await downloadSoilReport(result, preview ?? undefined, lang);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard" className="text-primary-foreground" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">{t("soilPage.title")}</h1>
        </div>
        <p className="text-sm text-primary-foreground/70">{t("soilPage.subtitle")}</p>
      </div>

      <div className="px-5 -mt-4 space-y-4 pb-6">
        {/* Upload + Analyze */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
            <button
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-secondary/50 p-8 min-h-[180px] transition-colors hover:border-accent"
              aria-label="Upload soil photo"
            >
              {preview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={preview} alt="Uploaded soil" className="h-28 w-28 rounded-2xl object-cover" />
                  <span className="text-sm font-semibold text-success">{file?.name}</span>
                  <span className="text-xs text-muted-foreground">{t("soilPage.tapToChange")}</span>
                </div>
              ) : (
                <>
                  <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Upload className="h-7 w-7 text-accent" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold">{t("soilPage.uploadPrompt")}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t("soilPage.uploadHint")}</div>
                  </div>
                </>
              )}
            </button>
            <Button variant="hero" onClick={handleAnalyze} className="w-full mt-4" disabled={!file || loading}>
              {loading
                ? <><Loader2 className="h-5 w-5 animate-spin" /> {t("soilPage.analyzing")}</>
                : <><FlaskConical className="h-5 w-5" /> {t("soilPage.analyzeSoil")}</>}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-2xl bg-destructive/10 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <span className="text-sm text-destructive font-semibold">{error}</span>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
            {/* Classification result */}
            <Card className="shadow-card border-success/30">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <h3 className="text-lg font-bold">{t("soilPage.result")}</h3>
                </div>
                <div className="rounded-2xl bg-success/10 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-success">{result.soil_type}</div>
                    <div className="text-sm text-muted-foreground mt-1">{t("soilPage.detectedType")}</div>
                  </div>
                  <Badge className="bg-success text-success-foreground border-0 text-sm">
                    {Math.round(result.confidence * 100)}%
                  </Badge>
                </div>
                <ConfidenceBar value={result.confidence} label={t("soilPage.confidence")} />
                <div className="flex justify-end">
                  <Badge className={`border-0 text-xs ${
                    result.certainty === "High Confidence" ? "bg-success/20 text-success"
                    : result.certainty === "Moderate Confidence" ? "bg-accent/20 text-accent"
                    : "bg-destructive/20 text-destructive"
                  }`}>
                    {result.certainty}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI-estimated soil parameters */}
            {result.soil_parameters && (
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Beaker className="h-4 w-4 text-accent" />
                    <h3 className="text-sm font-bold">{t("soilPage.parameters")}</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: FlaskRound, label: t("soilPage.nitrogen"),   value: `${result.soil_parameters.nitrogen} kg/ha`,   color: "text-success" },
                      { icon: FlaskRound, label: t("soilPage.phosphorus"), value: `${result.soil_parameters.phosphorus} kg/ha`, color: "text-accent" },
                      { icon: FlaskRound, label: t("soilPage.potassium"),  value: `${result.soil_parameters.potassium} kg/ha`,  color: "text-info" },
                      { icon: Beaker,     label: t("soilPage.ph"),         value: String(result.soil_parameters.ph),            color: "text-accent" },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div key={label} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-3.5 w-3.5 ${color}`} />
                          <span className="text-sm font-semibold text-muted-foreground">{label}</span>
                        </div>
                        <span className="text-sm font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Environment conditions */}
            {result.environment && (
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Thermometer className="h-4 w-4 text-destructive" />
                    <h3 className="text-sm font-bold">{t("soilPage.environment")}</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: Thermometer, label: t("temperature"),          value: `${result.environment.temperature}°C`, color: "text-destructive" },
                      { icon: Droplets,    label: t("soilPage.humidity"),    value: `${result.environment.humidity}%`,     color: "text-info" },
                      { icon: Droplets,    label: t("soilPage.moisture"),    value: `${result.environment.moisture}%`,     color: "text-info" },
                      { icon: CloudRain,   label: t("soilPage.rainfall"),    value: `${result.environment.rainfall} mm`,   color: "text-info" },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div key={label} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-3.5 w-3.5 ${color}`} />
                          <span className="text-sm font-semibold text-muted-foreground">{label}</span>
                        </div>
                        <span className="text-sm font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Soil properties */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="h-5 w-5 text-accent" />
                  <h3 className="text-sm font-bold">{t("soilPage.properties")}</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: t("soilPage.drainage"),       value: result.properties.drainage },
                    { label: t("soilPage.fertility"),       value: result.properties.fertility },
                    { label: t("soilPage.waterRetention"),  value: result.properties.water_retention },
                    { label: t("soilPage.texture"),         value: result.properties.texture },
                    { label: t("soilPage.phRange"),         value: result.properties.ph_range },
                  ].map((prop) => (
                    <div key={prop.label} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                      <span className="text-sm font-semibold text-muted-foreground">{prop.label}</span>
                      <span className="text-sm font-bold">{prop.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommended crops */}
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="h-5 w-5 text-success" />
                  <h3 className="text-sm font-bold">{t("soilPage.bestCrops")}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.recommendations.crops.map((crop) => (
                    <Badge key={crop} className="bg-success/10 text-success border-0 px-3 py-1">
                      <Sprout className="h-3 w-3 mr-1" /> {crop}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fertilizer & irrigation */}
            <Card className="shadow-card">
              <CardContent className="p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sprout className="h-4 w-4 text-accent" />
                    <h3 className="text-sm font-bold">{t("soilPage.fertilizer")}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.recommendations.fertilizer}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-4 w-4 text-info" />
                    <h3 className="text-sm font-bold">{t("soilPage.irrigation")}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.recommendations.irrigation}</p>
                </div>
              </CardContent>
            </Card>

            {/* Improvement tips */}
            {result.recommendations.improvement_tips.length > 0 && (
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-accent" />
                    <h3 className="text-sm font-bold">{t("soilPage.improvementTips")}</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.recommendations.improvement_tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-accent mt-0.5">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Download Report */}
            <Button
              variant="hero"
              onClick={handleDownloadReport}
              disabled={downloading}
              className="w-full"
            >
              {downloading
                ? <><Loader2 className="h-5 w-5 animate-spin" /> {t("soilPage.generatingPdf")}</>
                : <><Download className="h-5 w-5" /> {t("soilPage.downloadReport")}</>}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
