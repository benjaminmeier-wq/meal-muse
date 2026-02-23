import { motion, AnimatePresence } from "framer-motion";
import { DAYS, MEAL_TYPES, Day, MealType, Meal } from "@/data/meals";

export type PlanSlot = { day: Day; mealType: MealType };
export type MealPlan = Record<string, Meal | null>;

const slotKey = (day: Day, mealType: MealType) => `${day}-${mealType}`;

interface MealPlanGridProps {
  plan: MealPlan;
  activeSlot: PlanSlot | null;
  onSlotClick: (slot: PlanSlot) => void;
  onRemove: (slot: PlanSlot) => void;
}

const mealTypeLabel: Record<MealType, string> = {
  breakfast: "🌅 Breakfast",
  lunch: "☀️ Lunch",
  dinner: "🌙 Dinner",
};

export default function MealPlanGrid({ plan, activeSlot, onSlotClick, onRemove }: MealPlanGridProps) {
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
              const meal = plan[key];
              const isActive = activeSlot?.day === day && activeSlot?.mealType === mealType;

              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => (meal ? onRemove({ day, mealType }) : onSlotClick({ day, mealType }))}
                  className={`relative rounded-lg p-2 min-h-[72px] text-left transition-all border ${
                    isActive
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
                        className="flex flex-col items-center justify-center h-full gap-0.5"
                      >
                        <span className="text-xl">{meal.emoji}</span>
                        <span className="text-[10px] font-medium text-center leading-tight line-clamp-2">{meal.name}</span>
                        <span className="text-[9px] text-muted-foreground">{meal.calories}cal</span>
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
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export { slotKey };
