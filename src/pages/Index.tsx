import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, ShoppingCart, Sun } from "lucide-react";
import { meals, Meal, Dietary, Cuisine, CookTime, Difficulty, DAYS, MEAL_TYPES } from "@/data/meals";
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

const ESTIMATED_INGREDIENT_COST: Record<string, number> = {
  rice: 0.45,
  spaghetti: 0.6,
  eggs: 0.45,
  onion: 0.4,
  garlic: 0.2,
  "canned tomatoes": 1.2,
  "black beans": 1.1,
  chickpeas: 1.1,
  carrots: 0.35,
  "bell pepper": 0.9,
  "chicken breast": 2.2,
  "olive oil": 0.25,
  "soy sauce": 0.2,
  cilantro: 0.4,
  salsa: 0.6,
  potatoes: 0.6,
};

const normalizeIngredient = (name: string) => name.trim().toLowerCase();

const Index = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("meal-muse-theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
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

  const rankedMeals = useMemo(() => {
    const plannedIngredients = new Set(
      Object.values(plan)
        .flatMap((entry) => entry?.meal.ingredients.map((ingredient) => normalizeIngredient(ingredient.name)) ?? [])
    );

    const scoreMeal = (meal: Meal) => {
      const normalizedIngredients = meal.ingredients.map((ingredient) => normalizeIngredient(ingredient.name));
      const estimatedCost = normalizedIngredients.reduce(
        (sum, ingredient) => sum + (ESTIMATED_INGREDIENT_COST[ingredient] ?? 1.7),
        0
      );
      const overlapCount = normalizedIngredients.filter((ingredient) => plannedIngredients.has(ingredient)).length;
      const speedBonus = meal.cookTime === "quick" ? 0.5 : meal.cookTime === "medium" ? 0.2 : 0;
      const easeBonus = meal.difficulty === "easy" ? 0.35 : meal.difficulty === "medium" ? 0.15 : 0;

      return overlapCount * 1.4 + speedBonus + easeBonus - estimatedCost * 0.45;
    };

    return [...filteredMeals].sort((a, b) => {
      const scoreDiff = scoreMeal(b) - scoreMeal(a);
      if (Math.abs(scoreDiff) > 0.01) return scoreDiff;
      if (a.cookMinutes !== b.cookMinutes) return a.cookMinutes - b.cookMinutes;
      return a.name.localeCompare(b.name);
    });
  }, [filteredMeals, plan]);

  const missingMealTypes = useMemo(() => {
    return MEAL_TYPES.filter((mealType) => !filteredMeals.some((meal) => meal.mealTypes.includes(mealType)));
  }, [filteredMeals]);

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

  const handleGeneratePlan = useCallback(() => {
    const byType = MEAL_TYPES.reduce<Record<string, Meal[]>>((acc, mealType) => {
      acc[mealType] = rankedMeals.filter((meal) => meal.mealTypes.includes(mealType));
      return acc;
    }, {});

    const nextPlan: MealPlan = {};
    MEAL_TYPES.forEach((mealType, typeIndex) => {
      const list = byType[mealType] ?? [];
      if (list.length === 0) return;
      DAYS.forEach((day, dayIndex) => {
        const meal = list[(dayIndex + typeIndex) % list.length];
        nextPlan[slotKey(day, mealType)] = { meal, servings: 1 };
      });
    });

    setPlan(nextPlan);
    setActiveSlot(null);
  }, [rankedMeals]);

  const filledCount = Object.values(plan).filter(Boolean).length;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem("meal-muse-theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-6 2xl:px-10 py-4 flex flex-wrap items-center gap-4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            🥘 Mealwise
          </motion.h1>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition hover:bg-muted"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
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

      <main className="w-full px-6 2xl:px-10 py-5">
        <div className="grid 2xl:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_320px] gap-3 items-start">
          <div className="space-y-4 min-w-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <CriteriaFilters
                filters={filters}
                onChange={setFilters}
                onGenerate={handleGeneratePlan}
                canGenerate={rankedMeals.length > 0}
                missingMealTypes={missingMealTypes}
              />
            </motion.div>

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
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:sticky xl:top-16"
          >
            <MealSuggestions
              meals={rankedMeals}
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
