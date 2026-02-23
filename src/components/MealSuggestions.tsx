import { motion, AnimatePresence } from "framer-motion";
import { Meal, MealType } from "@/data/meals";

interface MealSuggestionsProps {
  meals: Meal[];
  onSelect: (meal: Meal) => void;
  activeMealType: MealType | null;
}

export default function MealSuggestions({ meals, onSelect, activeMealType }: MealSuggestionsProps) {
  const filtered = activeMealType ? meals.filter((m) => m.mealTypes.includes(activeMealType)) : meals;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
        🍽️ Suggestions {activeMealType && <span className="text-primary capitalize">for {activeMealType}</span>}
      </h2>
      {!activeMealType && (
        <p className="text-sm text-muted-foreground">Click an empty slot in your plan to see matching suggestions</p>
      )}
      <div className="grid gap-2 max-h-[60vh] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No meals match your filters. Try adjusting your preferences!</p>
          )}
          {filtered.map((meal) => (
            <motion.button
              key={meal.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(meal)}
              className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors text-left w-full"
            >
              <span className="text-2xl mt-0.5">{meal.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{meal.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{meal.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{meal.calories} cal</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
