import { motion, AnimatePresence } from "framer-motion";
import { Meal, MealType } from "@/data/meals";
import { Clock } from "lucide-react";

interface MealSuggestionsProps {
  meals: Meal[];
  onSelect: (meal: Meal) => void;
  activeMealType: MealType | null;
}

export default function MealSuggestions({ meals, onSelect, activeMealType }: MealSuggestionsProps) {
  const filtered = activeMealType ? meals.filter((m) => m.mealTypes.includes(activeMealType)) : meals;

  const handleDragStart = (e: React.DragEvent, meal: Meal) => {
    e.dataTransfer.setData("meal-id", meal.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
        🍽️ Suggestions {activeMealType && <span className="text-primary capitalize">for {activeMealType}</span>}
      </h2>
      {!activeMealType && (
        <p className="text-sm text-muted-foreground">Click a slot or drag a meal into your plan</p>
      )}
      <div className="grid gap-2 max-h-[60vh] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">No meals match your filters. Try adjusting your preferences!</p>
          )}
          {filtered.map((meal) => (
            <motion.div
              key={meal.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              draggable
              onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, meal)}
              onClick={() => onSelect(meal)}
              className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors text-left w-full cursor-grab active:cursor-grabbing"
            >
              <span className="text-2xl mt-0.5">{meal.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{meal.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{meal.description}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {meal.cookMinutes}m
                  </span>
                  <span>·</span>
                  <span>{meal.calories} cal</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
