import { motion } from "framer-motion";
import { CUISINES, DIETARY_OPTIONS, COOK_TIMES, DIFFICULTIES, Dietary, Cuisine, CookTime, Difficulty } from "@/data/meals";
import type { MealType } from "@/data/meals";

interface Filters {
  dietary: Dietary[];
  cuisines: Cuisine[];
  cookTimes: CookTime[];
  difficulties: Difficulty[];
}

interface CriteriaFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onGenerate: () => void;
  canGenerate: boolean;
  missingMealTypes: MealType[];
}

const FilterChip = ({ label, active, onClick }: { label: React.ReactNode; active: boolean; onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-card text-foreground border-border hover:border-primary/40"
    }`}
  >
    {label}
  </motion.button>
);

const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

const toggle = <T,>(arr: T[], val: T): T[] =>
  arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
};

const FlagItaly = () => (
  <svg className="h-3.5 w-5 rounded-[2px] border border-border/40 shadow-sm" viewBox="0 0 36 24" aria-hidden="true">
    <rect width="12" height="24" x="0" y="0" fill="#1B8E3E" />
    <rect width="12" height="24" x="12" y="0" fill="#FFFFFF" />
    <rect width="12" height="24" x="24" y="0" fill="#D6262B" />
  </svg>
);

const FlagMexico = () => (
  <svg className="h-3.5 w-5 rounded-[2px] border border-border/40 shadow-sm" viewBox="0 0 36 24" aria-hidden="true">
    <rect width="12" height="24" x="0" y="0" fill="#0B7A3E" />
    <rect width="12" height="24" x="12" y="0" fill="#FFFFFF" />
    <rect width="12" height="24" x="24" y="0" fill="#C9282D" />
    <circle cx="18" cy="12" r="2.1" fill="#0B7A3E" />
    <circle cx="18" cy="12" r="1.1" fill="#B8860B" />
    <path d="M16.8 11.2 L18 10.2 L19.2 11.2" fill="none" stroke="#5C3A1A" strokeWidth="0.6" strokeLinecap="round" />
    <path d="M16.2 13.6 C17.2 14.3 18.8 14.3 19.8 13.6" fill="none" stroke="#2E7D32" strokeWidth="0.6" strokeLinecap="round" />
  </svg>
);

const FlagUSA = () => (
  <svg className="h-3.5 w-5 rounded-[2px] border border-border/40 shadow-sm" viewBox="0 0 36 24" aria-hidden="true">
    <rect width="36" height="24" x="0" y="0" fill="#B22234" />
    {Array.from({ length: 6 }).map((_, i) => (
      <rect key={i} width="36" height="2" x="0" y={2 + i * 4} fill="#FFFFFF" />
    ))}
    <rect width="16" height="12" x="0" y="0" fill="#3C3B6E" />
  </svg>
);

const FlagIndia = () => (
  <svg className="h-3.5 w-5 rounded-[2px] border border-border/40 shadow-sm" viewBox="0 0 36 24" aria-hidden="true">
    <rect width="36" height="8" x="0" y="0" fill="#FF9933" />
    <rect width="36" height="8" x="0" y="8" fill="#FFFFFF" />
    <rect width="36" height="8" x="0" y="16" fill="#138808" />
    <circle cx="18" cy="12" r="2" fill="#000080" />
  </svg>
);

const cuisineIcon: Record<Cuisine, React.ReactNode> = {
  italian: <FlagItaly />,
  mexican: <FlagMexico />,
  asian: <span className="emoji">🌏</span>,
  american: <FlagUSA />,
  mediterranean: <span className="emoji">🏺</span>,
  indian: <FlagIndia />,
};

export default function CriteriaFilters({ filters, onChange, onGenerate, canGenerate, missingMealTypes }: CriteriaFiltersProps) {
  return (
    <div className="space-y-5 p-5 bg-card rounded-xl border border-border">
      <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
        🎯 Your Preferences
      </h2>

      <FilterSection title="Dietary">
        {DIETARY_OPTIONS.map((d) => (
          <FilterChip key={d.value} label={d.label} active={filters.dietary.includes(d.value)} onClick={() => onChange({ ...filters, dietary: toggle(filters.dietary, d.value) })} />
        ))}
      </FilterSection>

      <FilterSection title="Cuisine">
        {CUISINES.map((c) => (
          <FilterChip
            key={c.value}
            label={
              <span className="inline-flex items-center gap-2">
                {cuisineIcon[c.value]}
                {c.label}
              </span>
            }
            active={filters.cuisines.includes(c.value)}
            onClick={() => onChange({ ...filters, cuisines: toggle(filters.cuisines, c.value) })}
          />
        ))}
      </FilterSection>

      <FilterSection title="Cook Time">
        {COOK_TIMES.map((t) => (
          <FilterChip key={t.value} label={t.label} active={filters.cookTimes.includes(t.value)} onClick={() => onChange({ ...filters, cookTimes: toggle(filters.cookTimes, t.value) })} />
        ))}
      </FilterSection>

      <FilterSection title="Difficulty">
        {DIFFICULTIES.map((d) => (
          <FilterChip key={d.value} label={d.label} active={filters.difficulties.includes(d.value)} onClick={() => onChange({ ...filters, difficulties: toggle(filters.difficulties, d.value) })} />
        ))}
      </FilterSection>

      {missingMealTypes.length > 0 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
          No matches for: {missingMealTypes.map((type) => MEAL_TYPE_LABELS[type]).join(", ")}. Try relaxing filters.
        </div>
      )}

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Generate Full Meal Plan
      </button>
    </div>
  );
}
