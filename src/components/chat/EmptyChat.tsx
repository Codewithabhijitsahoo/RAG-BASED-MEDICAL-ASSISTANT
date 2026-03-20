import { Activity, Stethoscope, Pill, HeartPulse } from "lucide-react";

const suggestions = [
  { icon: Stethoscope, text: "What are common symptoms of seasonal allergies?" },
  { icon: Pill, text: "What's the difference between ibuprofen and acetaminophen?" },
  { icon: HeartPulse, text: "How can I lower my blood pressure naturally?" },
];

interface Props {
  onSuggestionClick: (text: string) => void;
}

export function EmptyChat({ onSuggestionClick }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Activity className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">How can I help you today?</h2>
      <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
        Ask any health-related question. I'll provide evidence-based information to help you understand.
      </p>
      <div className="mt-8 grid w-full max-w-lg gap-3">
        {suggestions.map((s) => (
          <button
            key={s.text}
            onClick={() => onSuggestionClick(s.text)}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left text-sm text-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 active:scale-[0.98]"
          >
            <s.icon className="h-5 w-5 shrink-0 text-primary/70" />
            <span>{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
