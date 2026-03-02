import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Meal, MealType } from "@/data/meals";
import { ChefHat, Clock, Flame } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MealSuggestionsProps {
  meals: Meal[];
  onSelect: (meal: Meal) => void;
  activeMealType: MealType | null;
}

export default function MealSuggestions({ meals, onSelect, activeMealType }: MealSuggestionsProps) {
  const filtered = activeMealType ? meals.filter((m) => m.mealTypes.includes(activeMealType)) : meals;
  const [overviewMeal, setOverviewMeal] = useState<Meal | null>(null);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const draggingRef = useRef(false);

  const handleDragStart = (e: React.DragEvent, meal: Meal) => {
    draggingRef.current = true;
    e.dataTransfer.setData("meal-id", meal.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = () => {
    requestAnimationFrame(() => {
      draggingRef.current = false;
    });
  };

  const handleCardClick = (meal: Meal) => {
    if (draggingRef.current) return;
    setOverviewMeal(meal);
    setOverviewOpen(true);
  };

  const handleAddFromOverview = () => {
    if (!overviewMeal) return;
    onSelect(overviewMeal);
    setOverviewOpen(false);
  };

  return (
    <div className="space-y-2 flex flex-col h-full">
      <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
        🍽️ Suggestions {activeMealType && <span className="text-primary capitalize">for {activeMealType}</span>}
      </h2>
      {!activeMealType && (
        <p className="text-sm text-muted-foreground">Click a slot or drag a meal into your plan</p>
      )}
      <div className="grid gap-2 flex-1 min-h-0 overflow-y-auto pr-1">
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
              onDragEnd={handleDragEnd}
              onClick={() => handleCardClick(meal)}
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

      <Dialog
        open={overviewOpen}
        onOpenChange={(open) => {
          setOverviewOpen(open);
          if (!open) setOverviewMeal(null);
        }}
      >
        {overviewMeal && (
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{overviewMeal.emoji}</span>
                {overviewMeal.name}
              </DialogTitle>
              <DialogDescription>{overviewMeal.description}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {overviewMeal.cookMinutes} min
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-1 text-xs">
                  <Flame className="h-3 w-3" />
                  {overviewMeal.calories} cal
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-1 text-xs capitalize">
                  <ChefHat className="h-3 w-3" />
                  {overviewMeal.difficulty}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-1 text-xs capitalize">
                  {overviewMeal.cuisine}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {overviewMeal.dietary.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium capitalize text-secondary-foreground"
                  >
                    {tag.replace("-", " ")}
                  </span>
                ))}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Ingredients</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {overviewMeal.ingredients.map((ingredient) => (
                    <span
                      key={ingredient.name}
                      className="rounded-full border border-border bg-background px-2 py-1 text-xs"
                    >
                      {ingredient.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              {activeMealType ? (
                <button
                  type="button"
                  onClick={handleAddFromOverview}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Add to selected slot
                </button>
              ) : (
                <span className="text-xs text-muted-foreground">Select a slot to add this meal.</span>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
