import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DAYS, MEAL_TYPES, Day, MealType, Meal, meals as allMeals } from "@/data/meals";
import { Clock, Minus, Plus, X } from "lucide-react";

export type PlanSlot = { day: Day; mealType: MealType };
export type PlanEntry = { meal: Meal; servings: number };
export type MealPlan = Record<string, PlanEntry | null>;

const slotKey = (day: Day, mealType: MealType) => `${day}-${mealType}`;

interface MealPlanGridProps {
  plan: MealPlan;
  activeSlot: PlanSlot | null;
  onSlotClick: (slot: PlanSlot) => void;
  onRemove: (slot: PlanSlot) => void;
  onDropMeal: (slot: PlanSlot, meal: Meal) => void;
  onServingsChange: (slot: PlanSlot, servings: number) => void;
}

const mealTypeLabel: Record<MealType, string> = {
  breakfast: "🌅 Breakfast",
  lunch: "☀️ Lunch",
  dinner: "🌙 Dinner",
};

export default function MealPlanGrid({ plan, activeSlot, onSlotClick, onRemove, onDropMeal, onServingsChange }: MealPlanGridProps) {
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOverSlot(key);
  };

  const handleDragLeave = () => setDragOverSlot(null);

  const handleDrop = (e: React.DragEvent, day: Day, mealType: MealType) => {
    e.preventDefault();
    setDragOverSlot(null);
    const mealId = e.dataTransfer.getData("meal-id");
    const meal = allMeals.find((m) => m.id === mealId);
    if (meal) onDropMeal({ day, mealType }, meal);
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header */}
        <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-1.5 mb-1.5">
          <div />
          {DAYS.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Rows */}
        {MEAL_TYPES.map((mealType) => (
          <div key={mealType} className="grid grid-cols-[100px_repeat(7,1fr)] gap-1.5 mb-1.5">
            <div className="flex items-center text-xs font-medium text-muted-foreground">
              {mealTypeLabel[mealType]}
            </div>
            {DAYS.map((day) => {
              const key = slotKey(day, mealType);
              const entry = plan[key];
              const meal = entry?.meal;
              const servings = entry?.servings ?? 1;
              const isActive = activeSlot?.day === day && activeSlot?.mealType === mealType;
              const isDragOver = dragOverSlot === key;

              return (
                <div
                  key={key}
                  onDragOver={(e) => handleDragOver(e, key)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day, mealType)}
                  onClick={() => (!meal ? onSlotClick({ day, mealType }) : undefined)}
                  className={`relative rounded-lg p-2 min-h-[90px] text-left transition-all border cursor-pointer ${
                    isDragOver
                      ? "border-primary bg-primary/15 ring-2 ring-primary/40 scale-[1.03]"
                      : isActive
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : meal
                      ? "border-secondary/50 bg-secondary/10 hover:border-secondary"
                      : "border-border bg-card hover:border-primary/30 border-dashed"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {meal ? (
                      <motion.div
                        key={meal.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center justify-center h-full gap-0.5 relative"
                      >
                        {/* Remove button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemove({ day, mealType }); }}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100"
                          style={{ opacity: undefined }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                        >
                          <X className="w-3 h-3" />
                        </button>

                        <span className="text-lg">{meal.emoji}</span>
                        <span className="text-[10px] font-medium text-center leading-tight line-clamp-2">{meal.name}</span>
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{meal.cookMinutes}m</span>
                          <span>·</span>
                          <span>{meal.calories * servings / 1}cal</span>
                        </div>

                        {/* Servings */}
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); if (servings > 1) onServingsChange({ day, mealType }, servings - 1); }}
                            className="w-4 h-4 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-[10px] font-semibold min-w-[20px] text-center">{servings}p</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); if (servings < 12) onServingsChange({ day, mealType }, servings + 1); }}
                            className="w-4 h-4 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.span
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center h-full text-muted-foreground/40 text-lg"
                      >
                        +
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export { slotKey };
