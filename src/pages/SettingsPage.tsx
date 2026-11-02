import { ArrowLeft, Check, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLang, type Lang } from "@/i18n/LanguageContext";

const LANGUAGES: { code: Lang; label: string; nativeLabel: string; flag: string; desc: string }[] = [
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    flag: "🇬🇧",
    desc: "Use the app in English",
  },
  {
    code: "ta",
    label: "Tamil",
    nativeLabel: "தமிழ்",
    flag: "🇮🇳",
    desc: "பயன்பாட்டை தமிழில் பயன்படுத்துங்கள்",
  },
];

export default function SettingsPage() {
  const { lang, setLang, t } = useLang();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary px-5 pb-6 pt-6 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-1">
          <Link to="/dashboard" className="text-primary-foreground" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary-foreground">
            {t("settingsPage.title")}
          </h1>
        </div>
        <p className="text-sm text-primary-foreground/70 ml-9">
          {t("settingsPage.subtitle")}
        </p>
      </div>

      <div className="px-5 -mt-4 space-y-4 pb-8">
        {/* Language Section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-card">
            <CardContent className="p-5">
              {/* Section header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold">{t("settingsPage.languageSection")}</div>
                  <div className="text-xs text-muted-foreground">{t("languageDesc")}</div>
                </div>
              </div>

              {/* Language cards */}
              <div className="grid grid-cols-2 gap-3">
                {LANGUAGES.map((l) => {
                  const active = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                        active
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border bg-secondary/50 hover:border-primary/40"
                      }`}
                      aria-label={`Select ${l.label}`}
                    >
                      {/* Active checkmark */}
                      {active && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </motion.div>
                      )}

                      {/* Flag emoji */}
                      <span className="text-4xl">{l.flag}</span>

                      {/* Labels */}
                      <div className="text-center">
                        <div className="text-sm font-bold">{l.nativeLabel}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{l.label}</div>
                      </div>

                      {/* Description */}
                      <div className="text-[10px] text-center text-muted-foreground leading-relaxed">
                        {l.desc}
                      </div>

                      {/* Active pill */}
                      {active && (
                        <div className="mt-1 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground">
                          {t("settingsPage.currentLang")}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Live preview card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="shadow-card border-primary/20">
            <CardContent className="p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                {t("settingsPage.preview")}
              </div>
              <div className="space-y-2">
                {[
                  { en: "Soil Health & Fertilizer", key: "features.soil.title" },
                  { en: "Pest & Disease Detection", key: "features.pest.title" },
                  { en: "Weather Alerts",            key: "features.weather.title" },
                  { en: "Market Prices",             key: "features.market.title" },
                  { en: "Voice Advisory",            key: "features.voice.title" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                    <span className="text-xs text-muted-foreground">{item.en}</span>
                    <span className="text-xs font-bold text-primary">{t(item.key)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
