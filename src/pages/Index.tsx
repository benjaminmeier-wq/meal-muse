import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { meals, Meal, Dietary, Cuisine, CookTime, Difficulty } from "@/data/meals";
import CriteriaFilters from "@/components/CriteriaFilters";
import MealSuggestions from "@/components/MealSuggestions";
import MealPlanGrid, { PlanSlot, MealPlan, slotKey } from "@/components/MealPlanGrid";
import GroceryList from "@/components/GroceryList";

interface Filters {
  dietary: Dietary[];
  cuisines: Cuisine[];
  cookTimes: CookTime[];
  difficulties: Difficulty[];
}

const Index = () => {
  const [filters, setFilters] = useState<Filters>({
    dietary: [],
    cuisines: [],
    cookTimes: [],
    difficulties: [],
  });
  const [plan, setPlan] = useState<MealPlan>({});
  const [activeSlot, setActiveSlot] = useState<PlanSlot | null>(null);
  const [groceryOpen, setGroceryOpen] = useState(false);

  const filteredMeals = useMemo(() => {
    return meals.filter((m) => {
      if (filters.dietary.length > 0 && !filters.dietary.some((d) => m.dietary.includes(d))) return false;
      if (filters.cuisines.length > 0 && !filters.cuisines.includes(m.cuisine)) return false;
      if (filters.cookTimes.length > 0 && !filters.cookTimes.includes(m.cookTime)) return false;
      if (filters.difficulties.length > 0 && !filters.difficulties.includes(m.difficulty)) return false;
      return true;
    });
  }, [filters]);

  const handleSlotClick = useCallback((slot: PlanSlot) => {
    setActiveSlot(slot);
  }, []);

  const handleRemove = useCallback((slot: PlanSlot) => {
    setPlan((prev) => {
      const next = { ...prev };
      delete next[slotKey(slot.day, slot.mealType)];
      return next;
    });
  }, []);

  const handleSelectMeal = useCallback(
    (meal: Meal) => {
      if (!activeSlot) return;
      setPlan((prev) => ({ ...prev, [slotKey(activeSlot.day, activeSlot.mealType)]: { meal, servings: 1 } }));
      setActiveSlot(null);
    },
    [activeSlot]
  );

  const handleDropMeal = useCallback((slot: PlanSlot, meal: Meal) => {
    setPlan((prev) => ({ ...prev, [slotKey(slot.day, slot.mealType)]: { meal, servings: 1 } }));
    setActiveSlot(null);
  }, []);

  const handleServingsChange = useCallback((slot: PlanSlot, servings: number) => {
    setPlan((prev) => {
      const key = slotKey(slot.day, slot.mealType);
      const entry = prev[key];
      if (!entry) return prev;
      return { ...prev, [key]: { ...entry, servings } };
    });
  }, []);

  const handleClearAll = () => {
    setPlan({});
    setActiveSlot(null);
  };

  const filledCount = Object.values(plan).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            🥘 Mealwise
          </motion.h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {filledCount}/21 meals planned
            </span>
            {filledCount > 0 && (
              <>
                <button
                  onClick={() => setGroceryOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Grocery List
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-destructive hover:underline"
                >
                  Clear all
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <CriteriaFilters filters={filters} onChange={setFilters} />
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <MealPlanGrid
              plan={plan}
              activeSlot={activeSlot}
              onSlotClick={handleSlotClick}
              onRemove={handleRemove}
              onDropMeal={handleDropMeal}
              onServingsChange={handleServingsChange}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <MealSuggestions
              meals={filteredMeals}
              onSelect={handleSelectMeal}
              activeMealType={activeSlot?.mealType ?? null}
            />
          </motion.div>
        </div>
      </main>

      <GroceryList plan={plan} open={groceryOpen} onClose={() => setGroceryOpen(false)} />
    </div>
  );
};

export default Index;
