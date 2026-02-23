import { motion } from "framer-motion";
import { CUISINES, DIETARY_OPTIONS, COOK_TIMES, DIFFICULTIES, Dietary, Cuisine, CookTime, Difficulty } from "@/data/meals";

interface Filters {
  dietary: Dietary[];
  cuisines: Cuisine[];
  cookTimes: CookTime[];
  difficulties: Difficulty[];
}

interface CriteriaFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
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

export default function CriteriaFilters({ filters, onChange }: CriteriaFiltersProps) {
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
          <FilterChip key={c.value} label={`${c.emoji} ${c.label}`} active={filters.cuisines.includes(c.value)} onClick={() => onChange({ ...filters, cuisines: toggle(filters.cuisines, c.value) })} />
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
    </div>
  );
}
