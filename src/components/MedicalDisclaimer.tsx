import { AlertTriangle } from "lucide-react";

export function MedicalDisclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-warning-border bg-warning-bg px-4 ${compact ? "py-2.5 text-xs" : "py-3.5 text-sm"}`}
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-text" />
      <p className="text-warning-text leading-relaxed">
        This chatbot provides informational content only and is not a substitute for professional medical advice.{" "}
        {!compact && <strong>Always consult a qualified healthcare provider for medical decisions.</strong>}
      </p>
    </div>
  );
}
