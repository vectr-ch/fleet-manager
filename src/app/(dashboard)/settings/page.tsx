"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors",
        checked ? "bg-fleet-green border-fleet-green/30" : "bg-secondary border-input"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <div className="text-[12.5px] text-foreground">{label}</div>
        <div className="font-mono text-[10px] text-subtle mt-0.5">{description}</div>
      </div>
      {children}
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-3">
      <div className="font-mono text-[10px] tracking-wider text-subtle uppercase mb-0.5">{title}</div>
      <div className="text-[11px] text-muted-foreground">{description}</div>
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations("settingsPage");

  const [callsign, setCallsign] = useState("BRAVO-FLEET");
  const [formation, setFormation] = useState("grid");
  const [rtbThreshold, setRtbThreshold] = useState("15");
  const [telemetryRate, setTelemetryRate] = useState("1000");
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [batteryWarnings, setBatteryWarnings] = useState(true);
  const [missionUpdates, setMissionUpdates] = useState(true);
  const [meshAlerts, setMeshAlerts] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [encryptedComms, setEncryptedComms] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass =
    "bg-card border border-input rounded-[5px] px-2.5 py-1 font-mono text-[11px] text-foreground focus:outline-none focus:border-muted w-36";

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
        <div>
          <div className="text-[15px] font-semibold text-foreground tracking-tight">{t("title")}</div>
          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{t("subtitle")}</div>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            "font-mono text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-[5px] font-semibold transition-colors",
            saved
              ? "bg-fleet-green-dim text-fleet-green border border-fleet-green/20"
              : "bg-foreground text-background hover:opacity-90"
          )}
        >
          {saved ? t("saved") : t("save")}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl px-5 py-5 space-y-8">
          {/* General */}
          <section>
            <SectionHeader title={t("general")} description={t("generalDesc")} />
            <div className="bg-card border border-border rounded-[5px] px-4">
              <SettingRow label={t("fleetCallsign")} description="BRAVO-FLEET">
                <input
                  type="text"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  className={inputClass}
                />
              </SettingRow>
              <SettingRow label={t("defaultFormation")} description={t(`formation${formation.charAt(0).toUpperCase() + formation.slice(1)}` as "formationGrid")}>
                <select
                  value={formation}
                  onChange={(e) => setFormation(e.target.value)}
                  className={inputClass}
                >
                  <option value="grid">{t("formationGrid")}</option>
                  <option value="line">{t("formationLine")}</option>
                  <option value="orbit">{t("formationOrbit")}</option>
                </select>
              </SettingRow>
              <SettingRow label={t("batteryRtbThreshold")} description={`${rtbThreshold}%`}>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={rtbThreshold}
                  onChange={(e) => setRtbThreshold(e.target.value)}
                  className={cn(inputClass, "w-20")}
                />
              </SettingRow>
              <SettingRow label={t("telemetryRate")} description={`${telemetryRate}ms`}>
                <select
                  value={telemetryRate}
                  onChange={(e) => setTelemetryRate(e.target.value)}
                  className={inputClass}
                >
                  <option value="500">500ms</option>
                  <option value="1000">1s</option>
                  <option value="2000">2s</option>
                  <option value="5000">5s</option>
                </select>
              </SettingRow>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <SectionHeader title={t("notifications")} description={t("notificationsDesc")} />
            <div className="bg-card border border-border rounded-[5px] px-4">
              <SettingRow label={t("criticalAlerts")} description={t("criticalAlertsDesc")}>
                <Toggle checked={criticalAlerts} onChange={setCriticalAlerts} />
              </SettingRow>
              <SettingRow label={t("batteryWarnings")} description={t("batteryWarningsDesc")}>
                <Toggle checked={batteryWarnings} onChange={setBatteryWarnings} />
              </SettingRow>
              <SettingRow label={t("missionUpdates")} description={t("missionUpdatesDesc")}>
                <Toggle checked={missionUpdates} onChange={setMissionUpdates} />
              </SettingRow>
              <SettingRow label={t("meshAlerts")} description={t("meshAlertsDesc")}>
                <Toggle checked={meshAlerts} onChange={setMeshAlerts} />
              </SettingRow>
            </div>
          </section>

          {/* Security */}
          <section>
            <SectionHeader title={t("security")} description={t("securityDesc")} />
            <div className="bg-card border border-border rounded-[5px] px-4">
              <SettingRow label={t("twoFactor")} description={t("twoFactorDesc")}>
                <Toggle checked={twoFactor} onChange={setTwoFactor} />
              </SettingRow>
              <SettingRow label={t("sessionTimeout")} description={`${sessionTimeout} minutes`}>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className={inputClass}
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </SettingRow>
              <SettingRow label={t("encryptedComms")} description={t("encryptedCommsDesc")}>
                <Toggle checked={encryptedComms} onChange={setEncryptedComms} />
              </SettingRow>
              <SettingRow label={t("auditLogging")} description={t("auditLoggingDesc")}>
                <Toggle checked={auditLogging} onChange={setAuditLogging} />
              </SettingRow>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
